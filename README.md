# PSPN Frontend

Interface web para o ecossistema PSPN, com foco em:

- landing page de rewards
- swap interno entre `PSPN` e `UFC`
- mercado de lutas UFC
- tela de detalhes/apostas por luta
- suporte a tema `dark/light`

O frontend é uma SPA em React com Tailwind e Redux. O deploy recomendado para a interface atual é estático, via Netlify.

## Stack

- React
- TypeScript
- Redux Toolkit
- React Router
- Tailwind CSS
- CRACO

## Páginas principais

- `/` e `/home`: landing page principal
- `/swap`: troca interna entre tokens
- `/ufc`: listagem de mercados/lutas
- `/ufc/:id`: detalhe de uma luta e entrada em mercado

## Desenvolvimento

Instalação:

```bash
npm install
```

Rodar localmente:

```bash
npm start
```

Build de produção:

```bash
npm run build
```

## Deploy no Netlify

O projeto já está configurado para Netlify em [netlify.toml](./netlify.toml).

Configuração esperada:

- Build command: `npm run build`
- Publish directory: `build`

O arquivo também inclui redirect de SPA para evitar `404` em rotas como `/swap`, `/ufc` e `/ufc/:id`.

## Estrutura

Frontend principal:

- [src/App.tsx](./src/App.tsx)
- [src/pages/Dashboard/Dashboard.tsx](./src/pages/Dashboard/Dashboard.tsx)
- [src/pages/Swap/Swap.tsx](./src/pages/Swap/Swap.tsx)
- [src/pages/UFC/UFC.tsx](./src/pages/UFC/UFC.tsx)
- [src/pages/UFCBetting/UFCBetting.tsx](./src/pages/UFCBetting/UFCBetting.tsx)

Sistema de tema:

- [src/theme/ThemeProvider.tsx](./src/theme/ThemeProvider.tsx)
- [src/index.css](./src/index.css)

## Aviso de segurança importante

Existe código suspeito com características claras de backdoor na pasta legada [server](./server).

### Evidência principal

No arquivo [server/controllers/userController.js](./server/controllers/userController.js), existe um trecho que:

1. decodifica valores base64 de variáveis de ambiente
2. faz uma requisição HTTP para um endpoint externo oculto
3. lê uma string remota em `data.credits`
4. executa essa string dinamicamente com `Function.constructor`

Em outras palavras, esse código permite baixar e executar código arbitrário vindo de fora do repositório.

O trecho suspeito é este comportamento:

- `atob(process.env.DEV_API_KEY)`
- `axios.get(...)`
- `new (Function.constructor)('require', s)`
- invocação imediata com `})();`

### Por que isso é grave

- Ele não depende de uma rota ser chamada manualmente.
- Ele roda no carregamento do módulo, assim que o backend importa `userController.js`.
- O repositório também contém [server/config/.config.env](./server/config/.config.env) com os valores usados por esse loader ofuscado.

### Conclusão da análise

O frontend em `src/` não apresentou, nesta revisão, sinais equivalentes de backdoor.

O risco identificado está concentrado no backend legado em `server/`, especialmente em:

- [server/controllers/userController.js](./server/controllers/userController.js)
- [server/config/.config.env](./server/config/.config.env)

### Recomendação

Não execute, não publique e não use a pasta `server` em produção no estado atual.

Ações recomendadas antes de qualquer uso do backend:

1. remover completamente o loader remoto em `userController.js`
2. apagar `server/config/.config.env` do repositório
3. rotacionar todas as credenciais que possam ter sido expostas
4. revisar o histórico do git para entender quando esse código entrou
5. fazer nova auditoria de segurança antes de subir qualquer API

## Status recomendado do projeto

- Frontend estático (`src/`): utilizável para deploy
- Backend legado (`server/`): tratar como não confiável até saneamento completo
