import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { FaPen, FaEraser } from 'react-icons/fa';
import { fetchStrokes, deleteStrokes, saveStrokes } from "../../api-service/api.js"
import clsx from 'clsx';
import { v4 as uuidv4 } from 'uuid';
const Whiteboard = ({ roomId }) => {
  const [lines, setLines] = useState([]);
  const [tool, setTool] = useState('pen');
  const [strokeColor, setStrokeColor] = useState('#ffffff');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const containerRef = useRef(null);
  const isDrawing = useRef(false);

  const colors = ['#ffffff', '#ef4444', '#34d399', '#60a5fa', '#f59e0b'];



  useEffect(() => {
    const loadStrokes = async () => {
      if (!roomId) return;
      setIsLoading(true);
      try {
        const fetchedStrokes = await fetchStrokes(roomId);
        if (Array.isArray(fetchedStrokes)) {
          const mappedLines = fetchedStrokes.map(stroke => ({
            tool: stroke.tool,
            points: stroke.points,
            color: stroke.color,
          }));
          setLines(mappedLines);
        } else {
          setLines([]);
        }
      } catch (error) {
        console.error("Failed to load strokes:", error);
        setLines([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStrokes();
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



  const handleSave = async () => {
    if (!roomId) return;

    await deleteStrokes(roomId); // Delete old strokes

    for (let stroke of lines) {
      const strokeId = uuidv4();
      await saveStrokes(
        roomId,
        strokeId,
        stroke.points,
        stroke.color,
        stroke.tool,
        stroke.tool === 'pen' ? 3 : 20
      );
    }

  };
  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y], color: strokeColor }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const allButLast = lines.slice(0, -1);

    const updatedLastLine = {
      ...lines[lines.length - 1],
      points: lines[lines.length - 1].points.concat([point.x, point.y]),
    };

    setLines([...allButLast, updatedLastLine]);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
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
        <button
          onClick={handleSave}
          className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save
        </button>

        {/* Color Picker */}
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
