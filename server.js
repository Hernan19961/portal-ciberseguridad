require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const SHODAN_API_KEY = process.env.SHODAN_API_KEY;
const ZOOMEYE_API_KEY = process.env.ZOOMEYE_API_KEY;

let busquedasGuardadas = {};

app.get('/api/search', async (req, res) => {
    const { query, engine } = req.query;
    if (!query) return res.status(400).json({ error: 'Consulta vacía' });

    const cleanQuery = query.trim();
    const cacheKey = `${engine}-${cleanQuery}`;
    const isIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(cleanQuery);

    if (busquedasGuardadas[cacheKey]) {
        return res.json({ ...busquedasGuardadas[cacheKey], source: 'cache' });
    }

    try {
        let data;
        if (engine === 'shodan') {
            if (!SHODAN_API_KEY) throw new Error('Falta la API Key de Shodan en el archivo .env');
            
            if (isIP) {
                console.log(`[!] Escaneando IP: ${cleanQuery}`);
                const response = await axios.get(`https://api.shodan.io/shodan/host/${cleanQuery}`, {
                    params: { key: SHODAN_API_KEY }
                });
                
                data = {
                    total: response.data.ports ? response.data.ports.length : 0,
                    matches: response.data.data ? response.data.data.map(item => ({
                        ip_str: response.data.ip_str,
                        port: item.port,
                        location: { city: response.data.city || 'Chile' },
                        org: response.data.org,
                        product: item.product || item.module || 'Servicio'
                    })) : []
                };
            } else {
                const response = await axios.get(`https://api.shodan.io/shodan/host/search`, {
                    params: { key: SHODAN_API_KEY, query: cleanQuery }
                });
                data = response.data;
            }
        } else {
            // Lógica para ZoomEye
            const response = await axios.get(`https://api.zoomeye.org/host/search`, {
                params: { query: cleanQuery },
                headers: { 'API-KEY': ZOOMEYE_API_KEY }
            });
            data = response.data;
        }

        busquedasGuardadas[cacheKey] = data;
        res.json({ ...data, source: 'api' });

    } catch (error) {
        console.error('[-] ERROR:', error.message);
        const msg = error.response ? JSON.stringify(error.response.data) : error.message;
        res.status(500).json({ error: msg });
    }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(port, () => {
    console.log(`===========================================`);
    console.log(` CYBER-INTEL ACTIVO EN http://localhost:${port}`);
    console.log(`===========================================`);
});