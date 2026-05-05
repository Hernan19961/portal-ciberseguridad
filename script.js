const consoleDiv = document.getElementById('console');
const inputField = document.getElementById('commandInput');

document.getElementById('runBtn').addEventListener('click', iniciarBusqueda);
inputField.addEventListener('keypress', (e) => { if (e.key === 'Enter') iniciarBusqueda(); });

async function iniciarBusqueda() {
    const rawInput = inputField.value.trim();
    if (!rawInput) return;

    consoleDiv.innerHTML = `<div class="text-danger">> Iniciando protocolo para: ${rawInput}...</div>`;

    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const url = ipRegex.test(rawInput) ? `/scan?ip=${rawInput}` : `/search?q=${encodeURIComponent(rawInput)}`;
    
    try {
        const response = await fetch(url);
        const res = await response.json();

        if (!response.ok) throw new Error(res.message);

        if (ipRegex.test(rawInput)) renderHost(res);
        else renderLista(res);

    } catch (err) {
        // Aquí el mensaje ahora saldrá sin el fondo sólido
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
            <p>PUERTOS ABIERTOS: <span style="color: #ffffff !important;">${d.ports.join(' | ')}</span></p>
        </div>`;
}

function renderLista(res) {
    let html = `<p><strong>[COINCIDENCIAS ENCONTRADAS: ${res.data.total}]</strong></p>`;
    res.data.matches.slice(0, 10).forEach(m => {
        html += `
        <div style="margin-bottom: 12px; border-bottom: 1px solid #330000; padding-bottom: 5px;">
            <span class="ip-box">${m.ip_str}</span> | <span>PUERTO: ${m.port}</span>
            <br><small style="color: #888 !important;">ORG: ${m.isp} | CIUDAD: ${m.location.city || '??'}</small>
        </div>`;
    });
    consoleDiv.innerHTML = html;
}