// back-end/src/escalonador.ts
import { 
    Processo, 
    ProcessoEntrada, 
    criarProcesso, 
    ResultadoSimulacao, 
    ConfiguracaoEscalonador 
} from './processo'; // Importa as interfaces do arquivo traduzido

// ---------------------------------------------------------------------------------
// ALGORITMO FCFS (First Come, First Served) - IMPLEMENTADO
// ---------------------------------------------------------------------------------

/**
 * Simula o algoritmo de escalonamento FCFS (Não Preemptivo).
 * Os processos são atendidos na ordem em que chegam.
 */
export function simularFCFS(entradaProcessos: ProcessoEntrada[]): ResultadoSimulacao {
  // 1. Inicialização e 2. Ordenação
  const processos: Processo[] = entradaProcessos
    .map((p, index) => criarProcesso(p, index + 1))
    .sort((a, b) => a.creationTime - b.creationTime); // Ordena por chegada

  // 3. Setup da Simulação
  let tempoAtual = 0;
  let processosConcluidosCont = 0;
  let processoAtual: Processo | null = null;
  let trocasContexto = 0; 
  const filaDeProntos: Processo[] = [];
  const diagramaTempo: { time: number; processId: number | null }[] = [];
  const poolDeChegada = [...processos]; // Cópia para consumir

  // 4. Loop Principal
  while (processosConcluidosCont < processos.length) {
    
    // 5. Adicionar Chegadas
    while (poolDeChegada.length > 0 && poolDeChegada[0].creationTime <= tempoAtual) {
      filaDeProntos.push(poolDeChegada.shift()!);
    }

    // 6. Escolha do Processo
    if (processoAtual === null && filaDeProntos.length > 0) {
      processoAtual = filaDeProntos.shift()!;
      processoAtual.waitingTime = tempoAtual - processoAtual.creationTime;
    }

    // Registra o diagrama de tempo
    diagramaTempo.push({ time: tempoAtual, processId: processoAtual ? processoAtual.id : null });

    // 7. Execução
    if (processoAtual !== null) {
      processoAtual.remainingTime--;

      // 8. Término do Processo
      if (processoAtual.remainingTime === 0) {
        processoAtual.completionTime = tempoAtual + 1;
        processoAtual.turnaroundTime = processoAtual.completionTime - processoAtual.creationTime;
        processosConcluidosCont++;
        processoAtual = null; // CPU fica ociosa
      }
    }

    tempoAtual++;

    // 9. Tempo Ocioso
    if (processoAtual === null && filaDeProntos.length === 0 && poolDeChegada.length > 0) {
      if (tempoAtual < poolDeChegada[0].creationTime) {
        const tempoOcioso = poolDeChegada[0].creationTime - tempoAtual;
        for (let i = 0; i < tempoOcioso; i++) {
           diagramaTempo.push({ time: tempoAtual + i, processId: null });
        }
        tempoAtual = poolDeChegada[0].creationTime;
      }
    }

    if (tempoAtual > 100000) break; // Trava de segurança
  }

  // 10. Cálculo de Métricas
  const totalTurnaround = processos.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0);
  const totalWaiting = processos.reduce((sum, p) => sum + (p.waitingTime || 0), 0);
  
  // 11. Retorno
  return {
    metricas: {
      averageTurnaroundTime: totalTurnaround / processos.length,
      averageWaitingTime: totalWaiting / processos.length,
      totalContextSwitches: trocasContexto,
    },
    diagramaTempo: diagramaTempo,
    processos: processos,
  };
}

// ---------------------------------------------------------------------------------
// STUBS PARA OUTROS ALGORITMOS
// ---------------------------------------------------------------------------------

const ERRO_NAO_IMPLEMENTADO = "Algoritmo não implementado.";

/**
 * Simula o algoritmo Shortest Job First (SJF) (Não Preemptivo).
 */
export function simularSJF(entradaProcessos: ProcessoEntrada[]): ResultadoSimulacao {
  // TODO: Implementar SJF.
  throw new Error(ERRO_NAO_IMPLEMENTADO);
}

/**
 * Simula o algoritmo Shortest Remaining Time First (SRTF) (Preemptivo).
 */
export function simularSRTF(entradaProcessos: ProcessoEntrada[]): ResultadoSimulacao {
  // TODO: Implementar SRTF.
  throw new Error(ERRO_NAO_IMPLEMENTADO);
}

/**
 * Simula o algoritmo de Prioridade (Não Preemptivo).
 */
export function simularPrioridadeNP(entradaProcessos: ProcessoEntrada[]): ResultadoSimulacao {
  // TODO: Implementar Prioridade NP.
  throw new Error(ERRO_NAO_IMPLEMENTADO);
}

/**
 * Simula o algoritmo de Prioridade (Preemptivo).
 */
export function simularPrioridadeP(entradaProcessos: ProcessoEntrada[]): ResultadoSimulacao {
  // TODO: Implementar Prioridade P.
  throw new Error(ERRO_NAO_IMPLEMENTADO);
}

/**
 * Simula o algoritmo Round-Robin (Preemptivo por Quantum).
 */
export function simularRR(entradaProcessos: ProcessoEntrada[], config: ConfiguracaoEscalonador): ResultadoSimulacao {
  if (!config.quantum || config.quantum <= 0) {
      throw new Error("Quantum inválido ou não fornecido para Round-Robin.");
  }
  // TODO: Implementar RR.
  throw new Error(ERRO_NAO_IMPLEMENTADO);
}

/**
 * Simula o algoritmo Round-Robin com Prioridade e Envelhecimento (Aging).
 */
export function simularPrioridadeRR(entradaProcessos: ProcessoEntrada[], config: ConfiguracaoEscalonador): ResultadoSimulacao {
    if (!config.quantum || config.quantum <= 0) {
      throw new Error("Quantum inválido ou não fornecido.");
    }
    // TODO: Implementar RR com Prioridade e Aging.
  throw new Error(ERRO_NAO_IMPLEMENTADO);
}