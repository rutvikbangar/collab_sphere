import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { FaPen, FaEraser, FaDownload } from 'react-icons/fa';
import clsx from 'clsx';
import { v4 as uuidv4 } from 'uuid';
import io from "socket.io-client"


const socket = io('https://collab-sphere-server.onrender.com');

const Whiteboard = ({ roomId }) => {
  const [lines, setLines] = useState([]);
  const [tool, setTool] = useState('pen');
  const [strokeColor, setStrokeColor] = useState('#ffffff');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const containerRef = useRef(null);
  const isDrawing = useRef(false);
  const socketRef = useRef(null);
  const stage = useRef(null);

  const colors = ['#ffffff', '#ef4444', '#34d399', '#60a5fa', '#f59e0b'];



   useEffect(() => {
    if (!roomId) return;
    socket.emit('join-room', roomId);

    socket.on('initial-strokes', (strokes) => {
      setLines(strokes);
    });

    socket.on('receive-line', (line) => {
      setLines((prevLines) => [...prevLines, line]);
    });

    setIsLoading(false);
    return () => {
      socket.off('initial-strokes');
      socket.off('receive-line'); 
    };
  }, [roomId]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;
        
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
}, []); 

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    const newLine = {
      tool,
      points: [pos.x, pos.y],
      color: strokeColor,
      strokeId: uuidv4(),
      strokeWidth: tool === 'pen' ? 3 : 20
    };
    setLines([...lines, newLine]);
  };


  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    const newLines = [...lines.slice(0, -1), lastLine];
    setLines(newLines);
  };


  const handleMouseUp = () => {
    isDrawing.current = false;
    if (lines.length > 0) {
      socket.emit('draw-line', { roomId, line: lines[lines.length - 1] });
    }
  };

  const handleDownload = () => {
    const uri = stage.current.toDataURL();
    const link = document.createElement('a');
    link.download = `whiteboard-${roomId}-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toolbarHeight = 70;
  return (
    <div className="w-full h-full overflow-hidden bg-gray-900 flex flex-col">
      {/* Top Toolbar */}
      <div
        className="w-full bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700"
        style={{ height: toolbarHeight }}
      >
        {/* Tool Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setTool('pen')}
            className={clsx(
              'px-4 py-2 rounded-md flex items-center gap-2 transition-colors',
              tool === 'pen' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            )}
          >
            <FaPen /> Pen
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={clsx(
              'px-4 py-2 rounded-md flex items-center gap-2 transition-colors',
              tool === 'eraser' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            )}
          >
            <FaEraser /> Eraser
          </button>
        </div>

        {/* Center Color Picker */}
        <div className="flex gap-2">
          {colors.map((color) => (
            <div
              key={color}
              className={clsx(
                'w-7 h-7 rounded-full cursor-pointer border-2 transition-transform',
                strokeColor === color
                  ? 'border-blue-400 scale-110'
                  : 'border-transparent hover:scale-105'
              )}
              style={{ backgroundColor: color }}
              onClick={() => setStrokeColor(color)}
            />
          ))}
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="px-4 py-2 rounded-md flex items-center gap-2 transition-colors text-gray-300 hover:bg-gray-700"
        >
          <FaDownload /> Save
        </button>
      </div>

      {/* Canvas Area Container */}
      <div
        ref={containerRef}
        className="relative bg-gray-950 flex items-center justify-center"
        style={{
          height: `calc(100vh - ${toolbarHeight}px)`,
          width: '100%',
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: 'auto',
        }}
      >
        {/* Conditionally render Stage or Loading text */}
        {isLoading || dimensions.width === 0 ? (
          <p className="text-white text-center">Loading...</p>
        ) : (
          <Stage
            ref={stage}
            width={dimensions.width}
            height={dimensions.height}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            <Layer>
              {lines.map((line, i) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke={line.color}
                  strokeWidth={line.tool === 'pen' ? 3 : 20}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={
                    line.tool === 'eraser' ? 'destination-out' : 'source-over'
                  }
                />
              ))}
            </Layer>
          </Stage>
        )}
      </div>
    </div>
  );
};

export default Whiteboard;
