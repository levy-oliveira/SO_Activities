#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
#define MAX_CMD_LEN 256
#define MAX_ARGS 32

// Array para armazenar PIDs de processos em background
pid_t bg_processes[10];
int bg_count = 0;
pid_t last_child_pid = 0;  // Armazena PID do último processo filho

void add_bg_process(pid_t pid)
{
  if (bg_count < 10)
  {
    bg_processes[bg_count++] = pid;
  }
}

void clean_finished_processes()
{
  int status;
  pid_t pid;
  // WNOHANG = não bloqueia se nenhum processo terminou
  while ((pid = waitpid(-1, &status, WNOHANG)) > 0)
  {
    // Remove da lista de background
    for (int i = 0; i < bg_count; i++)
    {
      if (bg_processes[i] == pid)
      {
        printf("[%d]+ Done\n", i + 1);
        // Remove elemento da lista
        for (int j = i; j < bg_count - 1; j++)
        {
          bg_processes[j] = bg_processes[j + 1];
        }
        bg_count--;
        break;
      }
    }
  }
}

/**
 * @brief Divide a string de entrada em um comando e seus argumentos.
 * Esta função utiliza strtok() para dividir a string 'input' em tokens
 * baseados em espaços e tabulações. Os tokens são armazenados no array 'args'.
 * Ela também detecta se o comando deve ser executado em background,
 * verificando se o último argumento é '&'.
 * @param input A string de comando digitada pelo usuário.
 * @param args Um array de ponteiros para char que irá armazenar os argumentos.
 * @param background Um ponteiro para um inteiro que será definido como 1 se
 * o comando for em background, e 0 caso contrário.
 */
void parse_command(char* input, char** args, int* background) {
  // Define o valor padrão para background
  *background = 0;

  int i = 0;

  // Os delimitadores são espaço (" ") e tabulação ("\t").
  char* token = strtok(input, " \t");

  // Percorre a string de entrada enquanto houver tokens.
  while (token != NULL) {
    args[i] = token;
    i++;
    // As chamadas subsequentes para strtok() com NULL continuam de onde parou.
    token = strtok(NULL, " \t");
  }

  // Verifica se o último argumento é o símbolo "&".
  if (i > 0 && strcmp(args[i - 1], "&") == 0) {
    // Se for, define a flag de background como 1.
    *background = 1;
    // Remove o "&" da lista de argumentos, substituindo-o por NULL.
    args[i - 1] = NULL;
  }
  else {
    // Se não for um comando em background, o array de argumentos deve
    // terminar com NULL. Isso é um requisito para a função execvp().
    args[i] = NULL;
  }
}
void execute_command(char** args, int background) {
  pid_t pid = fork();

  // Tratamento de erro do fork()
  // Sempre verifique o valor de retorno das chamadas de sistema
  if (pid < 0) {
    perror("Erro no fork");
    return;
  }

  if (pid == 0) {
    // Processo filho
    // Tenta substituir a imagem do processo com o novo comando
    if (execvp(args[0], args) == -1) {
      // Tratamento de erro do execvp()
      perror("Erro ao executar comando");
      // Se execvp falhar, é crucial encerrar o processo filho
      exit(EXIT_FAILURE);
    }
  }
  else {
    // Processo pai
    // Armazena o PID do último processo filho criado
    last_child_pid = pid;

    if (background) {
      // Background: Não aguarda, apenas armazena o PID para gerenciamento futuro
      add_bg_process(pid);
      printf("[%d] %d\n", bg_count, pid);
    }
    else {
      // Foreground: aguarda o término do processo filho específico
      waitpid(pid, NULL, 0);
    }
  }
}

// verifica se o comando é interno (exit, pid, jobs, wait)
// Caso seja, retorna 1, senão retorna 0
int is_internal_command(char** args) {

  if (args[0] == NULL) {
    return 0;
  }
  if (strcmp(args[0], "exit") == 0) {
    return 1;
  }
  if (strcmp(args[0], "pid") == 0) {
    return 1;
  }
  if (strcmp(args[0], "jobs") == 0) {
    return 1;
  }
  if (strcmp(args[0], "wait") == 0) {
    return 1;
  }
  return 0;
}

void handle_internal_command(char** args) {
  // Percorre a string de entrada
  int i = 0;
  while (args[i] != NULL) {
    if (strcmp(args[i], "exit") == 0) {
      // Se um dos elementos for igual a "exit", encerra-se o minishell
      printf("Mini-Shell encerrado com status 0 \n");
      exit(0);
    }
    else if (strcmp(args[i], "pid") == 0) {
      // Se um dos elementos for "pid", imprime o PID do shell e do último filho
      printf("PID do shell: %5d\n", getpid());
      if (last_child_pid > 0) {
        printf("PID do último filho: %d\n", last_child_pid);
      }
    }
    else if (strcmp(args[0], "jobs") == 0) {
      // Se um dos elementos for igual a "jobs", lista os processos em background
      if (bg_count == 0) {
        printf("Nenhum processo em background\n");
      }
      else {
        printf("Processos em background:\n");
        for (int i = 0; i < bg_count; i++) {
          printf("[%d] %d Running\n", i + 1, bg_processes[i]);
        }
      }
    }
    else if (strcmp(args[0], "wait") == 0) {
      // Se um dos elementos for igual a "wait", aguarda os processos em background
      printf("Aguardando processos em background...\n");
      while (bg_count > 0) {
        int status;
        pid_t pid = wait(&status); // Bloqueia até um processo terminar
        if (pid > 0) {
          // Procurar o pid na lista
          for (int i = 0; i < bg_count; i++) {
            if (bg_processes[i] == pid) {
              // Desloca todos os elementos para "fechar o buraco"
              for (int j = i; j < bg_count - 1; j++) {
                bg_processes[j] = bg_processes[j + 1];
              }
              bg_count--;
              break;
            }
          }
          printf("Processo %d terminou.\n", pid);
        }
      }
      printf("Todos os processos terminaram\n");
    }
    i++;
  }
}

int main() {
  char input[MAX_CMD_LEN];
  char* args[MAX_ARGS];
  int background;

  printf("Mini-Shell iniciado (PID: %d)\n", getpid());
  printf("Digite 'exit' para sair\n\n");

  while (1) {
    // Limpa processos terminados
    clean_finished_processes();

    printf("minishell> ");
    fflush(stdout);
    // Ler entrada do usuário
    if (!fgets(input, sizeof(input), stdin)) {
      break;
    }
    // Remover quebra de linha
    input[strcspn(input, "\n")] = 0;

    // Ignorar linhas vazias
    if (strlen(input) == 0) {
      continue;
    }

    // Fazer parsing do comando
    parse_command(input, args, &background);

    // Executar comando
    if (is_internal_command(args)) {
      handle_internal_command(args);
    }
    else {
      execute_command(args, background);
    }
  }
  printf("Shell encerrado!\n");
  return 0;
}