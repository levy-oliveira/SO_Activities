/*
Criação de processos em UNIX, com execução de outro binário

Compilar com gcc -Wall fork-execve.c -o fork-execve

Carlos Maziero, DINF/UFPR 2020
*/

#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/wait.h>

int main (int argc, char *argv[], char *envp[])
{
  int retval ;
   
  printf ("Ola, sou o processo %5d\n", getpid()) ;
  retval = fork () ;
  printf ("[retval: %5d] sou %5d, filho de %5d\n", retval, getpid(), getppid()) ;
             
  if ( retval < 0 )       // erro no fork ()
  {
    perror ("Erro: ") ;
    exit (1) ;
  }
  else 
    if ( retval > 0 )     // sou o processo pai
      wait (0) ;
    else                  // sou o processo filho
    {
      execve ("/bin/date", argv, envp) ;
      perror ("Erro") ;
    }

  printf ("Tchau de %5d!\n", getpid()) ;
  exit (0) ;
}