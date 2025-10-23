// front-end/src/interfaces.ts

// --- Tipos de Entrada ---

export interface ProcessoEntrada {
  creationTime: number;
  duration: number;
  priority: number;
}

// Configuração do escalonador: campos opcionais (nem todo algoritmo usa)
export interface ConfiguracaoEscalonador {
  quantum?: number;
  agingRate?: number;
}

// --- Tipos de Saída (Resultado) ---

export interface Processo {
  id: number;
  creationTime: number;
  duration: number;
  priority: number;
  remainingTime: number;
  completionTime?: number;
  waitingTime?: number;
  turnaroundTime?: number;
}

export interface ResultadoSimulacao {
  metricas: {
    averageTurnaroundTime: number;
    averageWaitingTime: number;
    totalContextSwitches: number;
  };
  diagramaTempo: { time: number; processId: number | null }[];
  processos: Processo[];
}