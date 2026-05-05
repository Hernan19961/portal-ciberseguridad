require('dotenv').config();
const express = require('express');
const shodan = require('shodan-client');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Caché inteligente para ahorrar créditos
const cache = { shodan: {}, zoomeye: {}, ips: {} };

app.use(express.static(__dirname));

// RUTA PARA ESCANEO DE IP (Shodan es mejor para esto)
app.get('/scan', async (req, res) => {
    const ip = req.query.ip;
    if (cache.ips[ip]) return res.json({ status: "success", data: cache.ips[ip], fromCache: true });
    
    try {
        const results = await shodan.host(ip, process.env.SHODAN_API_KEY);
        cache.ips[ip] = results;
        res.json({ status: "success", data: results });
    } catch (e) {
        res.status(500).json({ status: "error", message: "SHODAN: " + e.message });
    }
});

// RUTA DE BÚSQUEDA MULTI-MOTOR
app.get('/search', async (req, res) => {
    const { q, engine } = req.query;

    // Verificar Caché
    if (cache[engine] && cache[engine][q]) {
        return res.json({ status: "success", data: cache[engine][q], fromCache: true });
    }

    if (engine === 'shodan') {
        try {
            const results = await shodan.search(q, process.env.SHODAN_API_KEY);
            cache.shodan[q] = results;
            res.json({ status: "success", data: results });
        } catch (e) {
            let msg = e.message;
            if (msg.includes("membership")) msg = "SHODAN requiere membresía para este término.";
            res.status(500).json({ status: "error", message: msg });
        }
    } else {
        // LÓGICA ZOOMEYE
        try {
            const response = await axios.get(`https://api.zoomeye.org/host/search?query=${encodeURIComponent(q)}`, {
                headers: { 'API-KEY': process.env.ZOOMEYE_API_KEY }
            });
            
            // Adaptar formato ZoomEye al formato de la App
            const adaptedData = {
                total: response.data.total,
                matches: response.data.matches.map(m => ({
                    ip_str: m.ip,
                    port: m.portinfo.port,
                    isp: m.asinfo ? m.asinfo.organization : 'N/A',
                    location: { city: m.geoinfo.city.names.en || '??' }
                }))
            };
            cache.zoomeye[q] = adaptedData;
            res.json({ status: "success", data: adaptedData });
        } catch (e) {
            res.status(500).json({ status: "error", message: "ZOOMEYE: API Key inválida o límite alcanzado." });
        }
    }
});

app.listen(port, () => {
    console.log(`\n=========================================`);
    console.log(`  CYBER-INTEL V5.0 - HERNÁN OLAVE 2026`);
    console.log(`  Motores: Shodan & ZoomEye Activos`);
    console.log(`  URL: http://localhost:${port}`);
    console.log(`=========================================\n`);
});