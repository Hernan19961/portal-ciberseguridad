async function ejecutarBusqueda() {
    const query = document.getElementById('searchQuery').value;
    const engine = document.getElementById('engineSelect').value;
    const output = document.getElementById('consoleOutput');

    output.innerHTML = `<p class="text-warning">[!] Conectando con ${engine.toUpperCase()}...</p>`;
    
    try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&engine=${engine}`);
        const data = await response.json();

        if (!response.ok) {
            output.innerHTML = `<p class="text-danger">[x] ERROR: ${data.error}</p>`;
            return;
        }

        const source = data.source === 'cache' ? '[CACHÉ]' : '[API]';
        output.innerHTML = `<p class="text-success">[+] Resultados: ${data.total || 0} ${source}</p>`;
        
        if (data.matches && data.matches.length > 0) {
            data.matches.forEach(m => {
                const ip = m.ip_str || m.ip;
                const port = m.port.port || m.port;
                const city = m.location?.city || m.geoinfo?.city?.names?.en || 'Chile';
                renderResult(output, ip, port, city, m.org || m.asn, m.product || m.protocol);
            });
        } else {
            output.innerHTML += `<p class="text-secondary">[i] No hay servicios abiertos visibles en esta IP.</p>`;
        }
    } catch (error) {
        output.innerHTML = `<p class="text-danger">[x] Error de red. ¿Corriste 'node server.js'?</p>`;
    }
}

function renderResult(container, ip, port, city, org, system) {
    container.innerHTML += `
        <div class="result-item">
            <p class="mb-1 text-white"><strong>IP: ${ip}:${port}</strong></p>
            <div class="small">
                <span class="text-danger">CIUDAD:</span> ${city} | <span class="text-danger">ISP:</span> ${org}<br>
                <span class="text-danger">DETECCIÓN:</span> ${system}
            </div>
        </div>`;
    const term = document.querySelector('.terminal-window');
    term.scrollTop = term.scrollHeight;
}