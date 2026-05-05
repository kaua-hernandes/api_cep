## Índice
- Descrição
- Arquitetura
- Fluxos de operação
  - Estratégia de consulta (Lazy Load)
  - Persistência assíncrona
- Concorrência e idempotência
- Configuração e execução
  - Variáveis de ambiente
  - Execução via Docker
- Documentação (Swagger)
- Notas sobre decisões técnicas

---

## Descrição
Serviço para consulta de CEPs e persistência de histórico. Prioriza baixa latência na resposta ao cliente com persistência eventual via fila.

## Arquitetura
Camadas principais:
- Domain: entidades (ex.: Address) e interfaces (Ports).
- Application: casos de uso (ex.: GetAddressUseCase).
- Infrastructure: implementações (TypeORM, Redis, Axios para ViaCEP, BullMQ, Workers).

## Fluxos de operação
### 1) Estratégia de consulta — Lazy Load
Hierarquia de consulta para otimizar performance:
1. Cache (Redis) — verifica TTL (1 hora).
2. Banco (Postgres) — histórico permanente.
3. API externa (ViaCEP) — chamada apenas se não encontrado localmente.

### 2) Persistência assíncrona
- Quando o CEP é obtido do ViaCEP (novo):
  - Retorna imediatamente ao usuário (baixa latência).
  - Enfileira um job em `address-persistence` (BullMQ / Redis).
  - Worker processa o job em background, grava no Postgres e atualiza o cache.

## Concorrência e idempotência
- Worker verifica existência do CEP antes de inserir para evitar duplicidade.
- Banco possui constraint UNIQUE no campo CEP para garantir integridade atômica.
- Estratégia anti-race: preferência por upsert/INSERT ... ON CONFLICT ou rely on DB unique constraint; locks distribuídos (ex.: RedLock) não são usados por padrão para evitar complexidade/latência, mas são recomendados quando estrita ordem/exactness for necessária.

## Configuração e execução
### Variáveis de ambiente (.env)
Principais variáveis:
- DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME
- REDIS_HOST, REDIS_PORT
- VIA_CEP_BASE_URL

### Execução via Docker (recomendado)
O repositório inclui Docker Compose com volumes persistentes para Postgres e Redis.

docker compose up --build

## Documentação da API (Swagger)
Após iniciar a aplicação, a documentação interativa está disponível em:
http://localhost:3000/api/docs

## Notas sobre decisões técnicas
-Mensageria (Redis + BullMQ): O sistema utiliza uma fila de tarefas em segundo plano para que o usuário receba a resposta instantaneamente, enquanto a gravação no banco de dados acontece de forma assíncrona
-Performance (Lazy Load): Implementação de Cache-on-read com TTL de 1 hora, reduzindo o consumo da API externa e acelerando consultas repetidas através do Redis
-Resiliência (Retries & Timeouts): Chamadas ao ViaCEP possuem limites de tempo (timeouts) e a fila de persistência utiliza políticas de tentativa (retries) para garantir que instabilidades externas não derrubem a API
-Arquitetura Hexagonal (Ports & Adapters): O código é modular e baseado em interfaces, permitindo trocar o banco de dados ou provedores externos com impacto zero na lógica de negócio
-Idempotência: O sistema verifica se o CEP já existe antes de salvar, evitando duplicidade de dados no banco de dados relacional