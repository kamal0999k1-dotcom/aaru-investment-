import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Rect, Text, Transformer } from 'react-konva';
import useImage from 'use-image';
import { 
  MousePointer2, 
  TrendingUp, 
  Type, 
  Square, 
  Trash2, 
  Undo2, 
  Download,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface ChartEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

type Tool = 'select' | 'line' | 'rect' | 'text';

interface Shape {
  id: string;
  type: Tool;
  points?: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
}

export const ChartEditor: React.FC<ChartEditorProps> = ({ imageUrl, onSave, onCancel }) => {
  const [image] = useImage(imageUrl);
  const [tool, setTool] = useState<Tool>('select');
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);

  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle stage resizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && image) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        
        const imgWidth = image.width;
        const imgHeight = image.height;
        
        const ratio = Math.min(containerWidth / imgWidth, containerHeight / imgHeight);
        
        setStageSize({
          width: imgWidth * ratio,
          height: imgHeight * ratio
        });
        setScale(ratio);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [image]);

  const handleMouseDown = (e: any) => {
    if (tool === 'select') {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        setSelectedId(null);
      }
      return;
    }

    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    const id = `shape-${Date.now()}`;
    
    if (tool === 'line') {
      setShapes([...shapes, { id, type: 'line', points: [pos.x, pos.y, pos.x, pos.y], color: '#22d3ee' }]);
    } else if (tool === 'rect') {
      setShapes([...shapes, { id, type: 'rect', x: pos.x, y: pos.y, width: 0, height: 0, color: 'rgba(34, 211, 238, 0.2)' }]);
    } else if (tool === 'text') {
      const text = prompt('Enter annotation:');
      if (text) {
        setShapes([...shapes, { id, type: 'text', x: pos.x, y: pos.y, text, color: '#facc15' }]);
      }
      setIsDrawing(false);
      setTool('select');
    }
    
    setSelectedId(id);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing || tool === 'select') return;

    const pos = e.target.getStage().getPointerPosition();
    const newShapes = shapes.slice();
    const lastShape = newShapes[newShapes.length - 1];

    if (tool === 'line') {
      lastShape.points = [lastShape.points![0], lastShape.points![1], pos.x, pos.y];
    } else if (tool === 'rect') {
      lastShape.width = pos.x - lastShape.x!;
      lastShape.height = pos.y - lastShape.y!;
    }

    setShapes(newShapes);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (tool !== 'select') {
      setTool('select');
    }
  };

  const handleUndo = () => {
    setShapes(shapes.slice(0, -1));
    setSelectedId(null);
  };

  const handleClear = () => {
    setShapes([]);
    setSelectedId(null);
  };

  const handleExport = () => {
    if (stageRef.current) {
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
      onSave(dataUrl);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/40 rounded-3xl overflow-hidden border border-white/10 backdrop-blur-xl animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool('select')}
            className={`p-2 rounded-lg transition-all ${tool === 'select' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:bg-white/5'}`}
            title="Select"
          >
            <MousePointer2 size={20} />
          </button>
          <button
            onClick={() => setTool('line')}
            className={`p-2 rounded-lg transition-all ${tool === 'line' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:bg-white/5'}`}
            title="Trendline"
          >
            <TrendingUp size={20} />
          </button>
          <button
            onClick={() => setTool('rect')}
            className={`p-2 rounded-lg transition-all ${tool === 'rect' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:bg-white/5'}`}
            title="Range Selector"
          >
            <Square size={20} />
          </button>
          <button
            onClick={() => setTool('text')}
            className={`p-2 rounded-lg transition-all ${tool === 'text' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:bg-white/5'}`}
            title="Annotation"
          >
            <Type size={20} />
          </button>
          <div className="w-px h-6 bg-white/10 mx-2" />
          <button
            onClick={handleUndo}
            disabled={shapes.length === 0}
            className="p-2 rounded-lg text-gray-400 hover:bg-white/5 disabled:opacity-30 transition-all"
            title="Undo"
          >
            <Undo2 size={20} />
          </button>
          <button
            onClick={handleClear}
            disabled={shapes.length === 0}
            className="p-2 rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-30 transition-all"
            title="Clear All"
          >
            <Trash2 size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-all flex items-center gap-2"
          >
            <XCircle size={18} />
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
          >
            <CheckCircle2 size={18} />
            Apply & Analyze
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div ref={containerRef} className="flex-1 relative bg-black/40 flex items-center justify-center p-4 min-h-[500px]">
        {!image && (
          <div className="flex flex-col items-center gap-4 text-gray-500">
            <div className="animate-spin h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
            <p className="text-xs font-bold uppercase tracking-widest">Loading Chart...</p>
          </div>
        )}
        
        {image && (
          <Stage
            width={stageSize.width}
            height={stageSize.height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            ref={stageRef}
            className="shadow-2xl rounded-lg overflow-hidden"
          >
            <Layer>
              <KonvaImage
                image={image}
                width={stageSize.width}
                height={stageSize.height}
              />
              {shapes.map((shape) => {
                if (shape.type === 'line') {
                  return (
                    <Line
                      key={shape.id}
                      points={shape.points}
                      stroke={shape.color}
                      strokeWidth={3}
                      tension={0.5}
                      lineCap="round"
                      draggable={tool === 'select'}
                      onClick={() => tool === 'select' && setSelectedId(shape.id)}
                    />
                  );
                }
                if (shape.type === 'rect') {
                  return (
                    <Rect
                      key={shape.id}
                      x={shape.x}
                      y={shape.y}
                      width={shape.width}
                      height={shape.height}
                      fill={shape.color}
                      stroke="#22d3ee"
                      strokeWidth={1}
                      draggable={tool === 'select'}
                      onClick={() => tool === 'select' && setSelectedId(shape.id)}
                    />
                  );
                }
                if (shape.type === 'text') {
                  return (
                    <Text
                      key={shape.id}
                      x={shape.x}
                      y={shape.y}
                      text={shape.text}
                      fontSize={16}
                      fill={shape.color}
                      fontStyle="bold"
                      draggable={tool === 'select'}
                      onClick={() => tool === 'select' && setSelectedId(shape.id)}
                    />
                  );
                }
                return null;
              })}
            </Layer>
          </Stage>
        )}
      </div>

      <div className="p-4 bg-black/20 border-t border-white/5">
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            Trendlines
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-cyan-400/20 border border-cyan-400" />
            Range Selectors
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            Annotations
          </div>
        </div>
      </div>
    </div>
  );
};
