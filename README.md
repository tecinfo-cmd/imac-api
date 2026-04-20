# IMAC

Sistema destinado ao gerenciamento de do programa PREM (Programa de Reinserção de Monitoramento) é um programa estruturado para promover a conformidade socioambiental em propriedades rurais, geralmente focado no contexto de regularização ambiente, uso sustentável da terra e monitoramento continuo de práticas agrícolas e pecuárias. 

# Tecnologias e Ferramentas
Runtime: Node.js
Framework: NestJS
Linguagem: TypeScript
ORM: Prisma (ou TypeORM)
Banco de Dados: PostgreSQL / MongoDB
Documentação: Swagger (OpenAPI)
Validação: Class-validator & Class-transformer

# Integrações
Esta aplicação integra-se com os seguintes serviços:
Autenticação: JWT (JSON Web Tokens)
Envio de E-mails: SendGrid via @nestjs-modules/mailer
Cloud Storage: 

# Pré-requisitos
Node.js (v18+)
NPM ou Yarn
Docker (opcional, para banco de dados)

# bash
git clone https://github.com/tecinfo-cmd/imac-api.git
cd seu-repositorio

npm install

npm run start-dev