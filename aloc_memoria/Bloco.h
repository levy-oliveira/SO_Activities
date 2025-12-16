#pragma once
#include <cstdio>

struct Bloco {
    int id;        // identificador do bloco/alloc
    int start;     // offset inicial (0..N-1)
    int size;      // tamanho do bloco
    bool free;     // true = livre
    int ownerId;   // id do processo / -1 se livre

    Bloco(int id_ = -1, int start_ = 0, int size_ = 0, bool free_ = true, int ownerId_ = -1, int used_ = 0)
      : id(id_), start(start_), size(size_), free(free_), ownerId(ownerId_) {}
};