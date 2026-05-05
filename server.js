require('dotenv').config();
const express = require('express');
const shodan = require('shodan-client');

const app = express();
const port = process.env.PORT || 3000;
const SHODAN_API_KEY = process.env.SHODAN_API_KEY;

const cache = { ips: {}, queries: {} };

app.use(express.static(__dirname));

// RUTA PARA IPS ESPECÍFICAS
app.get('/scan', async (req, res) => {
    const ip = req.query.ip;
    if (cache.ips[ip]) return res.json({ status: "success", data: cache.ips[ip], fromCache: true });
    
    try {
        const results = await shodan.host(ip, SHODAN_API_KEY);
        cache.ips[ip] = results;
        res.json({ status: "success", data: results, fromCache: false });
    } catch (e) {
        res.status(500).json({ status: "error", message: "No se halló la IP" });
    }
});

// RUTA DE BÚSQUEDA GENERAL (Soporta términos libres)
app.get('/search', async (req, res) => {
    const { q } = req.query;
    if (cache.queries[q]) return res.json({ status: "success", data: cache.queries[q], fromCache: true });

    try {
        console.log(`> Ejecutando búsqueda en Shodan: ${q}`);
        const results = await shodan.search(q, SHODAN_API_KEY);
        cache.queries[q] = results;
        res.json({ status: "success", data: results, fromCache: false });
    } catch (e) {
        console.error("Error Shodan:", e.message);
        res.status(500).json({ status: "error", message: e.message });
    }
});

app.listen(port, () => {
    console.log(`🚀 Terminal lista en http://localhost:${port}`);
});