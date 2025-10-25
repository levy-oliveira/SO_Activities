// front-end/src/GanttChart.tsx
import React from 'react';
import type { ResultadoSimulacao } from './interfaces'; // importação de tipo
import './App.css'; 

// ... (todo o resto do arquivo permanece igual)
interface GanttBlock {
  processId: number | null;
  duration: number;
  startTime: number;
}
export const getColor = (id: number | null) => {
  if (id === null) return '#333'; 
  const colors = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
    '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
    '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000',
  ];
  return colors[(id - 1) % colors.length];
};
const compressDiagram = (
  diagram: ResultadoSimulacao['diagramaTempo']
): GanttBlock[] => {
  if (diagram.length === 0) return [];
  const compressed: GanttBlock[] = [];
  let lastBlock: GanttBlock = {
    processId: diagram[0].processId,
    duration: 0,
    startTime: diagram[0].time,
  };
  for (const tick of diagram) {
    if (tick.processId !== lastBlock.processId) {
      if (lastBlock.duration > 0) {
        compressed.push(lastBlock);
      }
      lastBlock = {
        processId: tick.processId,
        duration: 1,
        startTime: tick.time,
      };
    } else {
      lastBlock.duration++;
    }
  }
  compressed.push(lastBlock); 
  return compressed;
};
interface GanttChartProps {
  diagram: ResultadoSimulacao['diagramaTempo'];
}
const GanttChart: React.FC<GanttChartProps> = ({ diagram }) => {
  const compressedBlocks = compressDiagram(diagram);
  const totalDuration = compressedBlocks.reduce((sum, b) => sum + b.duration, 0);
  return (
    <div className="gantt-container">
      <h3>Diagrama de Gantt (CPU)</h3>
      <div className="gantt-chart">
        {compressedBlocks.map((block, index) => {
          const flexGrow = block.duration;
          return (
            <div
              key={index}
              className="gantt-block"
              style={{
                flexGrow: flexGrow,
                backgroundColor: getColor(block.processId),
              }}
              title={`Processo: ${block.processId ?? 'Ocioso'} | Duração: ${block.duration} | Tempo: ${block.startTime}-${block.startTime + block.duration}`}
            >
              <span className="gantt-block-label">
                {block.processId !== null ? `P${block.processId}` : 'Ocioso'}
              </span>
            </div>
          );
        })}
      </div>
      <div className="gantt-timeline">
        <span>0</span>
        <span>{totalDuration}</span>
      </div>
    </div>
  );
};
export default GanttChart;