// front-end/src/api.ts
import type { 
  ProcessoEntrada, 
  ConfiguracaoEscalonador,
  ResultadoSimulacao 
} from './interfaces'; // importação de tipos

// front-end/src/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/simulate';

// ... (todo o resto do arquivo permanece igual)
export async function executarSimulacao(
  algorithm: string,
  processes: ProcessoEntrada[],
  config: ConfiguracaoEscalonador
): Promise<ResultadoSimulacao> {
  
  const body = JSON.stringify({
    processes,
    config,
  });

  const response = await fetch(`${API_BASE_URL}/${algorithm}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.details || errorData.error || 'Ocorreu um erro na simulação.'
    );
  }

  return response.json() as Promise<ResultadoSimulacao>;
}