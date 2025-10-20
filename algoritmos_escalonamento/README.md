# Projeto de Algoritmos de Escalonamento

Este repositório contém o código-fonte para o projeto de Algoritmos de Escalonamento, configurado como um monorepo.

* **Front-end:** React + TypeScript (criado com Vite)
* **Back-end:** Node.js + Express + TypeScript

## Pré-requisitos

Antes de começar, garanta que você tenha os seguintes softwares instalados na sua máquina:

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (v20.x ou superior)
* [npm](https://www.npmjs.com/) (v10.x ou superior)

Recomendamos usar o [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm) para gerenciar suas versões do Node.js.

## Instalação e Configuração

Siga estes passos para configurar o ambiente de desenvolvimento local.
# 1. Instala as dependências da RAIZ (ex: 'concurrently' para rodar os scripts)
```sh
npm install
```

# 2. Instala as dependências do FRONT-END (React, Vite, etc.)
```sh
npm install --prefix frontend
```

# 3. Instala as dependências do BACK-END (Express, TypeScript, etc.)
```sh
npm install --prefix backend
```

# Rode o projeto com:
Navegue até a pasta raiz /algoritmos_escalonamento e rode:
```sh
npm run dev
```

## Estrutura de pastas

```
/algoritmos_escalonamento
|
|-- /backend         # Contém o código do servidor (Node.js + Express)
|   |-- /src
|   |-- package.json   # Dependências do back-end
|
|-- /frontend        # Contém o código do cliente (React + Vite)
|   |-- /src
|   |-- package.json   # Dependências do front-end
|
|-- .gitignore       # Arquivos ignorados pelo Git
|-- package.json     # Dependências da raiz (scripts para o monorepo)
|-- README.md        # Este arquivo
```