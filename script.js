document.getElementById('scanBtn').addEventListener('click', async () => {
    const ip = document.getElementById('ipInput').value;
    const resultsDiv = document.getElementById('results');

    if (!ip) {
        resultsDiv.innerHTML = '<span class="text-danger">> ERROR: IP NO PROPORCIONADA</span>';
        return;
    }

    resultsDiv.innerHTML = '<span class="text-warning">> ESTABLECIENDO CONEXIÓN CON SHODAN...</span>';

    try {
        const response = await fetch(`/scan?ip=${ip}`);
        const result = await response.json();

        if (result.status === "success") {
            const d = result.data;
            resultsDiv.innerHTML = `
                <div class="terminal-text">
                    <p class="text-success mb-1"><strong>[ REPORTE DE INTELIGENCIA ]</strong></p>
                    <p>🌐 <strong>IP:</strong> ${d.ip_str}</p>
                    <p>📍 <strong>UBICACIÓN:</strong> ${d.city || 'N/A'}, ${d.country_name || 'N/A'}</p>
                    <p>🏢 <strong>ORG:</strong> ${d.org || 'N/A'}</p>
                    <p>📂 <strong>PUERTOS:</strong></p>
                    <div>
                        ${d.ports.map(p => `<span class="badge badge-port">${p}</span>`).join('')}
                    </div>
                    <hr class="border-secondary">
                    <p class="text-secondary small">> Escaneo finalizado con éxito.</p>
                </div>
            `;
        } else {
            resultsDiv.innerHTML = `<span class="text-danger">> ERROR: ${result.message}</span>`;
        }
    } catch (error) {
        resultsDiv.innerHTML = '<span class="text-danger">> ERROR CRÍTICO EN EL NODO CENTRAL</span>';
    }
});