# Contributing to ChatBook-Desk

Obrigado por considerar contribuir com o ChatBook-Desk.

Nosso objetivo é manter um projeto organizado, previsível e fácil de evoluir. Este guia define padrões para garantir qualidade, consistência e facilidade de manutenção.

---

# Formas de contribuir

Você pode contribuir de várias maneiras:

- reportando bugs
- sugerindo melhorias
- propondo novas funcionalidades
- melhorando documentação
- enviando correções de código
- revisando pull requests
- sugerindo melhorias de arquitetura
- contribuindo com testes

---

# Antes de começar

Antes de criar uma issue ou pull request:

1. Verifique se já existe uma issue semelhante
2. Leia a documentação disponível
3. Garanta que a proposta faz sentido para o objetivo do projeto
4. Prefira mudanças pequenas e bem definidas

---

# Padrões de código

## Linguagem

O projeto utiliza:

- TypeScript no backend
- TypeScript no frontend
- Node.js
- Docker

---

## Boas práticas

- código simples e legível
- evitar complexidade desnecessária
- nomes descritivos para variáveis e funções
- evitar abreviações confusas
- manter consistência entre arquivos
- evitar duplicação de lógica
- separar responsabilidades corretamente

---

## Estrutura

Organização esperada:

backend
- controllers
- services
- models
- repositories
- middlewares
- queues
- utils

frontend
- pages
- components
- services
- stores
- hooks
- utils

---

## Convenções

### nomes de arquivos

usar padrão:

kebab-case

exemplos:

ticket-service.ts  
user-controller.ts  
conversation-list.tsx  

---

### nomes de variáveis

usar padrão:

camelCase

exemplo:

conversationId  
createdAt  
ticketStatus  

---

### nomes de classes

usar padrão:

PascalCase

exemplo:

TicketService  
UserController  
ConversationRepository  

---

# Commits

Utilizar mensagens claras e objetivas.

Recomendado:

feat: adiciona filtro por status de ticket  
fix: corrige erro ao enviar mensagem  
refactor: melhora estrutura do serviço de fila  
docs: atualiza documentação do SLA  
test: adiciona teste para criação de ticket  

---

# Pull Requests

Para enviar um Pull Request:

1. Fork do repositório
2. Criar branch descritiva
3. Implementar alteração
4. Garantir que o código compila
5. Garantir que não quebra funcionalidades existentes
6. Enviar Pull Request com descrição clara

---

## Nome da branch

padrão recomendado:

feature/nome-da-feature  
fix/nome-do-bug  
refactor/nome-da-melhoria  
docs/nome-da-documentacao  

exemplos:

feature/sla-rules  
fix/message-send-error  
refactor/ticket-service  
docs/api-description  

---

# Issues

Ao criar uma issue, informe:

- descrição clara do problema
- comportamento esperado
- comportamento atual
- passos para reproduzir
- prints ou logs (se possível)

---

# Padrões de arquitetura

Antes de adicionar nova funcionalidade:

verificar:

- se já existe estrutura semelhante
- se pode reutilizar serviço existente
- se a lógica deve ficar em service
- se precisa criar módulo separado

evitar:

- lógica diretamente no controller
- dependências desnecessárias
- acoplamento forte entre módulos

---

# Testes

Sempre que possível:

- adicionar testes para novas funcionalidades
- garantir que testes existentes continuam passando
- evitar quebrar funcionalidades atuais

---

# Segurança

Nunca enviar:

- tokens
- senhas
- chaves privadas
- variáveis de ambiente
- dados sensíveis

Utilizar arquivos:

.env.example

---

# Documentação

Atualizar documentação quando:

- adicionar funcionalidade
- alterar comportamento existente
- modificar estrutura
- criar novos módulos

---

# Objetivo do projeto

Manter o ChatBook-Desk:

- modular
- escalável
- fácil de manter
- fácil de evoluir
- previsível
- bem documentado

---

# Dúvidas

Caso tenha dúvidas sobre implementação:

abra uma issue descrevendo:

- o problema
- a proposta
- possíveis alternativas

---

# Licença

Ao contribuir, você concorda que seu código poderá ser distribuído sob a licença definida pelo projeto.

---

Obrigado por contribuir com o ChatBook-Desk.