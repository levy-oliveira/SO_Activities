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
  // Inicialização e Ordenação
  const processos: Processo[] = entradaProcessos
    .map((p, index) => criarProcesso(p, index + 1))
    .sort((a, b) => a.creationTime - b.creationTime); // Ordena por chegada

  // Setup da Simulação
  let tempoAtual = 0;
  let processosConcluidosCont = 0;
  let processoAtual: Processo | null = null;
  let trocasContexto = 0;
  const filaDeProntos: Processo[] = [];
  const diagramaTempo: { time: number; processId: number | null }[] = [];
  const poolDeChegada = [...processos]; // Cópia para consumir

  // Loop Principal
  while (processosConcluidosCont < processos.length) {

    // Adicionar Chegadas
    while (poolDeChegada.length > 0 && poolDeChegada[0].creationTime <= tempoAtual) {
      filaDeProntos.push(poolDeChegada.shift()!);
    }

    // Escolha do Processo
    if (processoAtual === null && filaDeProntos.length > 0) {
      processoAtual = filaDeProntos.shift()!;
      processoAtual.waitingTime = tempoAtual - processoAtual.creationTime;
      trocasContexto++;
    }

    // Registra o diagrama de tempo
    diagramaTempo.push({ time: tempoAtual, processId: processoAtual ? processoAtual.id : null });

    // Execução
    if (processoAtual !== null) {
      processoAtual.remainingTime--;

      // Término do Processo
      if (processoAtual.remainingTime === 0) {
        processoAtual.completionTime = tempoAtual + 1;
        processoAtual.turnaroundTime = processoAtual.completionTime - processoAtual.creationTime;
        processosConcluidosCont++;
        processoAtual = null; // CPU fica ociosa
      }
    }

    tempoAtual++;

    // Tempo Ocioso
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

  // Cálculo de Métricas
  const totalTurnaround = processos.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0);
  const totalWaiting = processos.reduce((sum, p) => sum + (p.waitingTime || 0), 0);

  // Retorno
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
  // Inicialização e Ordenação
  const processos: Processo[] = entradaProcessos
    .map((p, index) => criarProcesso(p, index + 1))
    .sort((a, b) => a.creationTime - b.creationTime); // Ordena por chegada

  // Setup da Simulação
  let tempoAtual = 0;
  let processosConcluidosCont = 0;
  let processoAtual: Processo | null = null;
  let trocasContexto = 0;
  const filaDeProntos: Processo[] = [];
  const diagramaTempo: { time: number; processId: number | null }[] = [];
  const poolDeChegada = [...processos]; // Cópia para consumir

  // Loop Principal
  while (processosConcluidosCont < processos.length) {

    // Adicionar todos os processos que chegaram até o tempo atual
    while (poolDeChegada.length > 0 && poolDeChegada[0].creationTime <= tempoAtual) {
      filaDeProntos.push(poolDeChegada.shift()!);
    }

    // Escolha do processo (SJF: menor burst entre os prontos)
    if (processoAtual === null && filaDeProntos.length > 0) {
      // Ordena primeiro pelo tempo restante/duração (SJF), depois por tempo de chegada (desempate)
      // Nota: o objeto Processo usa `duration` e `remainingTime` (não `burstTime`).
      filaDeProntos.sort((a, b) => {
        if (a.remainingTime !== b.remainingTime) return a.remainingTime - b.remainingTime;
        return a.creationTime - b.creationTime;
      });

      processoAtual = filaDeProntos.shift()!;
      processoAtual.waitingTime = tempoAtual - processoAtual.creationTime;
      trocasContexto++;
    }

    // Registrar diagrama de tempo
    diagramaTempo.push({ time: tempoAtual, processId: processoAtual ? processoAtual.id : null });

    // Executar processo atual
    if (processoAtual !== null) {
      processoAtual.remainingTime--;

      // Verificar término
      if (processoAtual.remainingTime === 0) {
        processoAtual.completionTime = tempoAtual + 1;
        processoAtual.turnaroundTime = processoAtual.completionTime - processoAtual.creationTime;
        processosConcluidosCont++;
        processoAtual = null; // CPU ociosa
      }
    }

    // Avançar tempo
    tempoAtual++;

    // Se não há processo em execução e nem pronto, pular tempo ocioso até o próximo processo
    if (processoAtual === null && filaDeProntos.length === 0 && poolDeChegada.length > 0) {
      if (tempoAtual < poolDeChegada[0].creationTime) {
        const tempoOcioso = poolDeChegada[0].creationTime - tempoAtual;
        for (let i = 0; i < tempoOcioso; i++) {
          diagramaTempo.push({ time: tempoAtual + i, processId: null });
        }
        tempoAtual = poolDeChegada[0].creationTime;
      }
    }

    // Trava de segurança
    if (tempoAtual > 100000) break;
  }

  // Cálculo de Métricas
  const totalTurnaround = processos.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0);
  const totalWaiting = processos.reduce((sum, p) => sum + (p.waitingTime || 0), 0);

  // Retorno final
  return {
    metricas: {
      averageTurnaroundTime: totalTurnaround / processos.length,
      averageWaitingTime: totalWaiting / processos.length,
      totalContextSwitches: trocasContexto,
    },
    diagramaTempo,
    processos,
  };
}


/**
 * Simula o algoritmo Shortest Remaining Time First (SRTF) (Preemptivo).
 */
export function simularSRTF(entradaProcessos: ProcessoEntrada[]): ResultadoSimulacao {
  // Inicialização e Ordenação por tempo de chegada
  const processos: Processo[] = entradaProcessos
    .map((p, index) => criarProcesso(p, index + 1))
    .sort((a, b) => a.creationTime - b.creationTime);

  // Setup da simulação
  let tempoAtual = 0;
  let processosConcluidosCont = 0;
  let processoAtual: Processo | null = null;
  let trocasContexto = 0;
  const filaDeProntos: Processo[] = [];
  const diagramaTempo: { time: number; processId: number | null }[] = [];
  const poolDeChegada = [...processos];

  // Loop principal
  while (processosConcluidosCont < processos.length) {
    // Adicionar processos que chegaram até o tempo atual
    while (poolDeChegada.length > 0 && poolDeChegada[0].creationTime <= tempoAtual) {
      filaDeProntos.push(poolDeChegada.shift()!);
    }

    // Escolha do processo com menor tempo restante (SRTF - preemptivo)
    if (filaDeProntos.length > 0) {
      // Ordena por remainingTime (e desempata por criação)
      filaDeProntos.sort((a, b) => {
        if (a.remainingTime !== b.remainingTime) return a.remainingTime - b.remainingTime;
        return a.creationTime - b.creationTime;
      });

      const candidato = filaDeProntos[0];

      if (processoAtual === null) {
        // CPU livre: escala o menor job pronto
        processoAtual = filaDeProntos.shift()!;
        if (processoAtual.startTime === null) {
          processoAtual.startTime = tempoAtual;
          processoAtual.waitingTime = tempoAtual - processoAtual.creationTime;
        }
        trocasContexto++;
      } else if (candidato && candidato.remainingTime < processoAtual.remainingTime) {
        // Preempção: novo candidato tem menos remainingTime
        // remove candidato da fila e devolve o atual para a fila
        filaDeProntos.shift();
        filaDeProntos.push(processoAtual);
        processoAtual = candidato;
        if (processoAtual.startTime === null) {
          processoAtual.startTime = tempoAtual;
          processoAtual.waitingTime = tempoAtual - processoAtual.creationTime;
        }
        trocasContexto++;
      }
    }

    // Registrar diagrama
    diagramaTempo.push({ time: tempoAtual, processId: processoAtual ? processoAtual.id : null });

    // Executar processo atual (se existir)
    if (processoAtual !== null) {
      processoAtual.remainingTime--;

      // Verificar término
      if (processoAtual.remainingTime === 0) {
        processoAtual.completionTime = tempoAtual + 1;
        processoAtual.turnaroundTime = processoAtual.completionTime - processoAtual.creationTime;
        processosConcluidosCont++;
        processoAtual = null; // CPU livre
      }
    }

    tempoAtual++;

    // Tempo ocioso (sem processo pronto)
    if (processoAtual === null && filaDeProntos.length === 0 && poolDeChegada.length > 0) {
      if (tempoAtual < poolDeChegada[0].creationTime) {
        const tempoOcioso = poolDeChegada[0].creationTime - tempoAtual;
        for (let i = 0; i < tempoOcioso; i++) {
          diagramaTempo.push({ time: tempoAtual + i, processId: null });
        }
        tempoAtual = poolDeChegada[0].creationTime;
      }
    }

    if (tempoAtual > 100000) break; // trava de segurança
  }

  // Calcular métricas
  const totalTurnaround = processos.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0);
  const totalWaiting = processos.reduce((sum, p) => sum + (p.waitingTime || 0), 0);

  // Retornar resultado
  return {
    metricas: {
      averageTurnaroundTime: totalTurnaround / processos.length,
      averageWaitingTime: totalWaiting / processos.length,
      totalContextSwitches: trocasContexto,
    },
    diagramaTempo,
    processos,
  };
}

/**
 * Simula o algoritmo de Prioridade (Não Preemptivo).
 */
export function simularPrioridadeNP(entradaProcessos: ProcessoEntrada[]): ResultadoSimulacao {
  // Inicialização e ordenação por tempo de chegada
  const processos: Processo[] = entradaProcessos
    .map((p, index) => criarProcesso(p, index + 1))
    .sort((a, b) => a.creationTime - b.creationTime);

  // Setup da Simulação
  let tempoAtual = 0;
  let processosConcluidosCont = 0;
  let processoAtual: Processo | null = null;
  let trocasContexto = 0; // Mantido como no FCFS para consistência
  const filaDeProntos: Processo[] = [];
  const diagramaTempo: { time: number; processId: number | null }[] = [];
  const poolDeChegada = [...processos];

  // Loop Principal
  while (processosConcluidosCont < processos.length) {
    
    // Adiciona processos que chegaram na fila de prontos
    while (poolDeChegada.length > 0 && poolDeChegada[0].creationTime <= tempoAtual) {
      filaDeProntos.push(poolDeChegada.shift()!);
    }

    // Se a CPU está livre e há processos prontos...
    if (processoAtual === null && filaDeProntos.length > 0) {
      // ...ordena a fila pela prioridade para encontrar o melhor candidato
      filaDeProntos.sort((a, b) => b.priority - a.priority);
      processoAtual = filaDeProntos.shift()!;
      processoAtual.waitingTime = tempoAtual - processoAtual.creationTime;
    }

    diagramaTempo.push({ time: tempoAtual, processId: processoAtual ? processoAtual.id : null });

    // Executa o processo atual
    if (processoAtual !== null) {
      processoAtual.remainingTime--;

      // Se o processo terminou
      if (processoAtual.remainingTime === 0) {
        processoAtual.completionTime = tempoAtual + 1;
        processoAtual.turnaroundTime = processoAtual.completionTime - processoAtual.creationTime;
        processosConcluidosCont++;
        processoAtual = null; // Libera a CPU
      }
    }

    tempoAtual++;

    // Avança o tempo se a CPU estiver ociosa
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

  // Cálculo de Métricas Finais
  const totalTurnaround = processos.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0);
  const totalWaiting = processos.reduce((sum, p) => sum + (p.waitingTime || 0), 0);
  
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

/**
 * Simula o algoritmo de Prioridade (Preemptivo).
 * Um novo processo pode interromper o atual se tiver prioridade maior.
 */
export function simularPrioridadeP(entradaProcessos: ProcessoEntrada[]): ResultadoSimulacao {
  const processos: Processo[] = entradaProcessos
    .map((p, index) => criarProcesso(p, index + 1));

  let tempoAtual = 0;
  let processosConcluidosCont = 0;
  let processoAtual: Processo | null = null;
  const filaDeProntos: Processo[] = [];
  const diagramaTempo: { time: number; processId: number | null }[] = [];
  const poolDeProcessos = [...processos]; 
  let trocasContexto = 0;
  let ultimoProcessoId: number | null = null;

  while (processosConcluidosCont < processos.length) {
    // Adiciona à fila de prontos todos os processos que já chegaram
    for (let i = poolDeProcessos.length - 1; i >= 0; i--) {
        if (poolDeProcessos[i].creationTime <= tempoAtual) {
            filaDeProntos.push(poolDeProcessos.splice(i, 1)[0]);
        }
    }

    // Se um processo estava em execução, ele volta para a fila para competir novamente
    if (processoAtual) {
        filaDeProntos.push(processoAtual);
        processoAtual = null;
    }

    // Se há processos na fila, escolhe o de maior prioridade
    if (filaDeProntos.length > 0) {
        filaDeProntos.sort((a, b) => b.priority - a.priority);
        processoAtual = filaDeProntos.shift()!;
    }

    // Contabiliza troca de contexto
    if (processoAtual?.id !== ultimoProcessoId) {
        if (ultimoProcessoId !== null && processoAtual !== null) {
            trocasContexto++;
        }
        ultimoProcessoId = processoAtual?.id ?? null;
    }
    
    diagramaTempo.push({ time: tempoAtual, processId: processoAtual ? processoAtual.id : null });

    // Executa o processo por 1 unidade de tempo
    if (processoAtual) {
      processoAtual.remainingTime--;
      if (processoAtual.remainingTime === 0) {
        processoAtual.completionTime = tempoAtual + 1;
        processoAtual.turnaroundTime = processoAtual.completionTime - processoAtual.creationTime;
        processosConcluidosCont++;
        processoAtual = null; 
        ultimoProcessoId = null;
      }
    }
    
    tempoAtual++;

    if (tempoAtual > 100000) break; // Trava de segurança
  }
  
  // Cálculo final das métricas
  processos.forEach(p => {
      if(p.turnaroundTime !== undefined) {
          p.waitingTime = p.turnaroundTime - p.duration;
      }
  });

  const totalTurnaround = processos.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0);
  const totalWaiting = processos.reduce((sum, p) => sum + (p.waitingTime || 0), 0);

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

/**
 * Simula o algoritmo Round-Robin (Preemptivo por Quantum).
 */
export function simularRR(entradaProcessos: ProcessoEntrada[], config: ConfiguracaoEscalonador): ResultadoSimulacao {
  if (!config.quantum || config.quantum <= 0) {
    throw new Error("Quantum inválido ou não fornecido para Round-Robin.");
  }

  // lista processos organizada por tempo de chegada
  const processos: Processo[] = entradaProcessos
    .map((p, index) => criarProcesso(p, index + 1))
    .sort((a, b) => a.creationTime - b.creationTime); // Ordena por chegada

  let tempoAtual = 0;
  let processosConcluidosCont = 0;
  let trocasContexto = 0; 
  let filaDeProntos: Processo[] = [];
  let processosConcluidos: Processo[] = [];
  const diagramaTempo: { time: number; processId: number | null }[] = [];
  const poolDeChegada = [...processos]; // Cópia para consumir
  const quantum = config.quantum;

  
  while (processosConcluidosCont < processos.length){
    
    // verifica se algum processo novo chegou no tempo atual
    while (poolDeChegada.length > 0 && poolDeChegada[0].creationTime <= tempoAtual) {
      filaDeProntos.push(poolDeChegada.shift()!);
    }

    // escolha do processo
    if(filaDeProntos.length > 0){
      const processoAtual = filaDeProntos.shift();
      trocasContexto++;

      if (processoAtual) { // Verifica se existe um processo
        
        if (processoAtual.waitingTime === undefined) {
          processoAtual.waitingTime = tempoAtual - processoAtual.creationTime;
        }   
        
        // execução de acordo com o quantum
        for (let q = 0; q < quantum && processoAtual.remainingTime > 0; q++) {
          while (poolDeChegada.length > 0 && poolDeChegada[0].creationTime <= tempoAtual) {
            filaDeProntos.push(poolDeChegada.shift()!);
          }
          diagramaTempo.push({ time: tempoAtual, processId: processoAtual ? processoAtual.id : null });
          tempoAtual++;
          processoAtual.remainingTime--;
        }
        
        // verifica se o processo atual acabou a execução
        if(processoAtual.remainingTime > 0) {
          filaDeProntos.push(processoAtual);
        }
        else {
          processosConcluidosCont++;
          processoAtual.completionTime = tempoAtual;
          processoAtual.turnaroundTime = processoAtual.completionTime - processoAtual.creationTime;
          processosConcluidos.push(processoAtual);
        }
      }
    } else {
      // tempo ocioso
      if (poolDeChegada.length > 0) {
        const tempoOcioso = poolDeChegada[0].creationTime - tempoAtual;
        for (let i = 0; i < tempoOcioso; i++) {
          diagramaTempo.push({ time: tempoAtual + i, processId: null });
        }
        tempoAtual = poolDeChegada[0].creationTime;
      } else {
        diagramaTempo.push({ time: tempoAtual, processId: null });
        tempoAtual++;
      }
    }

    if (tempoAtual > 100000) {
      console.error("Tempo máximo de execução excedido");
      break;
    }

  }
  
  const totalTurnaround = processosConcluidos.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0);
  const totalWaiting = processosConcluidos.reduce((sum, p) => sum + (p.waitingTime || 0), 0);
  
  return {
    metricas: {
      averageTurnaroundTime: totalTurnaround / processosConcluidos.length,
      averageWaitingTime: totalWaiting / processosConcluidos.length,
      totalContextSwitches: trocasContexto,
    },
    diagramaTempo: diagramaTempo,
    processos: processosConcluidos,
  };
}

/**
 * Simula o algoritmo Round-Robin com Prioridade e Envelhecimento (Aging).
 */
export function simularPrioridadeRR(entradaProcessos: ProcessoEntrada[], config: ConfiguracaoEscalonador): ResultadoSimulacao {

  if (!config.quantum || config.quantum <= 0) {
    throw new Error("Quantum inválido ou não fornecido.");
  }
 
  if (!config.quantum || config.quantum <= 0) {
      throw new Error("Quantum inválido ou não fornecido para Round-Robin.");
  }

  // lista processos organizada por tempo de chegada
  const processos: Processo[] = entradaProcessos
    .map((p, index) => criarProcesso(p, index + 1))
    .sort((a, b) => a.creationTime - b.creationTime); // Ordena por tempo de chegada

  let tempoAtual = 0;
  let processosConcluidosCont = 0;
  let trocasContexto = 0; 
  let filaDeProntos: Processo[] = [];
  let processosConcluidos: Processo[] = [];
  const diagramaTempo: { time: number; processId: number | null }[] = [];
  const poolDeChegada = [...processos]; // Cópia para consumir
  const quantum = config.quantum;

  
  while (processosConcluidosCont < processos.length){
    
    // verifica se algum processo chegou no tempo atual e coloca na fila de prontos
    while (poolDeChegada.length > 0 && poolDeChegada[0].creationTime <= tempoAtual) {
      filaDeProntos.push(poolDeChegada.shift()!);
    }

    if(filaDeProntos.length > 0){
      // Encontra o processo com maior prioridade na filaDeProntos
      let maxPriorityIndex = 0;
      for(let i = 0; i < filaDeProntos.length; i++) {
        const processo = filaDeProntos[i];
        const processoMax = filaDeProntos[maxPriorityIndex];
        if(processo.priorityMod > processoMax.priorityMod) {
            maxPriorityIndex = i;
        }
      }

      // Remove da filaDeProntos e obtém o processo com maior prioridade
      let processoAtual = filaDeProntos.splice(maxPriorityIndex, 1)[0];

      trocasContexto++;

      if (processoAtual) { // Verifica se existe um processo

        processoAtual.priorityMod = processoAtual.priority; //reseta a prioridade do processo escolhido para a inicial
        
        if (processoAtual.waitingTime === undefined) {
          processoAtual.waitingTime = tempoAtual - processoAtual.creationTime;
        }   
        
        // executa de acordo com o tamanho do quantum
        for (let q = 0; q < quantum && processoAtual.remainingTime > 0; q++) {
          
          diagramaTempo.push({ time: tempoAtual, processId: processoAtual ? processoAtual.id : null });
          tempoAtual++;
          processoAtual.remainingTime--;

          // verifica se chegou um processo novo no tempo atual
          while (poolDeChegada.length > 0 && poolDeChegada[0].creationTime <= tempoAtual) {
            filaDeProntos.push(poolDeChegada.shift()!);            
          }
        
        }
        
        // verifica se o processo atual acabou a execução
        if(processoAtual.remainingTime > 0) {
          filaDeProntos.push(processoAtual);
        }
        else {
          processosConcluidosCont++;
          processoAtual.completionTime = tempoAtual;
          processoAtual.turnaroundTime = processoAtual.completionTime - processoAtual.creationTime;
          processosConcluidos.push(processoAtual);
        }

        // aumenta a prioridade dos processos após o quantum
        filaDeProntos.forEach(p => { 
            p.priorityMod += config.agingRate || 1;
        });
      }
    } else {
      // tempo ocioso
      if (poolDeChegada.length > 0) {
        const tempoOcioso = poolDeChegada[0].creationTime - tempoAtual;
        for (let i = 0; i < tempoOcioso; i++) {
          diagramaTempo.push({ time: tempoAtual + i, processId: null });
        }
        tempoAtual = poolDeChegada[0].creationTime;
      } else {
        diagramaTempo.push({ time: tempoAtual, processId: null });
        tempoAtual++;
      }
    }

    if (tempoAtual > 100000) {
      console.error("Tempo máximo de execução excedido");
      break;
    }

  }
  
  const totalTurnaround = processosConcluidos.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0);
  const totalWaiting = processosConcluidos.reduce((sum, p) => sum + (p.waitingTime || 0), 0);
  
  return {
    metricas: {
      averageTurnaroundTime: totalTurnaround / processosConcluidos.length,
      averageWaitingTime: totalWaiting / processosConcluidos.length,
      totalContextSwitches: trocasContexto,
    },
    diagramaTempo: diagramaTempo,
    processos: processosConcluidos,
  };
}