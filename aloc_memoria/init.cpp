#include <vector>
#include <string>
#include "Bloco.h"
#include <stdexcept>

using namespace std;

int init(string tamanho, vector<Bloco> &memoria, bool &mem_iniciada){
    if(mem_iniciada){
        printf("Vetor de memória já inicializado\n");
        return -1;
    }
    try {
        size_t pos = 0;
        int tamanho_int = stoi(tamanho, &pos);

        // permite espaços finais, mas rejeita outros caracteres extras
        while (pos < tamanho.size() && isspace((unsigned char)tamanho[pos])) pos++;
        if (pos != tamanho.size()) {
            printf("Valor inválido para representar o tamanho do vetor de memória\n");
            return -1;
        }

        if (tamanho_int <= 0) {
            printf("Tamanho inválido: deve ser um inteiro positivo\n");
            return -1;
        }

        memoria.clear();
        // bloco único livre cobrindo toda a memória
        memoria.emplace_back(0, 0, tamanho_int, true, -1, 0);
        mem_iniciada = true;
        printf("Memória inicializada com tamanho %d\n", tamanho_int);
        return 0;


    } catch(const invalid_argument&) {
        printf("Valor inválido para representar o tamanho do vetor de memória\n");
        return -1;
    } catch(const out_of_range&) {
        printf("Valor numérico fora do intervalo\n");
        return -1;
    }
}
