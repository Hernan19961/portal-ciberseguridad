const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// REEMPLAZA ESTO CON TU API KEY DE SHODAN
const SHODAN_API_KEY = 'TU_API_KEY_AQUI';

app.get('/api/search', async (req, res) => {
    const { query, targetPort } = req.query;
    
    // Construcción de la query inteligente
    let shodanQuery = query;
    if (targetPort && targetPort.trim() !== "") {
        shodanQuery += ` port:${targetPort}`;
    }

    try {
        console.log(`[!] Ejecutando búsqueda en Shodan: ${shodanQuery}`);
        const response = await axios.get(`https://api.shodan.io/shodan/host/search`, {
            params: {
                key: SHODAN_API_KEY,
                query: shodanQuery
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error en la API:', error.message);
        res.status(500).json({ error: 'Error al conectar con Shodan' });
    }
});

app.listen(port, () => {
    console.log(`===========================================`);
    console.log(` CYBER-INTEL: SCANNER CHILE INICIADO`);
    console.log(` URL: http://localhost:${port}`);
    console.log(`===========================================`);
});