#include <vector>
#include <string>
#include "Bloco.h"

using namespace std;

int alloc(string tamanho, string algoritmo, vector<Bloco> &memoria, bool mem_iniciada, int &cont_proc){
    size_t pos = 0;
    int tamanho_int = stoi(tamanho, &pos);
    while (pos < tamanho.size() && isspace((unsigned char)tamanho[pos])) pos++;
    if (pos != tamanho.size()) {
        printf("Tamanho inválido (contém caracteres extras)\n");
        return -1;
    }
    if (tamanho_int <= 0) {
        printf("Tamanho inválido: deve ser positivo\n");
        return -1;
    }

    if(!mem_iniciada){
        printf("Não há vetor de memória inicializado para haver alocação. Use init para inicializar um vetor\n");
        return -1;
    }
    int tamanho_int = stoi(tamanho);

    if(!mem_iniciada){
        printf("Não há vetor de memória inicializado para haver alocação. Use init para inicializar um vetor\n");
        return -1;
    }

    if(algoritmo == "first-fit"){
        int newId = cont_proc + 1;
        for (size_t i = 0; i < memoria.size(); ++i) {
            Bloco &b = memoria[i];
            if (b.free && b.size >= tamanho_int) {
                int remaining = b.size - tamanho_int;
                // atualiza bloco alocado
                b.size = tamanho_int;
                b.free = false;
                b.ownerId = newId;

                // cria bloco livre remanescente, se houver
                if (remaining > 0) {
                    Bloco sobra(-1, b.start + tamanho_int, remaining, true, -1);
                    memoria.insert(memoria.begin() + i + 1, sobra);
                }

                printf("Alocado processo id=%d, inicio=%d, tamanho=%d\n", newId, b.start, b.size);
                return newId;
            }
        }
        printf("Falha na alocação: espaço insuficiente (first-fit)\n");
        return -1;
    }
    else if(algoritmo == "best-fit"){
        //
    }
    else if(algoritmo == "worst-fit"){
        //
    }
    else{
        printf("Não há algoritmo com esse nome \n");
        return 0;
    }
    return 0;
}