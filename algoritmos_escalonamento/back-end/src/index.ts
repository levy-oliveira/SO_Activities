// backend/src/index.ts
import express = require('express');
const cors = require('cors'); // Importe o cors

const app = express();
const port = 3001;

// Isso permite que o seu front-end (localhost:5173) acesse o back-end
app.use(cors({
  origin: 'http://localhost:5173' 
}));


// Middleware para parsear JSON
app.use(express.json());

// Uma rota de API de exemplo
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Olá do back-end TypeScript!' });
});

app.listen(port, () => {
  console.log(`[servidor]: Back-end rodando em http://localhost:${port}`);
});