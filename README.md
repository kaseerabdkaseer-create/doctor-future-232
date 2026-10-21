# Doctor Future 232+ — Backend starter

This is a small Node.js backend that keeps the OpenRouter API key on the server, not in the HTML app.

## Hosting settings
- Build command: `npm install`
- Start command: `npm start`
- Environment variable: `OPENROUTER_API_KEY` = your NEW OpenRouter key
- Optional environment variable: `OPENROUTER_MODEL` = `minimax/minimax-m3.1-flash:free`

Do not put the API key in `server.js`, HTML, GitHub, or a ZIP shared publicly.

## Endpoints
- `GET /` — status
- `GET /health` — health check
- `POST /api/chat` — JSON body such as:
  `{"question":"حل المعادلة x^2 - 5x + 6 = 0"}`

The response shape is `{ "answer": "...", "model": "..." }`.

## Important
This backend is a starter service. The existing HTML app still needs to be connected to the deployed `/api/chat` endpoint and tested. This package alone does not complete that integration.
