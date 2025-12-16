#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include "init.cpp"
#include "alloc.cpp"
#include "Bloco.h"

using namespace std;


int main(){

    string linha;
    vector<Bloco> memoria; // vetor de blocos
    bool memoria_iniciada = false;
    int cont_proc = 0;

    while(true){
        printf("> ");
        getline(cin, linha);

        // Separar linha em palavras
        stringstream ss(linha);
        vector<string> palavras;
        string palavra;
        
        while(ss >> palavra){
            palavras.push_back(palavra);
        }

         // Verificar se tem palavras
        if(palavras.empty()) continue;

        if(palavras[0] == "exit" && palavras.size() == 1){
            printf("Saindo do simulador \n");
            return 0;
        }
        else if(palavras[0] == "init" && palavras.size() == 2){
            init(palavras[1], memoria, memoria_iniciada); //palavras[1] é o tamanho do vetor que simula a memoria
            memoria_iniciada = true;
        }
        else if(palavras[0] == "alloc" && palavras.size() == 3){
            alloc(palavras[1], palavras[2], memoria, memoria_iniciada, cont_proc); //palavras[1] é o tamanho e palavras[2] é o algoritmo
        }
        else if(palavras[0] == "free_id" && palavras.size() == 2){
            //free_id(palavras[1]); //palavras[1] é o id de um bloco
        }
        else if(palavras[0] == "choose_block" && palavras.size() == 3){
            //choose_block(palavras[1], palavras[2]); //palavra[s1] é o tamanho e palavras[2] é o algoritmo
        }
        else if(palavras[0] == "show" && palavras.size() == 1){
            //show();
        }
        else if(palavras[0] == "stats" && palavras.size() == 1){
            //stats()
        }
        else {
            printf("Digite um comando válido \n");
            continue;
        }
    }
}