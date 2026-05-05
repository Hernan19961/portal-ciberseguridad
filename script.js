async function ejecutarBusqueda() {
    const query = document.getElementById('searchQuery').value || "webcam cl";
    const port = document.getElementById('targetPort').value;
    const output = document.getElementById('consoleOutput');

    output.innerHTML = `<p class="text-warning">[!] Iniciando protocolo de escaneo para: ${query}</p>`;
    
    if (!port || port.trim() === "") {
        output.innerHTML += `<p style="color: #00ccff;">[i] Puerto no definido. Shodan realizará un barrido en puertos de video comunes.</p>`;
    }

    try {
        // Llamada a tu servidor local Node.js
        const response = await fetch(`http://localhost:3000/api/search?query=${query}&targetPort=${port}`);
        const data = await response.json();

        if (data.matches && data.matches.length > 0) {
            output.innerHTML += `<p class="text-success">[+] Se encontraron ${data.total} dispositivos en Chile.</p>`;
            
            data.matches.forEach(match => {
                renderResult(
                    output, 
                    match.ip_str, 
                    match.port, 
                    match.location.city || "Chile", 
                    match.org, 
                    match.product || "N/A"
                );
            });
        } else {
            output.innerHTML += `<p class="text-danger">[x] No se encontraron resultados para esta búsqueda.</p>`;
        }
    } catch (error) {
        output.innerHTML += `<p class="text-danger">[x] ERROR: No se pudo conectar con server.js. Asegúrate de ejecutarlo con 'node server.js'.</p>`;
    }
}

function renderResult(container, ip, port, city, org, system) {
    container.innerHTML += `
        <div class="result-item">
            <p class="mb-1 text-white"><strong>OBJETIVO: ${ip}:${port}</strong></p>
            <div class="small">
                <span class="text-danger">CIUDAD:</span> ${city} <br>
                <span class="text-danger">ISP:</span> ${org} <br>
                <span class="text-danger">SOFTWARE:</span> ${system} <br>
                <span style="color: #00ff00;" class="fw-bold">[ STATUS: ONLINE ]</span>
            </div>
        </div>
    `;
    const terminal = document.querySelector('.terminal-window');
    terminal.scrollTop = terminal.scrollHeight;
}