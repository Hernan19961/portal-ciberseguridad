const consoleDiv = document.getElementById('console');
const inputField = document.getElementById('commandInput');
const engineSelect = document.getElementById('engineSelect');

document.getElementById('runBtn').addEventListener('click', iniciarBusqueda);
inputField.addEventListener('keypress', (e) => { if (e.key === 'Enter') iniciarBusqueda(); });

async function iniciarBusqueda() {
    const rawInput = inputField.value.trim();
    const engine = engineSelect.value;
    if (!rawInput) return;

    consoleDiv.innerHTML = `<div class="text-danger">> Buscando en ${engine.toUpperCase()}: ${rawInput}...</div>`;

    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
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
        consoleDiv.innerHTML = `<div class="error-msg">> ERROR: ${err.message.toUpperCase()}</div>`;
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
            <p>PUERTOS: <span style="color: #00ff00 !important;">${d.ports.join(' | ')}</span></p>
        </div>`;
}

function renderLista(res) {
    let html = `<p><strong>[HALLAZGOS: ${res.data.total}]</strong></p>`;
    res.data.matches.slice(0, 20).forEach(m => {
        // Detección de Android ADB (Ghost Framework Target)
        const isADB = (m.port == 5555 || m.port == 5554);
        const ghostTag = isADB ? `<span class="tag-ghost">[TARGET GHOST/ADB]</span>` : '';
        const copyBtn = isADB ? `<button onclick="copyADB('${m.ip_str}')" class="btn btn-sm btn-outline-light" style="font-size: 9px; margin-left: 10px;">COPIAR ADB</button>` : '';

        html += `
        <div style="margin-bottom: 15px; border-bottom: 1px solid #220000; padding-bottom: 8px;">
            <span class="ip-box">${m.ip_str}</span> | <span>PORT: ${m.port}</span> ${ghostTag}
            <br><small style="color: #666 !important;">ORG: ${m.isp} | CIUDAD: ${m.location.city || '??'}</small>
            ${copyBtn}
        </div>`;
    });
    consoleDiv.innerHTML = html;
}

function copyADB(ip) {
    const cmd = `adb connect ${ip}:5555`;
    navigator.clipboard.writeText(cmd).then(() => {
        alert("Comando de acceso listo: " + cmd);
    });
}   