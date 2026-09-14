# Base Auth

**🇺🇸 Also available in [English](README.md).**

Uma base sólida de autenticação e controle de acesso para o seu próximo produto —
extraída e amadurecida a partir de uma plataforma imobiliária real, para que você
não precise construir login, sessões e permissões do zero toda vez que começar
algo novo.

## Por que o Base Auth

Autenticação parece simples até deixar de ser: condições de corrida no refresh
de tokens, casos extremos de redefinição de senha, verificações de permissão que
precisam ser rápidas *e* corretas, fluxos de e-mail que precisam funcionar bem
mesmo em ambiente de desenvolvimento. O Base Auth empacota a versão já resolvida
de tudo isso em um back-end e um front-end que já conversam entre si, para que
seu time gaste tempo no produto em vez de resolver identidade de novo.

Ele foi pensado como um **ponto de partida para você bifurcar (fork)**, não como
uma dependência de caixa-preta — cada parte é código NestJS e React comum, feito
para ser lido, alterado e estendido.

## O que você recebe

- **Sessões seguras** — tokens JWT de acesso/refresh com renovação silenciosa,
  logout e logout em todos os dispositivos, e revogação apoiada em Redis.
- **Papéis e permissões (RBAC)** — uma divisão `ADMIN` / `USER` já pronta, além
  do modelo de dados e dos guards para definir seus próprios papéis e permissões
  granulares.
- **Ciclo de vida completo da conta** — cadastro, verificação de e-mail,
  esqueci/redefinir senha, troca de senha e exclusão de conta com período de
  carência.
- **Perfis de usuário** — uma página e uma API de perfil já funcionando.
- **Um front-end compatível** — telas de login, cadastro e senha com validação,
  tema claro/escuro, e a integração com a API já conectada.
- **Roda em qualquer lugar em minutos** — um único comando do Docker Compose
  sobe back-end, front-end, banco de dados e cache juntos, com valores padrão já
  configurados.

## Como começar

```bash
npm run up      # sobe Postgres, Redis, back-end e front-end
```

O back-end roda em http://localhost:5000 (documentação da API em `/api`) e o
front-end em http://localhost:5173. Cadastre uma conta pela interface e pronto.

Para o guia de configuração completo, variáveis de ambiente, detalhes de
arquitetura e o que esperar ao estender o projeto, veja
**[DEVELOPER.md](DEVELOPER.md)** (em inglês).

---

🤖 Extraído com [Claude Code](https://claude.com/claude-code)
