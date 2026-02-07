# Vela do Rafael

Site-meme para acender velas e tirar o azar do Rafael. Cada vela aparece para todos no server-side e expira automaticamente.

## Rodando localmente

```bash
node server.js
```

Acesse: `http://localhost:3000`.

## Deploy (Render)

1. Crie uma conta no [Render](https://render.com/) e conecte o repositório.
2. Crie um **Web Service** apontando para este repositório.
3. O Render detecta o `render.yaml` e usa o comando `node server.js`.
4. Faça o deploy e compartilhe a URL gerada.

## Deploy (Docker)

```bash
docker build -t vela-rafael .
docker run -p 3000:3000 vela-rafael
```

Acesse: `http://localhost:3000`.
