require('dotenv').config();
const express = require('express');
const shodan = require('shodan-client');

const app = express();
const port = process.env.PORT || 3000;
const SHODAN_API_KEY = process.env.SHODAN_API_KEY;

// Memoria temporal para ahorrar créditos de API
const cache = { ips: {}, queries: {} };

app.use(express.static(__dirname));

// RUTA PARA ESCANEAR IP ESPECÍFICA
app.get('/scan', async (req, res) => {
    const ip = req.query.ip;
    if (cache.ips[ip]) return res.json({ status: "success", data: cache.ips[ip], fromCache: true });
    
    try {
        const results = await shodan.host(ip, SHODAN_API_KEY);
        cache.ips[ip] = results;
        res.json({ status: "success", data: results, fromCache: false });
    } catch (e) {
        res.status(500).json({ status: "error", message: e.message });
    }
});

// RUTA PARA BÚSQUEDA GENERAL
app.get('/search', async (req, res) => {
    const { q } = req.query;
    if (cache.queries[q]) return res.json({ status: "success", data: cache.queries[q], fromCache: true });

    try {
        const results = await shodan.search(q, SHODAN_API_KEY, { timeout: 10000 });
        cache.queries[q] = results;
        res.json({ status: "success", data: results, fromCache: false });
    } catch (e) {
        let msg = e.message;
        if (msg.includes("membership")) msg = "Error: Requiere cuenta Member para esta búsqueda.";
        res.status(500).json({ status: "error", message: msg });
    }
});

app.listen(port, () => {
    console.log(`\n=========================================`);
    console.log(`  SISTEMA ACTIVO: Hernán Olave 2026`);
    console.log(`  URL: http://localhost:${port}`);
    console.log(`=========================================\n`);
});