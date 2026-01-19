# Chá Revelação (estático)

Convite interativo com votação, placar e mensagem da IA.

## Publicar no Netlify

1. Suba este repositório no GitHub.
2. No Netlify, crie um novo site a partir do repositório.
3. Use:
   - Publish directory: `.`
   - Build command: (vazio)

## Configuração

- Atualize o `API_KEY` em `index.html` se quiser habilitar a mensagem da IA.
- Atualize o `GOOGLE_SHEET_URL` em `index.html` para apontar sua planilha.

## Rodar localmente

Abra `index.html` no navegador ou rode um servidor estático:

```bash
python -m http.server 5173
```
