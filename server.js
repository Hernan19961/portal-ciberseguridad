require('dotenv').config();
const express = require('express');
const shodan = require('shodan-client');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const SHODAN_API_KEY = process.env.SHODAN_API_KEY;

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(__dirname));

// Ruta principal para el escaneo
app.get('/scan', async (req, res) => {
    const ip = req.query.ip;

    // Validación de entrada
    if (!ip || ip.trim() === "") {
        return res.status(400).json({
            status: "error",
            message: "Debes proporcionar una dirección IP válida."
        });
    }

    try {
        console.log(`> Consultando Shodan para la IP: ${ip}`);
        const searchResults = await shodan.host(ip, SHODAN_API_KEY);

        res.json({
            status: "success",
            data: searchResults
        });
    } catch (error) {
        console.error("Error en la API de Shodan:", error.message);
        res.status(500).json({
            status: "error",
            message: "No se encontró información o la IP es inválida."
        });
    }
});

app.listen(port, () => {
    console.log(`🚀 Servidor listo en: http://localhost:${port}`);
});