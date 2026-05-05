const consoleDiv = document.getElementById('console');
const inputField = document.getElementById('commandInput');
const engineSelect = document.getElementById('engineSelect');

document.getElementById('runBtn').addEventListener('click', iniciarBusqueda);
inputField.addEventListener('keypress', (e) => { if (e.key === 'Enter') iniciarBusqueda(); });

async function iniciarBusqueda() {
    const rawInput = inputField.value.trim();
    const engine = engineSelect.value;
    if (!rawInput) return;

    consoleDiv.innerHTML = `<div class="text-danger">> Accediendo a ${engine.toUpperCase()} para: ${rawInput}...</div>`;

    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    
    // Si es IP va a /scan, si es búsqueda va a /search con el motor elegido
    const url = ipRegex.test(rawInput) 
        ? `/scan?ip=${rawInput}` 
        : `/search?q=${encodeURIComponent(rawInput)}&engine=${engine}`;
    
    try {
        const response = await fetch(url);
        const res = await response.json();

        if (!response.ok) throw new Error(res.message);

        if (ipRegex.test(rawInput)) renderHost(res);
        else renderLista(res);

    } catch (err) {
        consoleDiv.innerHTML = `
            <div class="error-msg">
                > ALERTA DEL SISTEMA <br>
                > DETALLE: ${err.message.toUpperCase()}
            </div>`;
    }
}

function renderHost(res) {
    const d = res.data;
    consoleDiv.innerHTML = `
        <div>
            <p><strong>[REPORTE DE HOST DETECTADO]</strong></p>
            <p>DIRECCIÓN IP: <span class="ip-box">${d.ip_str}</span></p>
            <p>LOCALIZACIÓN: ${d.country_name || 'N/A'}</p>
            <p>ISP / ORG: ${d.org || 'N/A'}</p>
            <p>PUERTOS ABIERTOS: <span style="color: #00ff00 !important; font-weight: bold;">${d.ports.join(' | ')}</span></p>
        </div>`;
}

function renderLista(res) {
    let html = `<p><strong>[RESULTADOS: ${res.data.total}]</strong></p>`;
    res.data.matches.slice(0, 15).forEach(m => {
        html += `
        <div style="margin-bottom: 12px; border-bottom: 1px solid #330000; padding-bottom: 5px;">
            <span class="ip-box">${m.ip_str}</span> | <span>PORT: ${m.port}</span>
            <br><small style="color: #666 !important;">ORG: ${m.isp} | CIUDAD: ${m.location.city || '??'}</small>
        </div>`;
    });
    consoleDiv.innerHTML = html;
}