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
void parse_command(char *input, char **args, int *background) {
  // Define o valor padrão para background
  *background = 0;

  int i = 0;

  // Os delimitadores são espaço (" ") e tabulação ("\t").
  char *token = strtok(input, " \t");

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
  } else {
    // Se não for um comando em background, o array de argumentos deve
    // terminar com NULL. Isso é um requisito para a função execvp().
    args[i] = NULL;
  }
}
void execute_command(char **args, int background) {
  // TODO: Implementar execução
  // Usar fork() e execvp()
  // Gerenciar background se necessário
}

int is_internal_command(char **args) {
  // TODO: Verificar se é comando interno
  // exit, pid, jobs, wait
  return 0;
}

void handle_internal_command(char **args) {
  // TODO: Executar comandos internos
}

int main() {
  char input[MAX_CMD_LEN];
  char *args[MAX_ARGS];
  int background;

  printf("Mini-Shell iniciado (PID: %d)\n", getpid());
  printf("Digite 'exit' para sair\n\n");

  while (1) {
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
    } else {
      execute_command(args, background);
    }
  }
  printf("Shell encerrado!\n");
  return 0;
}