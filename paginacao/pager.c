#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include <time.h>

#define TRACE_PATH_MAX 256
#define MAX_LINE 1024
#define NRU_RESET_INTERVAL 7

// Estrutura para representar uma página na memória
typedef struct {
    int page_id;        // ID da página (conteúdo do trace)
    int loaded_at;      // Timestamp lógico de quando entrou (para FIFO)
    int last_accessed;  // Timestamp lógico do último acesso (para LRU)
    int frequency;      // Contador de frequência (para LFU/MFU)
    int reference_bit;  // Para Clock/Segunda Chance
    int modified_bit;   // Para NRU -- assumindo 0 para este trace simples
    int is_empty;       // Flag para saber se o frame está vazio
} Frame;

// Estrutura global da simulação
typedef struct {
    Frame* frames;      // Array de frames (memória física)
    int num_frames;     // Número total de frames
    int* reference_string; // Array com todo o trace (necessário para o Ótimo)
    int total_refs;     // Tamanho do trace
    char algo[50];      // Nome do algoritmo
    int timer;          // Relógio lógico global

    int clock_hand;     // Ponteiro do algoritmo Clock (e variações circulares)

    // Métricas
    int page_faults;
    int evictions;
} Simulator;

void init_simulation(Simulator* sim, int n_frames, char* algo_name);
void load_trace(Simulator* sim, char* filename);
void run_simulation(Simulator* sim);
void print_stats(Simulator* sim);
int find_victim_fifo(Simulator* sim);
int find_victim_lru(Simulator* sim);
int find_victim_lfu(Simulator* sim);
int find_victim_mfu(Simulator* sim);

int find_victim_optimal(Simulator* sim, int current_index);
int find_victim_second_chance(Simulator* sim);
int find_victim_clock(Simulator* sim);
int find_victim_nru(Simulator* sim);

// --- IMPLEMENTAÇÃO ---

int main(int argc, char* argv[]) {
    srand(time(NULL));
    // Interface de execução conforme especificado 

    char algo[50] = "";
    char trace_file[TRACE_PATH_MAX] = "";
    int frames = 0;

    // Parsing simples de argumentos
    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "--algo") == 0 && i + 1 < argc) {
            strcpy(algo, argv[++i]);
        }
        else if (strcmp(argv[i], "--frames") == 0 && i + 1 < argc) {
            frames = atoi(argv[++i]);
        }
        else if (strcmp(argv[i], "--trace") == 0 && i + 1 < argc) {
            strcpy(trace_file, argv[++i]);
        }
    }

    if (frames <= 0 || strlen(algo) == 0 || strlen(trace_file) == 0) {
        printf("Uso: ./pager --algo <ALGO> --frames <N> --trace <arquivo>\n");
        return 1;
    }

    Simulator sim;
    init_simulation(&sim, frames, algo);
    load_trace(&sim, trace_file);
    run_simulation(&sim);
    print_stats(&sim);

    // Limpeza
    free(sim.frames);
    free(sim.reference_string);

    return 0;
}

void init_simulation(Simulator* sim, int n_frames, char* algo_name) {
    sim->num_frames = n_frames;
    sim->frames = (Frame*)malloc(n_frames * sizeof(Frame));
    for (int i = 0; i < n_frames; i++) {
        sim->frames[i].is_empty = 1;
        sim->frames[i].page_id = -1;
        sim->frames[i].frequency = 0;
        sim->frames[i].reference_bit = 0;
        sim->frames[i].modified_bit = 0;
        sim->frames[i].loaded_at = 0;
        sim->frames[i].last_accessed = 0;
    }
    strcpy(sim->algo, algo_name);
    sim->timer = 0;
    sim->clock_hand = 0;
    sim->page_faults = 0;
    sim->evictions = 0;
    sim->reference_string = NULL;
    sim->total_refs = 0;
}

void load_trace(Simulator* sim, char* filename) {
    FILE* file = fopen(filename, "r");
    if (!file) {
        perror("Erro ao abrir arquivo de trace");
        exit(1);
    }

    // Primeiro, conta linhas para alocar memória
    int count = 0;
    int temp;
    while (fscanf(file, "%d", &temp) == 1) {
        count++;
    }
    rewind(file);

    sim->total_refs = count;
    sim->reference_string = (int*)malloc(count * sizeof(int));

    int i = 0;
    // O arquivo contém uma referência por linha
    while (fscanf(file, "%d", &sim->reference_string[i]) == 1) {
        i++;
    }
    fclose(file);
}

void run_simulation(Simulator* sim) {
    for (int i = 0; i < sim->total_refs; i++) {
        int page_req = sim->reference_string[i];
        sim->timer++; // Incrementa tempo lógico

        // NRU precisa de reset periódico do bit de referência (R)
        if (strcmp(sim->algo, "NRU") == 0 || strcmp(sim->algo, "nru") == 0) {
            if ((sim->timer % NRU_RESET_INTERVAL) == 0) {
                for (int j = 0; j < sim->num_frames; j++) {
                    sim->frames[j].reference_bit = 0;
                }
            }
        }

        // 1. Verifica se está na memória (HIT)
        int hit = 0;
        for (int j = 0; j < sim->num_frames; j++) {
            if (!sim->frames[j].is_empty && sim->frames[j].page_id == page_req) {
                hit = 1;
                // Atualiza metadados
                sim->frames[j].last_accessed = sim->timer;
                sim->frames[j].frequency++;
                sim->frames[j].reference_bit = 1;
                break;
            }
        }

        if (hit) continue;

        // 2. Se não está (MISS / PAGE FAULT)
        sim->page_faults++;

        // Verifica se há espaço vazio
        int free_idx = -1;
        for (int j = 0; j < sim->num_frames; j++) {
            if (sim->frames[j].is_empty) {
                free_idx = j;
                break;
            }
        }

        if (free_idx != -1) {
            // Tem espaço, coloca lá (sem evicção)
            sim->frames[free_idx].page_id = page_req;
            sim->frames[free_idx].is_empty = 0;
            sim->frames[free_idx].loaded_at = sim->timer;
            sim->frames[free_idx].last_accessed = sim->timer;
            sim->frames[free_idx].frequency = 1;
            sim->frames[free_idx].reference_bit = 1;
            sim->frames[free_idx].modified_bit = 0;
        }
        else {
            // Memória cheia, precisa de evicção
            sim->evictions++;
            int victim_idx = -1;

            // Seleciona algoritmo
            if (strcmp(sim->algo, "FIFO") == 0 || strcmp(sim->algo, "fifo") == 0) {
                victim_idx = find_victim_fifo(sim);
            }
            else if (strcmp(sim->algo, "LRU") == 0 || strcmp(sim->algo, "lru") == 0) {
                victim_idx = find_victim_lru(sim);
            }
            else if (strcmp(sim->algo, "LFU") == 0 || strcmp(sim->algo, "lfu") == 0) {
                victim_idx = find_victim_lfu(sim);
            }
            else if (strcmp(sim->algo, "MFU") == 0 || strcmp(sim->algo, "mfu") == 0) {
                victim_idx = find_victim_mfu(sim);
            }
            else if (strcmp(sim->algo, "OTIMO") == 0 || strcmp(sim->algo, "otimo") == 0 ||
                strcmp(sim->algo, "OPTIMAL") == 0 || strcmp(sim->algo, "optimal") == 0) {
                victim_idx = find_victim_optimal(sim, i);
            }
            else if (strcmp(sim->algo, "CLOCK") == 0 || strcmp(sim->algo, "clock") == 0) {
                victim_idx = find_victim_clock(sim);
            }
            else if (strcmp(sim->algo, "SEGUNDA_CHANCE") == 0 || strcmp(sim->algo, "segunda_chance") == 0 ||
                strcmp(sim->algo, "SECOND_CHANCE") == 0 || strcmp(sim->algo, "second_chance") == 0) {
                victim_idx = find_victim_second_chance(sim);
            }
            else if (strcmp(sim->algo, "NRU") == 0 || strcmp(sim->algo, "nru") == 0) {
                victim_idx = find_victim_nru(sim);
            }
            else {
                fprintf(stderr, "Algoritmo desconhecido: %s\n", sim->algo);
                exit(1);
            }

            sim->frames[victim_idx].page_id = page_req;
            sim->frames[victim_idx].loaded_at = sim->timer;
            sim->frames[victim_idx].last_accessed = sim->timer;
            sim->frames[victim_idx].frequency = 1; // Reset de frequência para nova página
            sim->frames[victim_idx].reference_bit = 1;
            sim->frames[victim_idx].modified_bit = 0;
            sim->frames[victim_idx].is_empty = 0;
        }
    }
}

// FIFO: Remove o que tem o menor loaded_at 
int find_victim_fifo(Simulator* sim) {
    int victim = 0;
    int min_time = sim->frames[0].loaded_at;

    for (int i = 1; i < sim->num_frames; i++) {
        if (sim->frames[i].loaded_at < min_time) {
            min_time = sim->frames[i].loaded_at;
            victim = i;
        }
    }
    return victim;
}

// LRU: Remove o que tem o menor last_accessed 
int find_victim_lru(Simulator* sim) {
    int victim = 0;
    int min_time = sim->frames[0].last_accessed;

    for (int i = 1; i < sim->num_frames; i++) {
        if (sim->frames[i].last_accessed < min_time) {
            min_time = sim->frames[i].last_accessed;
            victim = i;
        }
    }
    return victim;
}

// LFU: Remove o que tem a menor frequência 
int find_victim_lfu(Simulator* sim) {
    int victim = 0;
    int min_freq = sim->frames[0].frequency;

    for (int i = 1; i < sim->num_frames; i++) {
        if (sim->frames[i].frequency < min_freq) {
            min_freq = sim->frames[i].frequency;
            victim = i;
        }
        // Critério de desempate comum: FIFO (quem chegou antes)
        else if (sim->frames[i].frequency == min_freq) {
            if (sim->frames[i].loaded_at < sim->frames[victim].loaded_at) {
                victim = i;
            }
        }
    }
    return victim;
}

// MFU: Remove o que tem a maior frequência 
int find_victim_mfu(Simulator* sim) {
    int victim = 0;
    int max_freq = sim->frames[0].frequency;

    for (int i = 1; i < sim->num_frames; i++) {
        if (sim->frames[i].frequency > max_freq) {
            max_freq = sim->frames[i].frequency;
            victim = i;
        }
        // Critério de desempate: FIFO
        else if (sim->frames[i].frequency == max_freq) {
            if (sim->frames[i].loaded_at < sim->frames[victim].loaded_at) {
                victim = i;
            }
        }
    }
    return victim;
}

// Ótimo (Optimal): remove a página cujo próximo uso está mais distante no futuro
int find_victim_optimal(Simulator* sim, int current_index) {
    int victim = 0;
    int farthest = -1;

    for (int i = 0; i < sim->num_frames; i++) {
        int page = sim->frames[i].page_id;
        int next_use = INT_MAX;

        for (int j = current_index + 1; j < sim->total_refs; j++) {
            if (sim->reference_string[j] == page) {
                next_use = j;
                break;
            }
        }

        if (next_use > farthest) {
            farthest = next_use;
            victim = i;
        }
    }

    return victim;
}


// Segunda Chance: FIFO lógico com ponteiro e bit de referência:
// examina o mais antigo; se R=1, zera R e manda para o "fim"
int find_victim_second_chance(Simulator* sim) {
    while (1) {
        int i = sim->clock_hand;
        // Se o bit R == 0, escolhe esse frame
        if (sim->frames[i].reference_bit == 0) {
            sim->clock_hand = (i + 1) % sim->num_frames;
            return i;
        }

        // Se R == 1, zera e dá a segunda chance
        sim->frames[i].reference_bit = 0;
        sim->clock_hand = (i + 1) % sim->num_frames;
    }
}


// Clock: varredura circular com ponteiro; se R=1 zera e avança, se R=0 escolhe
int find_victim_clock(Simulator* sim) {
    while (1) {
        int i = sim->clock_hand;

        if (sim->frames[i].reference_bit == 0) {
            // Vítima encontrada
            sim->clock_hand = (i + 1) % sim->num_frames;
            return i;
        }

        // Dá segunda chance
        sim->frames[i].reference_bit = 0;
        sim->clock_hand = (i + 1) % sim->num_frames;
    }
}


// NRU (Not Recently Used): escolhe a partir da menor classe (R,M)
// Classes: 0:(0,0), 1:(0,1), 2:(1,0), 3:(1,1)
int find_victim_nru(Simulator* sim) {
    int classes[4][sim->num_frames];
    int count[4] = { 0 };

    // Classificação
    for (int i = 0; i < sim->num_frames; i++) {
        int r = sim->frames[i].reference_bit ? 1 : 0;
        int m = sim->frames[i].modified_bit ? 1 : 0;
        int cls = (r << 1) | m;

        classes[cls][count[cls]++] = i;
    }

    // Escolhe a menor classe não vazia
    for (int c = 0; c < 4; c++) {
        if (count[c] > 0) {
            int idx = rand() % count[c];
            return classes[c][idx];
        }
    }

    return 0; // fallback (não deve ocorrer)
}


// --- Saída de Dados ---

void print_stats(Simulator* sim) {
    // Formato de saída 
    printf("Algoritmo: %s\n", sim->algo);
    printf("Frames: %d\n", sim->num_frames);
    printf("Referencias: %d\n", sim->total_refs);
    printf("Faltas de pagina: %d\n", sim->page_faults);
    printf("Taxa de faltas: %.2f%%\n", ((float)sim->page_faults / sim->total_refs) * 100);
    printf("Eviccoes: %d\n", sim->evictions);
    printf("Conjunto residente final:\n");

    // Imprimir IDs dos frames
    printf("frame_ids: ");
    for (int i = 0; i < sim->num_frames; i++) {
        printf("%d ", i);
    }
    printf("\n");

    // Imprimir IDs das páginas
    printf("page_ids:  ");
    for (int i = 0; i < sim->num_frames; i++) {
        if (sim->frames[i].is_empty)
            printf("- ");
        else
            printf("%d ", sim->frames[i].page_id);
    }
    printf("\n");
}