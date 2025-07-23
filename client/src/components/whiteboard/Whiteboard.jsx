import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { FaPen, FaEraser } from 'react-icons/fa';
import clsx from 'clsx';

const Whiteboard = () => {
  const [lines, setLines] = useState([]);
  const [tool, setTool] = useState('pen');
  const [strokeColor, setStrokeColor] = useState('#ffffff');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const containerRef = useRef(null);
  const isDrawing = useRef(false);

  const colors = ['#ffffff', '#ef4444', '#34d399', '#60a5fa', '#f59e0b'];

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y], color: strokeColor }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
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

      {/* Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 w-full relative bg-gray-950"
        style={{ height: `calc(100vh - ${toolbarHeight}px)` }}
      >
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
      </div>
    </div>
  );
};

export default Whiteboard;
