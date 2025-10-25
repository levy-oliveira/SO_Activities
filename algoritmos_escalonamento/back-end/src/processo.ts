// back-end/src/processo.ts

/**
 * Interface para os dados brutos de um processo, como recebido da API.
 * Mantemos os campos em inglês para facilitar a serialização (JSON).
 */
export interface ProcessoEntrada {
  creationTime: number;
  duration: number;
  priority: number;
}

/**
 * Interface que representa um processo durante a simulação.
 * Inclui dados de entrada e métricas de saída.
 */
export interface Processo {
  id: number;
  creationTime: number;
  duration: number;
  priority: number; //prioridade inicial
  priorityMod: number; //prioridade que aumenta com o tempo
  remainingTime: number; // Tempo restante
  startTime?: number | null; // Tempo em que iniciou pela primeira vez (opcional)

  // Métricas de resultado
  completionTime?: number;  // Tempo de conclusão
  waitingTime?: number;     // Tempo de espera
  turnaroundTime?: number;  // Tempo de retorno
}

/**
 * Interface para os resultados da simulação a serem enviados ao front-end.
 */
export interface ResultadoSimulacao {
  metricas: {
    averageTurnaroundTime: number;
    averageWaitingTime: number;
    totalContextSwitches: number;
  };
  diagramaTempo: { time: number; processId: number | null }[];
  processos: Processo[]; // Lista final de processos com suas métricas
}

/**
 * Interface para configurações extras (ex: Quantum para RR).
 */
export interface ConfiguracaoEscalonador {
  quantum?: number;
  agingRate?: number; // Taxa de envelhecimento
}

/**
 * Função auxiliar para criar um objeto Processo completo a partir da entrada.
 */
export function criarProcesso(entrada: ProcessoEntrada, id: number): Processo {
  return {
    id: id,
    creationTime: entrada.creationTime,
    duration: entrada.duration,
    priority: entrada.priority,
    priorityMod: entrada.priority,
    remainingTime: entrada.duration, // Tempo restante inicial é a duração total
    startTime: null,
  };
}