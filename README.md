# 📊 Ilumeo - Tech Lead Challenge

## **Evolução Temporal de Taxa de Conversão**

---

## **Sumário**

* [Visão Geral](#visão-geral)
* [Arquitetura do Projeto](#arquitetura-do-projeto)
* [Detalhes de Implementação](#detalhes-de-implementação)
* [Otimizações e Performance](#otimizações-e-performance)
* [Decisões e Trade-offs](#decisões-e-trade-offs)
* [Como rodar o projeto (local/docker)](#como-rodar-o-projeto)
* [Testes Automatizados](#testes-automatizados)
* [Deploy & Hospedagem](#deploy--hospedagem)
* [Possíveis Melhorias Futuras](#possíveis-melhorias-futuras)

---

## **Visão Geral**

O desafio consiste em criar uma solução completa (backend e frontend) para exibir a **evolução temporal da taxa de conversão por canal** a partir de um banco PostgreSQL com milhões de registros.

O sistema permite filtrar por período, canal e granularidade temporal (dia, mês, ano), além de apresentar um dashboard visual para análise.

---

## **Arquitetura do Projeto**

* **Frontend:** React + Recharts + Axios
  Interface rica, responsiva, com dashboard e tabela detalhada.

* **Backend:** Node.js + Express + Knex
  API performática para consultas SQL customizadas e flexíveis.

* **Banco de Dados:** PostgreSQL
  Organizado via Docker com seed dos dados reais.

* **Docker:** Orquestração dos serviços para fácil setup, isolando dependências.

* **Testes:**

  * **Frontend:** React Testing Library + Jest
  * **Backend:** Jest + Supertest

### **Estrutura dos Diretórios**

```
├── backend
│   ├── db
│   │   └── knex.ts
│   ├── Dockerfile
│   ├── jest.config.js
│   ├── knexfile.ts
│   ├── package.json
│   ├── src
│   │   ├── index.ts
│   │   └── routes
│   └── tsconfig.json
├── docker-compose.yml
├── frontend
│   ├── Dockerfile
│   ├── jest.config.js
│   ├── package.json
│   ├── public
│   │   └── index.html
│   └── src
│       ├── App.test.tsx
│       ├── App.tsx
│       ├── index.tsx
│       └── setupTests.js
├── init.sql
└── README.md
```

---

## **Detalhes de Implementação**

### **Banco de Dados**

* Utiliza **PostgreSQL** com schema `inside` e tabela `users_surveys_responses_aux`.
* \*\*Campo \*\*\`\` adicionado para suportar análise temporal.
* Dados podem ser carregados via script `.sql` ou init do Docker.

### **Backend**

* **Node.js + Express**: Alta produtividade, comunidade madura, ótimo suporte a APIs REST.
* **Knex**: Query builder robusto, seguro contra SQL injection e permite fácil portabilidade.
* **Rota principal:**
  `GET /conversion-rate?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&groupBy=day|month|year&channel=xxx`
* **SQL otimizado:** Usa `DATE_TRUNC` e `GROUP BY` para sumarizar grandes volumes com performance, retornando apenas os agregados necessários.

### **Frontend**

* **React**: Reatividade e experiência moderna.
* **Recharts**: Gráficos ricos e responsivos com mínimo código.
* **Axios**: Simples, eficiente para requisições HTTP.
* **Filtros**: Interface permite seleção dinâmica de período, canal, granularidade.

---

## **Otimizações e Performance**

* **Consulta SQL otimizada**:

  * Uso de índices (no mundo real, recomendaria índice em `(created_at, origin)`).
  * Uso de agregações e filtros SQL para evitar trazer dados desnecessários.
  * Consulta sempre paginada/sumarizada (apenas contagem e soma de campos relevantes).
* **Backend stateless**: Escalabilidade simples, fácil deploy em múltiplos pods/containers.
* **Frontend desacoplado**: Dashboard consome apenas o necessário, evitando re-renderizações desnecessárias.

---

## **Decisões e Trade-offs**

* **Stack JavaScript/TypeScript**:
  Facilidade de integração entre backend e frontend, curva de aprendizado reduzida, ampla comunidade.

* **Express + Knex**:
  Em vez de ORM completo (como TypeORM/Prisma), preferi Knex para evitar overhead de modelos e garantir total controle sobre SQL e performance.

* **Recharts**:
  Trade-off entre facilidade e performance. Recharts é simples para dashboards típicos; se fossem centenas de séries/dados, consideraria chart libs baseadas em canvas/WebGL (ex: ECharts).

* **Docker**:
  Facilidade de setup/reprodutibilidade em qualquer ambiente. Trade-off: imagens levemente maiores e um passo a mais no CI.

* **Testes Unitários e de Integração**:

  * Foco no backend para garantir corretude dos cálculos e queries.
  * Foco no frontend para garantir renderização e comportamento do dashboard.
  * Não implementei testes E2E (por tempo/desafio), mas a arquitetura é facilmente extensível para Cypress/Playwright.

---

## **Como rodar o projeto**

### **1. Pré-requisitos**

* Docker e Docker Compose instalados
* Node.js (apenas se quiser rodar fora do Docker)

### **2. Subindo tudo via Docker**

```sh
docker-compose up --build
```

* Banco sobe em `localhost:5432`
* Backend em `localhost:3001`
* Frontend em `localhost:3000`

### **3. Acessando**

* Frontend: [http://localhost:3000](http://localhost:3000)
* API: [http://localhost:3001/conversion-rate](http://localhost:3001/conversion-rate)

---

## **Testes Automatizados**

### **Backend**

```sh
cd backend
npm install
npm test
```

* Testes cobrem rotas, cálculo de conversão, erros e filtros.

### **Frontend**

```sh
cd frontend
npm install
npm test
```

* Testes cobrem renderização dos gráficos, tabelas e consumo correto da API.

---

## **Deploy & Hospedagem**

* **Frontend:**
  Pronto para deploy em Vercel, Netlify ou qualquer serviço estático. Basta buildar (`npm run build`) e subir o `build/`.

* **Backend:**
  Pode ser hospedado no Render, Railway, Fly.io, Heroku (se suportar PostgreSQL), ou em qualquer VPS.

* **Banco:**
  Fácil de migrar para Supabase, Neon, ElephantSQL ou outro PostgreSQL gerenciado. Basta importar o `.sql` inicial.

---

## **Possíveis Melhorias Futuras**

* Paginação/stream de dados para queries massivas
* Filtros por múltiplos canais simultâneos
* Exposição de API GraphQL para queries mais flexíveis
* Autenticação (JWT, OAuth)
* Testes E2E integrados (Cypress/Playwright)
* Monitoramento com Prometheus/Grafana
* Uso de cache (Redis) para consultas mais frequentes

---

> **Mateus Louback**

---
