# tarefa-copinha-frontend
> Projeto em React desenvolvido como desafio final do processo seletivo da IN Júnior, aplicando os conceitos de componentização, rotas, consumo de API e autenticação na construção do Cop{IN}ha — um site de notícias, classificação e simulação de resultados da Copa do Mundo, com painel administrativo completo.

[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)

---

## Sobre o projeto

O Cop{IN}ha é o front-end de uma aplicação com um site público de notícias, classificação e simulador de resultados da Copa do Mundo, além de um painel administrativo completo para manter esse conteúdo atualizado. O projeto segue o layout proposto no Figma da IN Júnior e consome a API própria do time de back-end ([Projeto-CopINha-BackEnd](https://github.com/lucasnogueirachaves/Projeto-CopINha-BackEnd)).

---

## Estrutura

```
projeto/
├── src/
│   ├── components/             # Componentes reutilizáveis (Header, Footer, cards, modais, sidebar do admin etc)
│   ├── pages/
│   │   ├── Home/               # Últimas notícias e último resultado
│   │   ├── Noticia/            # Notícia específica + notícias relacionadas
│   │   ├── Grupos/             # Classificação dos grupos
│   │   ├── Jogos/              # Listagem de partidas com filtro (todos/encerrados/próximos)
│   │   ├── Simulador/          # Simulação de resultados sem alterar dado real
│   │   ├── Login/              # Autenticação do administrador
│   │   └── admin/              # Painel administrativo
│   │       ├── Dashboard/      # Estatísticas gerais e atividade recente
│   │       ├── Noticias/       # Listagem + exclusão de notícias
│   │       ├── Grupos/         # Criação + exclusão de grupos
│   │       ├── Times/          # Criação + exclusão de times, com classificação
│   │       ├── Jogos/          # Criação + exclusão de partidas
│   │       └── Estadios/       # Listagem + exclusão de estádios
│   ├── services/               # Consumo da API (mockData.ts) e cálculo de classificação (standings.ts)
│   ├── store/                  # Store de autenticação (zustand + persist)
│   ├── types/                  # Tipos TypeScript compartilhados da API
│   ├── utils/                  # Validações (zod)
│   ├── App.tsx                 # Definição das rotas
│   └── main.tsx                # Ponto de entrada
├── index.html
├── package.json                # Dependências do projeto
├── package-lock.json           # Versões travadas das dependências
├── tsconfig.json               # Configuração do compilador TypeScript
└── vite.config.ts              # Configuração do Vite
```

---

## Conteúdo

| Página | Funcionalidade |
|---|---|
| `Home` | Último resultado, últimas notícias em destaque e em grid, com paginação |
| `Notícia` | Título, subtítulo, autor, data, imagem, corpo do texto e notícias relacionadas |
| `Grupos` | Classificação de cada grupo (V/E/D/PTS, saldo de gols, classificados) |
| `Jogos` | Listagem de partidas com filtro por situação (todos/encerrados/próximos) |
| `Simulador` | Simulação de resultados das próximas partidas, recalculando a classificação sem alterar dado real |
| `Login` | Autenticação do administrador (e-mail/senha validados com zod) |
| `Admin / Dashboard` | Estatísticas gerais, últimas notícias e resultados recentes |
| `Admin / Notícias` | Busca, criação (ilustrativa) e exclusão de notícias |
| `Admin / Grupos` | Criação (com seleção de times) e exclusão de grupos |
| `Admin / Times` | Criação e exclusão de times, com estatísticas calculadas |
| `Admin / Jogos` | Criação e exclusão de partidas |
| `Admin / Estádios` | Listagem e exclusão de estádios |

---

## Tecnologias utilizadas

| Ferramenta | Uso |
|---|---|
| `React` | Componentização e gerenciamento de estado da interface |
| `TypeScript` | Tipagem estática do projeto e dos dados da API |
| `Vite` | Build e ambiente de desenvolvimento |
| `React Router` | Roteamento entre páginas públicas, login e área administrativa protegida |
| `Zustand` | Store de autenticação, com persistência do token via `persist` |
| `Zod` | Validação do formulário de login (e-mail, regras de senha) |
| `Lucide React` | Ícones |

---

## Como executar

### 1. Instale as dependências
```bash
npm install
```

### 2. Configure a URL da API
```bash
cp .env.example .env
```
Por padrão, `VITE_API_URL` aponta para `http://localhost:3333` — ajuste se o back estiver rodando em outra porta/endereço.

### 3. Rode o ambiente de desenvolvimento
```bash
npm run dev
```

### 4. Gere o build de produção
```bash
npm run build
```

A aplicação consome a API do [Projeto-CopINha-BackEnd](https://github.com/lucasnogueirachaves/Projeto-CopINha-BackEnd) (Fastify + Prisma). É necessário que o back esteja rodando localmente (com o banco populado, ex: via `seed.ts`) para que Notícias, Times, Grupos, Jogos e Login funcionem. Estádios não têm entidade própria no back (partidas só guardam o campo `local`), então essa listagem continua com dados fixos no front.

---

## Autores

Front-end desenvolvido individualmente por **Pedro Lucas Almeida dos Santos**, como parte do desafio final em grupo do processo seletivo.

Back-end desenvolvido por Henrique e Lucas Nogueira ([Projeto-CopINha-BackEnd](https://github.com/lucasnogueirachaves/Projeto-CopINha-BackEnd)), como parte do desafio final em grupo do processo seletivo.
