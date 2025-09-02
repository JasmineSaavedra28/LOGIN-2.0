const express = require('express');
const app = express();

app.use(express.json());

// Ruta de prueba
app.get('/test', (req, res) => {
    res.json({ message: 'Servidor funcionando correctamente' });
});

// Ruta de salud
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor de prueba escuchando en el puerto ${PORT}`);
    console.log(`🔗 Test: http://localhost:${PORT}/test`);
    console.log(`🔗 Health: http://localhost:${PORT}/health`);
});
