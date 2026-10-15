const CARACTERES_ASCII = [" ", "░", "▒", "▓", "█", "█", "█", "█", "█", "█"];

const LETRAS_CANCION = [
    "🎤 [KARAOKE] >> 舞♪ Popipo popipo popipopo... ♫",
    "🎤 [KARAOKE] >> 歌♪ ¡Miku, Miku, ni shite ageru! ♪",
    "🎤 [KARAOKE] >> 舞♪ Anata no utahime Hatsune Miku... ♫",
    "🎤 [KARAOKE] >> 歌♪ Popipo popipo popipopo... ♪",
    "🎤 [KARAOKE] >> 舞♪ ¡World is Mine! Ouji-sama... ♫",
    "🎤 [KARAOKE] >> 歌♪ Melt, toketedan shimau... ♪"
];

const MOVIMIENTOS_PUBLICO = [
    "  *\\O/*  *\\O/*  *\\O/*  *\\O/*  *\\O/*  *\\O/*  *\\O/*  *\\O/*  *\\O/*  *\\O/*  *\\O/*    *¡MIKU!*\n    |/     |/     |/     |/     |/     |/     |/     |/     |/     |/     |/   \n   / \\    / \\    / \\    / \\    / \\    / \\    / \\    / \\    / \\    / \\    / \\  ",
    "  */O\\*  */O\\*  */O\\*  */O\\*  */O\\*  */O\\*  */O\\*  */O\\*  */O\\*  */O\\*  */O\\*    ♫ ♪ ♫ ♪\n    |      |      |      |      |      |      |      |      |      |      |    \n   / \\    / \\    / \\    / \\    / \\    / \\    / \\    / \\    / \\    / \\    / \\  ",
    "  */ O \\**/ O \\**/ O \\**/ O \\**/ O \\**/ O \\**/ O \\**/ O \\**/ O \\**/ O \\**/ O \\*   *¡LIVE STAGE!*\n    |/     |/     |/     |/     |/     |/     |/     |/     |/     |/     |/   \n   / \\    / \\    / \\    / \\    / \\    / \\    / \\    / \\    / \\    / \\    / \\  "
];

const TEMAS = ["miku", "sakura", "neon", "ambar"];

let listaImagenesProcesadas = [];
let listaImagenesBinarias = [];
let indiceActual = 0;
let intervaloAnimacion = null;
let velocidadActual = 450;
let modoBinarioActivo = false;
let animacionPausada = false;
let indiceTema = 0;

const $ = (id) => document.getElementById(id);
const inputImagenes = $('input-imagenes');
const inputAudio = $('input-audio');
const reproductorAudio = $('reproductor-audio');
const pantallaMiku = $('pantalla-miku');
const labelLetca = $('label-letca');
const labelPublico = $('label-publico');

const btnA = $('btn-a'), btnB = $('btn-b');
const btnLeft = $('btn-left'), btnRight = $('btn-right');
const btnUp = $('btn-up'), btnDown = $('btn-down');
const btnSelect = $('btn-select'), btnStart = $('btn-start');

reproductorAudio.volume = 0.7;

/* ---------- PÉTALOS DE SAKURA ---------- */
(function fondoConcierto() {
    const cont = $('fondo-sakura');
    const colores = ['#ff9ec4', '#ffd1e6', '#ffffff', '#9ff3ec', '#c9a6ff', '#ffe28a', '#39c5bb', '#ff6fae'];
    for (let i = 0; i < 70; i++) {
        const p = document.createElement('span');
        p.className = 'petalo';
        p.textContent = ['✿', '❀', '❁', '✾'][i % 4];
        const lado = Math.random();
        p.style.left = (lado < .4 ? Math.random() * 22 : lado < .8 ? 78 + Math.random() * 22 : Math.random() * 100) + 'vw';
        p.style.fontSize = (10 + Math.random() * 20) + 'px';
        p.style.color = colores[Math.floor(Math.random() * colores.length)];
        p.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
        p.style.animationDuration = (9 + Math.random() * 11) + 's';
        p.style.animationDelay = (-Math.random() * 18) + 's';
        cont.appendChild(p);
    }
    const rayos = ['#39c5bb', '#ff6fae', '#ffffff', '#9ff3ec', '#c9a6ff'];
    for (let i = 0; i < 9; i++) {
        const hz = document.createElement('div');
        hz.className = 'haz';
        hz.style.left = (i * 11.5 - 4) + '%';
        hz.style.setProperty('--c', rayos[i % rayos.length]);
        hz.style.setProperty('--d', (3 + Math.random() * 3) + 's');
        hz.style.setProperty('--r', (-Math.random() * 5) + 's');
        cont.appendChild(hz);
    }
    for (let i = 0; i < 34; i++) {
        const l = document.createElement('div');
        l.className = 'luz-mano';
        l.style.left = (i < 17 ? i * 1.4 : 76 + (i - 17) * 1.4) + 'vw';
        l.style.setProperty('--c', i % 2 ? '#39c5bb' : '#ff6fae');
        l.style.setProperty('--d', (.7 + Math.random() * .8) + 's');
        l.style.setProperty('--r', (-Math.random()) + 's');
        cont.appendChild(l);
    }
})();

/* ---------- AJUSTE AUTOMÁTICO DE LA IMAGEN A LA PANTALLA ---------- */
function ajustarPantalla() {
    const marco = pantallaMiku.parentElement;
    const hayFrames = listaImagenesProcesadas.length > 0 && pantallaMiku.innerText.length > 200;
    pantallaMiku.classList.toggle('mensaje', !hayFrames);
    if (!hayFrames) { pantallaMiku.style.transform = 'translate(-50%,-50%)'; return; }
    pantallaMiku.style.transform = 'translate(-50%,-50%) scale(1)';
    const s = Math.min(marco.clientWidth / pantallaMiku.offsetWidth, marco.clientHeight / pantallaMiku.offsetHeight) * 0.97;
    pantallaMiku.style.transform = `translate(-50%,-50%) scale(${s})`;
}
window.addEventListener('resize', ajustarPantalla);
document.addEventListener('fullscreenchange', () => setTimeout(ajustarPantalla, 100));

/* ---------- ESTADO / HUD ---------- */
function actualizarEstado() {
    $('st-vel').innerText = `VEL ${velocidadActual}ms`;
    const bloques = Math.round(reproductorAudio.volume * 10);
    $('st-vol').innerText = 'VOL ' + '▮'.repeat(bloques) + '▯'.repeat(10 - bloques);
    $('st-tema').innerText = 'TEMA ' + TEMAS[indiceTema].toUpperCase();
    $('st-pausa').innerText = animacionPausada ? '❚❚ PAUSA' : '▶ PLAY';
    $('hud-modo').innerText = modoBinarioActivo ? '● BINARIO 01' : '● ASCII ▓';
    document.querySelector('.luz-estado').classList.toggle('pausa', animacionPausada);
    btnA.classList.toggle('activo', modoBinarioActivo);
    btnB.classList.toggle('activo', animacionPausada);
}

function pulsar(btn) {
    btn.classList.add('pulsado');
    setTimeout(() => btn.classList.remove('pulsado'), 120);
}

/* ---------- CARGA DE AUDIO E IMÁGENES ---------- */
inputAudio.addEventListener('change', (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
        reproductorAudio.src = URL.createObjectURL(archivo);
        prepararAnalizador();
        if (!animacionPausada) reproductorAudio.play().catch(err => console.log(err));
    }
});

inputImagenes.addEventListener('change', async (e) => {
    const archivos = Array.from(e.target.files);
    archivos.sort((a, b) => a.name.localeCompare(b.name));

    listaImagenesProcesadas = [];
    listaImagenesBinarias = [];
    pantallaMiku.innerText = "Procesando fotogramas duales...";
    ajustarPantalla();

    for (let archivo of archivos) {
        try {
            const estructuras = await procesarImagenAAsciiYBinario(archivo, 110);
            listaImagenesProcesadas.push(estructuras.ascii);
            listaImagenesBinarias.push(estructuras.binario);
        } catch (error) {
            console.error(error);
        }
    }

    if (listaImagenesProcesadas.length > 0) {
        indiceActual = 0;
        reiniciarIntervalo();
        bucleAnimacion();
    } else {
        pantallaMiku.innerText = "[ Error al cargar fotogramas ]";
    }
});

function procesarImagenAAsciiYBinario(archivo, nuevoAncho) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(archivo);
        img.onload = () => {
            const proporcion = img.height / img.width;
            const nuevaAltura = Math.floor(nuevoAncho * proporcion * 0.46);

            const canvas = document.createElement('canvas');
            canvas.width = nuevoAncho;
            canvas.height = nuevaAltura;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, nuevoAncho, nuevaAltura);

            const pixeles = ctx.getImageData(0, 0, nuevoAncho, nuevaAltura).data;
            let resultadoAscii = "";
            let resultadoBinario = "";

            for (let i = 0; i < pixeles.length; i += 4) {
                const gris = Math.floor(0.299 * pixeles[i] + 0.587 * pixeles[i + 1] + 0.114 * pixeles[i + 2]);
                const indiceCaracter = Math.floor(((255 - gris) * CARACTERES_ASCII.length) / 256);
                resultadoAscii += CARACTERES_ASCII[indiceCaracter];
                resultadoBinario += gris < 128 ? "1" : "0";

                if (((i / 4) + 1) % nuevoAncho === 0) {
                    resultadoAscii += "\n";
                    resultadoBinario += "\n";
                }
            }
            resolve({ ascii: resultadoAscii, binario: resultadoBinario });
        };
        img.onerror = (err) => reject(err);
    });
}

/* ---------- ANIMACIÓN ---------- */
function bucleAnimacion() {
    if (!encendida || arrancando) return;
    if (animacionPausada || listaImagenesProcesadas.length === 0) return;
    pantallaMiku.innerText = modoBinarioActivo ? listaImagenesBinarias[indiceActual] : listaImagenesProcesadas[indiceActual];
    ajustarPantalla();
    labelLetca.innerText = LETRAS_CANCION[indiceActual % LETRAS_CANCION.length];
    labelPublico.innerText = MOVIMIENTOS_PUBLICO[indiceActual % MOVIMIENTOS_PUBLICO.length];
    const n = listaImagenesProcesadas.length;
    $('hud-frame').innerText = `FRAME ${String(indiceActual + 1).padStart(2, '0')}/${String(n).padStart(2, '0')}`;
    indiceActual = (indiceActual + 1) % n;
}

function reiniciarIntervalo() {
    if (intervaloAnimacion) clearInterval(intervaloAnimacion);
    intervaloAnimacion = setInterval(bucleAnimacion, velocidadActual);
}

/* ---------- ACCIONES DE BOTONES ---------- */
function accionA() {   // BINARIO
    pulsar(btnA);
    if (listaImagenesProcesadas.length === 0) return;
    modoBinarioActivo = !modoBinarioActivo;
    indiceActual = (indiceActual - 1 + listaImagenesProcesadas.length) % listaImagenesProcesadas.length;
    bucleAnimacion();
    actualizarEstado();
}

function accionB() {   // PAUSA
    pulsar(btnB);
    animacionPausada = !animacionPausada;
    if (animacionPausada) {
        reproductorAudio.pause();
    } else {
        reproductorAudio.play().catch(e => console.log(e));
        reiniciarIntervalo();
    }
    actualizarEstado();
}

function accionLento() {
    pulsar(btnLeft);
    if (velocidadActual < 1000) { velocidadActual += 70; reiniciarIntervalo(); actualizarEstado(); }
}
function accionRapido() {
    pulsar(btnRight);
    if (velocidadActual > 100) { velocidadActual -= 70; reiniciarIntervalo(); actualizarEstado(); }
}
function accionVolumen(delta, btn) {
    pulsar(btn);
    reproductorAudio.volume = Math.min(1, Math.max(0, +(reproductorAudio.volume + delta).toFixed(1)));
    actualizarEstado();
}
function accionTema() {
    pulsar(btnSelect);
    indiceTema = (indiceTema + 1) % TEMAS.length;
    document.body.dataset.tema = TEMAS[indiceTema];
    actualizarEstado();
}
function accionPantallaCompleta() {
    pulsar(btnStart);
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen();
}

btnA.addEventListener('click', accionA);
btnB.addEventListener('click', accionB);
btnLeft.addEventListener('click', accionLento);
btnRight.addEventListener('click', accionRapido);
btnUp.addEventListener('click', () => accionVolumen(0.1, btnUp));
btnDown.addEventListener('click', () => accionVolumen(-0.1, btnDown));
btnSelect.addEventListener('click', accionTema);
btnStart.addEventListener('click', accionPantallaCompleta);

document.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'a') accionA();
    else if (k === 'b') accionB();
    else if (k === 's') accionTema();
    else if (k === 'f') accionPantallaCompleta();
    else if (e.key === 'ArrowLeft') accionLento();
    else if (e.key === 'ArrowRight') accionRapido();
    else if (e.key === 'ArrowUp') { e.preventDefault(); accionVolumen(0.1, btnUp); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); accionVolumen(-0.1, btnDown); }
});

/* ---------- ECUALIZADOR (reacciona a la música) ---------- */
const canvasEq = $('visualizador');
const ctxEq = canvasEq.getContext('2d');
let analizador = null, datosFrecuencia = null;

function prepararAnalizador() {
    if (analizador) return;
    try {
        const AC = window.AudioContext || window.webkitAudioContext;
        const ac = new AC();
        const fuente = ac.createMediaElementSource(reproductorAudio);
        analizador = ac.createAnalyser();
        analizador.fftSize = 64;
        fuente.connect(analizador);
        analizador.connect(ac.destination);
        datosFrecuencia = new Uint8Array(analizador.frequencyBinCount);
        reproductorAudio.addEventListener('play', () => ac.resume());
    } catch (err) { console.log(err); }
}

function dibujarEcualizador(t) {
    const w = canvasEq.width, h = canvasEq.height, barras = 26;
    ctxEq.clearRect(0, 0, w, h);
    const acento = getComputedStyle(document.body).getPropertyValue('--acento').trim() || '#39c5bb';
    if (analizador) analizador.getByteFrequencyData(datosFrecuencia);
    for (let i = 0; i < barras; i++) {
        let v;
        if (analizador && !animacionPausada && !reproductorAudio.paused) {
            v = datosFrecuencia[Math.floor(i * datosFrecuencia.length / barras)] / 255;
        } else {
            v = animacionPausada ? 0.05 : 0.15 + 0.1 * Math.sin(t / 400 + i);
        }
        const alto = Math.max(2, v * h);
        ctxEq.fillStyle = acento;
        ctxEq.shadowColor = acento;
        ctxEq.shadowBlur = 6;
        ctxEq.fillRect(i * (w / barras) + 1, h - alto, w / barras - 3, alto);
    }
    requestAnimationFrame(dibujarEcualizador);
}

actualizarEstado();
requestAnimationFrame(dibujarEcualizador);


/* =====================================================
   MASCOTA MIKU: se mueve por toda la pantalla y juega
   ===================================================== */
const SVG_MIKU = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 170">
<path d="M22 40 Q-8 90 10 160 Q22 165 28 150 Q30 100 40 62Z" fill="#39c5bb"/>
<path d="M98 40 Q128 90 110 160 Q98 165 92 150 Q90 100 80 62Z" fill="#39c5bb"/>
<rect x="44" y="92" width="32" height="40" rx="6" fill="#3b3b4f"/>
<path d="M52 92 L60 118 L68 92Z" fill="#fff"/><path d="M57 98 L60 124 L63 98Z" fill="#39c5bb"/>
<path d="M40 132 L80 132 L88 152 L32 152Z" fill="#2a2a3a"/>
<rect x="46" y="152" width="9" height="14" fill="#f5d6c3"/><rect x="65" y="152" width="9" height="14" fill="#f5d6c3"/>
<rect x="43" y="164" width="14" height="6" rx="3" fill="#39c5bb"/><rect x="63" y="164" width="14" height="6" rx="3" fill="#39c5bb"/>
<circle cx="60" cy="56" r="34" fill="#f8dccb"/>
<path d="M24 56 Q24 14 60 14 Q96 14 96 56 Q88 34 70 38 Q62 46 56 38 Q36 34 24 56Z" fill="#39c5bb"/>
<ellipse cx="46" cy="60" rx="7" ry="9" fill="#fff"/><ellipse cx="74" cy="60" rx="7" ry="9" fill="#fff"/>
<ellipse cx="46" cy="62" rx="5" ry="7" fill="#0e8b86"/><ellipse cx="74" cy="62" rx="5" ry="7" fill="#0e8b86"/>
<circle cx="44" cy="59" r="2" fill="#fff"/><circle cx="72" cy="59" r="2" fill="#fff"/>
<path d="M53 76 Q60 82 67 76" stroke="#c0504d" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<ellipse cx="38" cy="72" rx="5" ry="3" fill="#ff9db8" opacity=".6"/><ellipse cx="82" cy="72" rx="5" ry="3" fill="#ff9db8" opacity=".6"/>
<circle cx="26" cy="30" r="6" fill="#2a2a3a"/><circle cx="94" cy="30" r="6" fill="#2a2a3a"/>
</svg>`;

const mascota = $('mascota'), mascotaImg = $('mascota-img'), burbuja = $('burbuja');
mascotaImg.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(SVG_MIKU);

const M = { nombre: 'Miku', x: 200, y: 200, tx: 400, ty: 300, modo: 'pasear', vel: 2, puntos: 0, mejor: 0, ratonX: 0, ratonY: 0, oculta: false, tBurbuja: null, tRumbo: 0 };

$('input-mascota').addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (f) { mascotaImg.src = URL.createObjectURL(f); decir('¡Nuevo look! 💙'); }
});

function decir(texto, ms = 2200) {
    burbuja.innerText = texto;
    burbuja.classList.add('visible');
    clearTimeout(M.tBurbuja);
    M.tBurbuja = setTimeout(() => burbuja.classList.remove('visible'), ms);
}

function corazones(n = 6) {
    const r = mascota.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
        const c = document.createElement('span');
        c.className = 'corazon';
        c.textContent = ['💙', '💖', '✨', '🎵'][i % 4];
        c.style.left = (r.left + Math.random() * r.width) + 'px';
        c.style.top = (r.top + Math.random() * 40) + 'px';
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 1200);
    }
}

function nuevoDestino() {
    const w = mascota.offsetWidth, h = mascota.offsetHeight;
    M.tx = Math.random() * (innerWidth - w);
    M.ty = Math.random() * (innerHeight - h);
}

function cambiarModo(modo) {
    M.modo = modo;
    document.querySelectorAll('#panel-mascota [data-modo]').forEach(b => b.classList.toggle('activo', b.dataset.modo === modo));
    mascota.classList.toggle('bailando', modo === 'bailar');
    mascota.classList.toggle('durmiendo', modo === 'dormir');
    const frases = {
        pasear: '¡A pasear! 🎶', seguir: '¡Voy contigo! 🐾', escapar: '¡Atrápame si puedes! 😜',
        bailar: '♪ ¡A bailar! ♪', dormir: 'Zzz... 💤'
    };
    decir(frases[modo]);
    $('m-info').innerText = modo === 'escapar' ? 'Haz clic en Miku para atraparla' : 'Haz clic en Miku 💙';
    if (modo === 'escapar') { M.puntos = 0; $('m-puntos').innerText = '★0'; }
    nuevoDestino();
}

document.querySelectorAll('#panel-mascota [data-modo]').forEach(b => b.addEventListener('click', () => cambiarModo(b.dataset.modo)));
$('m-saludar').addEventListener('click', saludar);
$('m-negi').addEventListener('click', () => { decir('¡Negi! 🧅 ¡Gracias! ✨'); corazones(8); });
$('m-ocultar').addEventListener('click', alternarMascota);

function saludar() {
    const s = ['¡Hola! Soy ' + M.nombre + ' 💙', '¡Konnichiwa! 👋', '¿Cantamos juntos? 🎤', '¡Qué bonito escenario! ✨'];
    decir(s[Math.floor(Math.random() * s.length)], 2800);
    corazones(5);
    mascotaImg.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-14deg) scale(1.1)' }, { transform: 'rotate(14deg) scale(1.1)' }, { transform: 'rotate(0)' }], { duration: 700 });
}

function alternarMascota() {
    M.oculta = !M.oculta;
    mascota.classList.toggle('oculta', M.oculta);
    $('m-ocultar').innerText = M.oculta ? '👁 MOSTRAR (M)' : '👁 OCULTAR (M)';
}
document.addEventListener('keydown', (e) => { if (e.key.toLowerCase() === 'm') alternarMascota(); });

mascota.addEventListener('click', () => {
    if (M.modo === 'escapar') {
        M.puntos++;
        M.mejor = Math.max(M.mejor, M.puntos);
        $('m-puntos').innerText = '★' + M.puntos;
        $('m-info').innerText = `¡Atrapada! Mejor: ${M.mejor}`;
        decir('¡Me atrapaste! 😳', 1200);
        corazones(6);
        nuevoDestino();
        M.x = Math.random() * (innerWidth - 110); M.y = Math.random() * (innerHeight - 160);
    } else if (M.modo === 'dormir') {
        cambiarModo('pasear'); decir('¡Ya desperté! 😴');
    } else {
        saludar();
    }
});

document.addEventListener('mousemove', (e) => { M.ratonX = e.clientX; M.ratonY = e.clientY; });

function moverMascota() {
    const w = mascota.offsetWidth, h = mascota.offsetHeight;
    const cx = M.x + w / 2, cy = M.y + h / 2;
    let vel = 2, mover = true;

    if (M.modo === 'seguir') {
        M.tx = M.ratonX - w / 2 + 60; M.ty = M.ratonY - h / 2 + 30; vel = 3;
    } else if (M.modo === 'escapar') {
        const dx = cx - M.ratonX, dy = cy - M.ratonY, d = Math.hypot(dx, dy);
        if (d < 220) {
            vel = 7;
            M.tx = Math.min(Math.max(M.x + dx / d * 200, 0), innerWidth - w);
            M.ty = Math.min(Math.max(M.y + dy / d * 200, 0), innerHeight - h);
            if (M.tx <= 2 || M.tx >= innerWidth - w - 2) M.ty = Math.random() * (innerHeight - h);
            if (M.ty <= 2 || M.ty >= innerHeight - h - 2) M.tx = Math.random() * (innerWidth - w);
        } else vel = 1.5;
    } else if (M.modo === 'bailar' || M.modo === 'dormir') {
        mover = false;
    } else if (--M.tRumbo <= 0) { M.tRumbo = 400 + Math.random() * 300; nuevoDestino(); }

    let moviendo = false;
    if (mover) {
        const dx = M.tx - M.x, dy = M.ty - M.y, d = Math.hypot(dx, dy);
        if (d > vel) {
            M.x += dx / d * vel; M.y += dy / d * vel; moviendo = true;
            mascotaImg.style.scale = dx < 0 ? '1 1' : '-1 1';
        } else if (M.modo === 'pasear' || M.modo === 'escapar') {
            M.tRumbo = Math.min(M.tRumbo, 60 + Math.random() * 120);
        }
    }
    mascota.classList.toggle('caminando', moviendo && M.modo !== 'bailar');
    mascota.style.transform = `translate(${M.x}px, ${M.y}px)`;
    requestAnimationFrame(moverMascota);
}

mascotaImg.style.scale = '1 1';
cambiarModo('pasear');
requestAnimationFrame(moverMascota);


/* =====================================================
   PERSONAJES VOCALOID
   ===================================================== */
function svgPersonaje(c) {
    let atras = '', extra = '';
    if (c.estilo === 'largo') atras = `<path d="M22 48 Q4 120 26 168 L94 168 Q116 120 98 48Z" fill="${c.pelo}"/>`;
    if (c.estilo === 'corto') atras = `<path d="M24 46 Q16 88 30 98 L90 98 Q104 88 96 46Z" fill="${c.pelo}"/>`;
    if (c.id === 'rin') extra = `<path d="M60 18 Q36 -4 32 16 Q44 28 60 18 Q76 28 88 16 Q84 -4 60 18Z" fill="#fff" stroke="#ddd"/><circle cx="60" cy="18" r="4.5" fill="${c.acento}"/>`;
    if (c.id === 'kaito') extra = `<path d="M42 92 Q60 108 78 92 L80 104 Q60 120 40 104Z" fill="${c.acento}"/><rect x="66" y="100" width="10" height="28" rx="4" fill="${c.acento}"/>`;
    if (c.id === 'luka') extra = `<circle cx="28" cy="40" r="5" fill="${c.acento}"/><circle cx="92" cy="40" r="5" fill="${c.acento}"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 170">${atras}
<rect x="44" y="92" width="32" height="40" rx="6" fill="${c.ropa}"/>
<path d="M52 92 L60 118 L68 92Z" fill="#fff"/><path d="M57 98 L60 124 L63 98Z" fill="${c.acento}"/>
<path d="M40 132 L80 132 L88 152 L32 152Z" fill="${c.falda}"/>
<rect x="46" y="152" width="9" height="14" fill="#f5d6c3"/><rect x="65" y="152" width="9" height="14" fill="#f5d6c3"/>
<rect x="43" y="164" width="14" height="6" rx="3" fill="${c.acento}"/><rect x="63" y="164" width="14" height="6" rx="3" fill="${c.acento}"/>
<circle cx="60" cy="56" r="34" fill="#f8dccb"/>
<path d="M24 56 Q24 14 60 14 Q96 14 96 56 Q88 34 70 38 Q62 46 56 38 Q36 34 24 56Z" fill="${c.pelo}"/>
${extra}
<ellipse cx="46" cy="60" rx="7" ry="9" fill="#fff"/><ellipse cx="74" cy="60" rx="7" ry="9" fill="#fff"/>
<ellipse cx="46" cy="62" rx="5" ry="7" fill="${c.ojos}"/><ellipse cx="74" cy="62" rx="5" ry="7" fill="${c.ojos}"/>
<circle cx="44" cy="59" r="2" fill="#fff"/><circle cx="72" cy="59" r="2" fill="#fff"/>
<path d="M53 76 Q60 82 67 76" stroke="#c0504d" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<ellipse cx="38" cy="72" rx="5" ry="3" fill="#ff9db8" opacity=".6"/><ellipse cx="82" cy="72" rx="5" ry="3" fill="#ff9db8" opacity=".6"/></svg>`;
}
const PERSONAJES = {
    miku:  { nombre: 'Miku',  svg: SVG_MIKU },
    rin:   { nombre: 'Rin',   svg: svgPersonaje({ id: 'rin', estilo: 'corto', pelo: '#ffd93b', ojos: '#2f8fd8', ropa: '#f1f1f1', falda: '#2a2a3a', acento: '#f5a300' }) },
    luka:  { nombre: 'Luka',  svg: svgPersonaje({ id: 'luka', estilo: 'largo', pelo: '#ffa6c9', ojos: '#4aa8e8', ropa: '#2a2a3a', falda: '#1d1d2b', acento: '#d4a017' }) },
    kaito: { nombre: 'Kaito', svg: svgPersonaje({ id: 'kaito', estilo: 'corto', pelo: '#2f6fe0', ojos: '#1a3fa0', ropa: '#f2f2f8', falda: '#1f2a4a', acento: '#2f6fe0' }) }
};
document.querySelectorAll('#panel-mascota [data-pj]').forEach(b => b.addEventListener('click', () => {
    const p = PERSONAJES[b.dataset.pj];
    M.nombre = p.nombre;
    mascotaImg.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(p.svg);
    document.querySelectorAll('#panel-mascota [data-pj]').forEach(x => x.classList.toggle('activo', x === b));
    decir(`¡Hola! Soy ${p.nombre} ✨`);
    corazones(6);
}));

/* =====================================================
   ENCENDIDO / APAGADO DE LA CONSOLA
   ===================================================== */
let encendida = false, arrancando = false, ctxSonido = null;

function sonido(f1, f2, dur) {
    try {
        ctxSonido = ctxSonido || new (window.AudioContext || window.webkitAudioContext)();
        const o = ctxSonido.createOscillator(), g = ctxSonido.createGain();
        o.type = 'square'; o.frequency.setValueAtTime(f1, ctxSonido.currentTime);
        o.frequency.exponentialRampToValueAtTime(f2, ctxSonido.currentTime + dur);
        g.gain.setValueAtTime(.08, ctxSonido.currentTime);
        g.gain.exponentialRampToValueAtTime(.001, ctxSonido.currentTime + dur);
        o.connect(g); g.connect(ctxSonido.destination); o.start(); o.stop(ctxSonido.currentTime + dur);
    } catch (e) {}
}

function encender() {
    if (encendida) return;
    encendida = true; arrancando = true;
    sonido(260, 900, .5);
    document.querySelector('.enc-led').style.background = '#0f0';
    document.body.classList.add('encendida');
    setTimeout(secuenciaArranque, 1500);
}

function secuenciaArranque() {
    const lineas = ['初音ミク STAGE SYSTEM v1.0', 'BIOS ................ OK', 'ESCENARIO ........... OK',
        'SINTETIZADOR VOCAL .. OK', 'PÚBLICO CONECTADO ... OK', '', '♪ BIENVENIDO ♪'];
    let texto = '', i = 0;
    pantallaMiku.classList.add('mensaje');
    pantallaMiku.style.transform = 'translate(-50%,-50%)';
    const t = setInterval(() => {
        if (!encendida) { clearInterval(t); return; }
        texto += lineas[i++] + '\n';
        pantallaMiku.innerText = texto;
        sonido(700, 800, .05);
        if (i >= lineas.length) {
            clearInterval(t);
            setTimeout(() => {
                arrancando = false;
                if (!encendida) return;
                if (listaImagenesProcesadas.length) { reiniciarIntervalo(); bucleAnimacion(); }
                else pantallaMiku.innerText = 'Por favor, carga las imágenes de Miku para iniciar la simulación...';
                if (reproductorAudio.src && !animacionPausada) reproductorAudio.play().catch(() => {});
                cambiarModo('pasear');
                saludar();
            }, 900);
        }
    }, 380);
}

function apagar() {
    if (!encendida) return;
    sonido(800, 120, .6);
    encendida = false; arrancando = false;
    reproductorAudio.pause();
    document.querySelector('.enc-led').style.background = '#f33';
    document.body.classList.remove('encendida');
    burbuja.classList.remove('visible');
}

$('btn-encender').addEventListener('click', encender);
$('btn-power').addEventListener('click', apagar);

// Con la consola apagada solo responde Enter/Espacio (encender); encendida, P la apaga
document.addEventListener('keydown', (e) => {
    if (!encendida) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); encender(); }
        e.stopImmediatePropagation();
    } else if (e.key.toLowerCase() === 'p') apagar();
}, true);