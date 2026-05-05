document.getElementById('execBtn').addEventListener('click', procesar);
document.getElementById('mainInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') procesar(); });

async function procesar() {
    const input = document.getElementById('mainInput').value.trim();
    const div = document.getElementById('results');
    if (!input) return;

    div.innerHTML = `<div class="text-white">> Accediendo a la red para: ${input}...</div>`;

    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;

    if (ipRegex.test(input)) {
        // Es una IP
        ejecutar(`/scan?ip=${input}`, 'ip');
    } else {
        // Es una búsqueda (convertimos espacios en + para la URL)
        const query = input.replace(/\s+/g, '+');
        ejecutar(`/search?q=${query}`, 'search');
    }
}

async function ejecutar(url, tipo) {
    const div = document.getElementById('results');
    try {
        const response = await fetch(url);
        const res = await response.json();
        
        if (res.status === "success" && (res.data.ip_str || (res.data.matches && res.data.matches.length > 0))) {
            tipo === 'ip' ? renderHost(res) : renderLista(res);
        } else {
            div.innerHTML = `<div class="text-danger">> No se encontraron resultados. Intenta con un término más general como 'linux' o verifica tus créditos.</div>`;
        }
    } catch (err) {
        div.innerHTML = `<div class="text-danger">> Error crítico de conexión.</div>`;
    }
}

function renderHost(res) {
    const d = res.data;
    const cache = res.fromCache ? '<span class="badge-cache">CACHE</span>' : '';
    document.getElementById('results').innerHTML = `
        <div class="text-info-bright">
            <p><strong>[ REPORTE DE IP ]</strong> ${cache}</p>
            <p>IP: ${d.ip_str}</p>
            <p>ORG: ${d.org || 'N/A'}</p>
            <p>UBICACIÓN: ${d.city || '?'}, ${d.country_name}</p>
            <p>PUERTOS: ${d.ports.join(' | ')}</p>
        </div>`;
}

function renderLista(res) {
    const cache = res.fromCache ? '<span class="badge-cache">CACHE</span>' : '';
    let html = `<p class="text-warning"><strong>[ RESULTADOS: ${res.data.total} ]</strong> ${cache}</p>`;
    
    res.data.matches.slice(0, 10).forEach(m => {
        html += `
        <div class="device-entry">
            <span class="text-primary">IP:</span> ${m.ip_str} 
            <span class="text-primary">| Puerto:</span> ${m.port}
            <br><span class="text-muted" style="font-size:0.7rem;">${m.isp} - ${m.location.city || ''}</span>
        </div>`;
    });
    document.getElementById('results').innerHTML = html;
}