// backend/src/index.ts
import express = require('express');
import { Request, Response } from 'express';

// Importa as funções do escalonador (mesmo que ainda não implementadas)
import { 
    simularFCFS, 
    simularSJF,
    simularSRTF,
    simularPrioridadeNP,
    simularPrioridadeP,
    simularRR,
    simularPrioridadeRR,
} from './escalonador';

// Importa as interfaces (tipos) do arquivo de processo
import { 
    ProcessoEntrada, 
    ConfiguracaoEscalonador, 
    ResultadoSimulacao 
} from './processo';

const cors = require('cors');

const app = express();
const port = 3001;

// --- Middlewares ---
// backend/src/index.ts
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin }));
// Permite que o servidor entenda JSON enviado no corpo das requisições
app.use(express.json()); 

// --- Funções Auxiliares ---

/**
 * Valida o array de processos recebido no corpo da requisição.
 * Retorna uma string de erro se inválido, ou o array de processos se válido.
 */
function validarEntradaProcessos(body: any): ProcessoEntrada[] | string {
    const entradas: ProcessoEntrada[] = body.processes;

    // Verifica se é um array e se não está vazio
    if (!Array.isArray(entradas) || entradas.length === 0) {
      return 'Entrada inválida. Forneça um array "processes".';
    }

    // Valida cada processo individualmente
    for (const p of entradas) {
       if (typeof p.creationTime !== 'number' || typeof p.duration !== 'number' || typeof p.priority !== 'number' ||
           p.creationTime < 0 || // Tempo de criação não pode ser negativo
           p.duration <= 0 ||  // Duração deve ser positiva
           p.priority < 0) {  // Prioridade não pode ser negativa
            
            return `Dados de processo inválidos: ${JSON.stringify(p)}`;
       }
    }
    return entradas; // Válido
}

/**
 * Handler genérico para as rotas de simulação.
 * Executa a função de simulação e trata erros de forma padronizada.
 */
function lidarComRequisicaoSimulacao(
    req: Request, 
    res: Response, 
    // Recebe a função de simulação específica (ex: simularSJF) como argumento
    funcaoSimulacao: (entradas: ProcessoEntrada[], config: ConfiguracaoEscalonador) => ResultadoSimulacao
) {
    try {
        // 1. Validar Processos
        const processos = validarEntradaProcessos(req.body);
        if (typeof processos === 'string') {
             // Se a validação retornar uma string, é um erro
             return res.status(400).json({ error: processos });
        }
        
        // 2. Extrair Configurações (para RR, etc.)
        // O frontend deve enviar { processes: [...], config: { quantum: 2 } }
        const config: ConfiguracaoEscalonador = {
            quantum: req.body.config?.quantum,
            agingRate: req.body.config?.agingRate
        };

        // 3. Executar a Simulação
        const resultado = funcaoSimulacao(processos, config);
        res.status(200).json(resultado); // Retorna 200 OK com os dados
        
    } catch (error) {
        const err = error as Error;
        
        // 4. Tratar Erros
        // Se o erro for "Não implementado", retorna 501
        if (err.message.includes("não implementado")) {
            return res.status(501).json({ error: err.message }); // 501 Not Implemented
        }
        
        // Outros erros (ex: "Quantum inválido" vindo do RR)
        res.status(400).json({ error: 'Erro na simulação.', details: err.message });
    }
}

// ---------------------------------------------------------------------------------
// ENDPOINTS DA API
// (Definimos uma rota POST para cada algoritmo)
// ---------------------------------------------------------------------------------

// FCFS (Implementado)
app.post('/api/simulate/fcfs', (req, res) => {
    // Como FCFS não usa 'config', passamos uma função wrapper simples
    lidarComRequisicaoSimulacao(req, res, (entradas, _) => simularFCFS(entradas));
});

// SJF (Stub)
app.post('/api/simulate/sjf', (req, res) => {
    lidarComRequisicaoSimulacao(req, res, (entradas, _) => simularSJF(entradas));
});

// SRTF (Stub)
app.post('/api/simulate/srtf', (req, res) => {
    lidarComRequisicaoSimulacao(req, res, (entradas, _) => simularSRTF(entradas));
});

// Prioridade NP (Stub)
app.post('/api/simulate/priority-np', (req, res) => {
    lidarComRequisicaoSimulacao(req, res, (entradas, _) => simularPrioridadeNP(entradas));
});

// Prioridade P (Stub)
app.post('/api/simulate/priority-p', (req, res) => {
    lidarComRequisicaoSimulacao(req, res, (entradas, _) => simularPrioridadeP(entradas));
});

// Round-Robin (Stub)
app.post('/api/simulate/rr', (req, res) => {
    // Passa a função simularRR diretamente, pois ela espera 'config'
    lidarComRequisicaoSimulacao(req, res, simularRR);
});

// RR com Prioridade e Aging (Stub)
app.post('/api/simulate/priority-rr', (req, res) => {
    // Passa a função diretamente
    lidarComRequisicaoSimulacao(req, res, simularPrioridadeRR);
});


// --- Iniciar Servidor ---
app.listen(port, () => {
  console.log(`[servidor]: Back-end rodando em http://localhost:${port}`);
});