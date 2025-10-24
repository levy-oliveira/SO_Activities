// front-end/src/App.tsx
import { useState } from 'react';
import './App.css';
import { executarSimulacao } from './api';
import type { 
  ProcessoEntrada, 
  ResultadoSimulacao, 
  ConfiguracaoEscalonador 
} from './interfaces'; // importação de tipos
import GanttChart from './GanttChart'; 
import { getColor } from './GanttChart';


// Define os algoritmos e quais inputs eles precisam
const algoritmos = [
  { id: 'fcfs', nome: 'FCFS (First Come, First Served)', needs: [] },
  { id: 'sjf', nome: 'SJF (Shortest Job First)', needs: [] },
  { id: 'srtf', nome: 'SRTF (Shortest Remaining Time First)', needs: [] },
  { id: 'priority-np', nome: 'Prioridade (Não Preemptivo)', needs: [] },
  { id: 'priority-p', nome: 'Prioridade (Preemptivo)', needs: [] },
  { id: 'rr', nome: 'Round-Robin', needs: ['quantum'] },
  { id: 'priority-rr', nome: 'Round-Robin com Prioridade', needs: ['quantum', 'agingRate'] },
];

// Tipo local para a lista de processos, que inclui o ID da UI
type ProcessoLocal = ProcessoEntrada & { id: number };

function App() {
  // --- Estados do Formulário de Processo ---
  const [creationTime, setCreationTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [priority, setPriority] = useState(1);
  const [removingId, setRemovingId] = useState<number | null>(null); // Estado para controle de remoção


  // --- Estados da Simulação ---
  const [processList, setProcessList] = useState<ProcessoLocal[]>([]); 
  const [nextId, setNextId] = useState(1); // ID local, apenas para UI
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algoritmos[0].id);
  const [quantum, setQuantum] = useState(2);
  const [agingRate, setAgingRate] = useState(1);

  // --- Estados de Resultado ---
  const [result, setResult] = useState<ResultadoSimulacao | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Handlers (Funções) ---

  const handleAddProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (duration <= 0) {
      alert("A Duração deve ser maior que zero.");
      return;
    }
    const newProcess: ProcessoLocal = { id: nextId, creationTime, duration, priority };
    setProcessList([...processList, newProcess]);
    setNextId(nextId + 1);
    
    // Reseta o formulário
    setCreationTime(0);
    setDuration(1);
    setPriority(1);
  };

  const handleRemoveProcess = (idToRemove: number) => {
    setRemovingId(idToRemove); // Define o ID do processo a ser removido
    setTimeout(() => {
      const filteredList = processList.filter((p) => p.id !== idToRemove);
      setNextId(nextId - 1);
      const updatedList = filteredList.map((p) => ({
          ...p,
          id: p.id > idToRemove ? p.id - 1 : p.id
      }));
      setProcessList(updatedList);
      setRemovingId(null); // Reseta o ID após a remoção
    }, 300); // Tempo para a animação
  };

  const handleSimulate = async () => {
    if (processList.length === 0) {
      setError("Adicione pelo menos um processo para simular.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const config: ConfiguracaoEscalonador = {
      // Se o valor for NaN ou 0, deixar undefined para indicar ausência
      quantum: Number(quantum) > 0 ? Number(quantum) : undefined,
      agingRate: Number(agingRate) >= 0 ? Number(agingRate) : undefined,
    };

    // Remove o 'id' local antes de enviar para a API
    const apiProcessList = processList.map(({ creationTime, duration, priority }) => ({
      creationTime,
      duration,
      priority,
    }));

    try {
      const simResult = await executarSimulacao(
        selectedAlgorithm,
        apiProcessList,
        config
      );
      setResult(simResult);
    } catch (err: any) { // <-- CORREÇÃO 1: Removido o "->"
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  // --- Renderização ---

  const currentAlgorithm = algoritmos.find(a => a.id === selectedAlgorithm);
  const showQuantum = currentAlgorithm?.needs.includes('quantum');
  const showAgingRate = currentAlgorithm?.needs.includes('agingRate');

  return (
    <div className="app-layout">
      {/* Coluna da Esquerda: Inputs */}
      <aside className="sidebar">
        <h1>Simulador de Escalonamento</h1>

        {/* --- Formulário de Adicionar Processo --- */}
        <form onSubmit={handleAddProcess} className="form-section">
          <h2>Adicionar Processo</h2>
          <div className="form-group-inline">
            <div className="form-group">
              <label>Tempo de Chegada</label>
              <input
                type="number"
                min="0"
                value={creationTime}
                onChange={(e) => setCreationTime(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Duração</label>
              <input
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Prioridade</label>
              <input
                type="number"
                min="0"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              />
            </div>
          </div>
          <button type="submit" className="secondary">
            Adicionar Processo (P{nextId})
          </button>
        </form>

        {/* --- Lista de Processos Adicionados --- */}
        <div className="form-section">
          <h2>Fila de Processos ({processList.length})</h2>
          <ul className="process-list">
            {processList.length === 0 && <small>Nenhum processo adicionado.</small>}
            {processList.map((p) => (
            <li key={p.id} className={`process-list-item ${removingId === p.id ? 'removing' : ''}`}>
                <span style={{ color: getColor(p.id) }}>
                  P{p.id} (Chegada: {p.creationTime}, Duração: {p.duration}, Prioridade: {p.priority})
                </span>
                <button
                  className="danger"
                  onClick={() => handleRemoveProcess(p.id)}
                >
                  X
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* --- Seleção de Algoritmo e Configs --- */}
        <div className="form-section">
          <h2>Configurar Simulação</h2>
          <div className="form-group">
            <label>Algoritmo</label>
            <select
              value={selectedAlgorithm}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
            >
              {algoritmos.map((alg) => (
                <option key={alg.id} value={alg.id}>
                  {alg.nome}
                </option> // <-- CORREÇÃO 2: Alterado de </origin> para </option>
              ))}
            </select>
          </div>

          <div className="form-group-inline">
            {showQuantum && (
              <div className="form-group">
                <label>Quantum</label>
                <input
                  type="number"
                  min="1"
                  value={quantum}
                  onChange={(e) => setQuantum(Number(e.target.value))}
                />
              </div>
            )}
            {showAgingRate && (
              <div className="form-group">
                <label>Aging Rate</label>
                <input
                  type="number"
                  min="0"
                  value={agingRate}
                  onChange={(e) => setAgingRate(Number(e.target.value))}
                />
              </div>
            )}
          </div>
        </div>

        <button onClick={handleSimulate} disabled={loading}>
          {loading ? 'Simulando...' : 'Executar Simulação'}
        </button>
      </aside>

      {/* Coluna da Direita: Resultados */}
      <main className="main-content">
        {loading && <div className="loading-message">Carregando...</div>}
        
        {error && (
          <div className="error-message">
            <strong>Erro:</strong> {error}
          </div>
        )}
        
        {!result && !loading && !error && (
          <div className="results-placeholder">
            Os resultados da simulação aparecerão aqui.
          </div>
        )}

        {result && (
          <div className="results-container">
            <h2>Resultados da Simulação</h2>
            
            {/* --- Métricas --- */}
            <div className="metrics-grid">
              <div className="metric-card">
                <span>Tempo médio de Retorno (Turnaround)</span>
                <strong>{result.metricas.averageTurnaroundTime.toFixed(2)}</strong>
              </div>
              <div className="metric-card">
                <span>Tempo médio de Espera (Waiting)</span>
                <strong>{result.metricas.averageWaitingTime.toFixed(2)}</strong>
              </div>
              <div className="metric-card">
                <span>Trocas de Contexto</span>
                <strong>{result.metricas.totalContextSwitches}</strong>
              </div>
            </div>

            {/* --- Diagrama de Gantt --- */}
            <GanttChart diagram={result.diagramaTempo} />

            {/* --- Tabela de Processos --- */}
            <div>
              <h3>Tabela de Processos</h3>
              <table className="process-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tempo de Chegada</th>
                    <th>Duração</th>
                    <th>Prioridade</th>
                    <th>Tempo de Conclusão</th>
                    <th>Tempo de Retorno (Turnaround)</th>
                    <th>Tempo de Espera (Waiting)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.processos
                    .sort((a, b) => a.id - b.id) // Ordena por ID
                    .map((p) => (
                      <tr key={p.id}>
                        <td>P{p.id}</td>
                        <td>{p.creationTime}</td>
                        <td>{p.duration}</td>
                        <td>{p.priority}</td>
                        <td>{p.completionTime}</td>
                        <td>{p.turnaroundTime}</td>
                        <td>{p.waitingTime}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default App;