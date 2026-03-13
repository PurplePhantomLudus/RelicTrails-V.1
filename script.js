let jugadores = [];
let jugadorActual = 0;
let ronda = 1;
let expediciones = 5;

let totales = [0, 0];
let puntosRondaActual = [0, 0];
let cartasJugadas = [{}, {}]; 

const colores = ["red", "blue", "green", "yellow", "white", "purple"];
const nombres = ["Volcán", "Océano", "Selva", "Desierto", "Hielo", "Misterio"];
const valores = ["W", "W", "W", 2, 3, 4, 5, 6, 7, 8, 9, 10];

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnContinue").onclick = () => mostrar("setup");
    document.getElementById("btnStart").onclick = iniciarJuego;
    document.getElementById("btnFinishTurn").onclick = terminarTurno;
    document.getElementById("btnNextRound").onclick = siguienteRonda;
    document.getElementById("btnRestart").onclick = () => location.reload();
});

function mostrar(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
    window.scrollTo(0, 0);
}

function iniciarJuego() {
    const j1 = document.getElementById("player1").value || "Jugador 1";
    const j2 = document.getElementById("player2").value;

    jugadores = [j1];
    if (j2.trim() !== "") jugadores.push(j2);

    expediciones = parseInt(document.getElementById("expeditions").value);
    totales = [0, 0];
    ronda = 1;
    jugadorActual = 0;

    resetRonda();
    iniciarTurno();
}

function resetRonda() {
    cartasJugadas = [{}, {}];
    puntosRondaActual = [0, 0];
    for (let j = 0; j < 2; j++) {
        for (let i = 0; i < expediciones; i++) {
            cartasJugadas[j][i] = [];
        }
    }
}

function iniciarTurno() {
    renderizarTablero();
    document.getElementById("roundTitle").innerText = "Ronda " + ronda;
    document.getElementById("playerTurn").innerText = "Turno de " + jugadores[jugadorActual];
    mostrar("game");
}

function renderizarTablero() {
    const board = document.getElementById("board");
    board.innerHTML = "";
    let totalTurno = 0;

    for (let i = 0; i < expediciones; i++) {
        const exp = document.createElement("div");
        exp.className = "expedition " + colores[i];

        const titulo = document.createElement("h3");
        titulo.innerText = nombres[i];

        const score = document.createElement("div");
        score.className = "scoreLive";

        let puntos = calcular(cartasJugadas[jugadorActual][i]);
        score.innerText = "Puntos expedición: " + puntos;
        totalTurno += puntos;

        const play = document.createElement("div");
        play.className = "play-zone";

        // Cartas ya jugadas en la expedición
        cartasJugadas[jugadorActual][i].forEach((c, index) => {
            const carta = document.createElement("div");
            carta.className = "card played";
            carta.style.backgroundImage = c === "W" ? "url(assets/cards/wager.png)" : "url(assets/cards/" + colores[i] + ".png)";
            carta.innerHTML = "<div class='cardValue'>" + c + "</div>";
            carta.onclick = () => quitarCarta(i, index);
            
            play.appendChild(carta);
        });

        const zona = document.createElement("div");
        zona.className = "cards";

        // Calcular cartas disponibles
        let disponibles = [...valores];
        
        cartasJugadas[0][i].forEach(jugada => {
            let idx = disponibles.indexOf(jugada);
            if (idx !== -1) disponibles.splice(idx, 1);
        });
        
        if (jugadores.length === 2) {
            cartasJugadas[1][i].forEach(jugada => {
                let idx = disponibles.indexOf(jugada);
                if (idx !== -1) disponibles.splice(idx, 1);
            });
        }

        // Pintar cartas disponibles
        disponibles.forEach(v => {
            const carta = document.createElement("div");
            carta.className = "card";
            carta.style.backgroundImage = v === "W" ? "url(assets/cards/wager.png)" : "url(assets/cards/" + colores[i] + ".png)";
            carta.innerHTML = "<div class='cardValue'>" + v + "</div>";
            carta.onclick = () => jugarCarta(i, v);
            
            zona.appendChild(carta);
        });

        exp.appendChild(titulo);
        exp.appendChild(score);
        exp.appendChild(play);
        exp.appendChild(zona);
        board.appendChild(exp);
    }

    document.getElementById("totalLive").innerText = "Puntos turno actual: " + totalTurno;
}

function jugarCarta(exp, valor) {
    let cartas = cartasJugadas[jugadorActual][exp];

    if (valor !== "W") {
        let numCards = cartas.filter(c => c !== "W");
        let ult = numCards.length > 0 ? numCards[numCards.length - 1] : null;
        
        if (ult && Number(valor) <= Number(ult)) {
            alert("Las cartas deben ir en orden creciente.");
            return;
        }
    } else {
        if (cartas.some(c => c !== "W")) {
            alert("No puedes jugar un contrato de apuesta después de una carta numérica.");
            return;
        }
    }

    cartas.push(valor);
    renderizarTablero();
}

function quitarCarta(exp, index) {
    cartasJugadas[jugadorActual][exp].splice(index, 1);
    renderizarTablero();
}

function calcular(cartas) {
    if (cartas.length === 0) return 0;
    
    let apuestas = cartas.filter(c => c === "W").length;
    let nums = cartas.filter(c => c !== "W").reduce((a, b) => a + Number(b), 0);
    
    let score = (nums - 20) * (apuestas + 1);
    if (cartas.length >= 8) score += 20;
    
    return score;
}

function terminarTurno() {
    let totalTurno = 0;
    for (let i = 0; i < expediciones; i++) {
        if (cartasJugadas[jugadorActual][i].length > 0) {
            totalTurno += calcular(cartasJugadas[jugadorActual][i]);
        }
    }

    puntosRondaActual[jugadorActual] = totalTurno;
    totales[jugadorActual] += totalTurno;

    if (jugadores.length === 2 && jugadorActual === 0) {
        jugadorActual = 1;
        iniciarTurno();
        return;
    }

    mostrarResultado();
}

function mostrarResultado() {
    let html = "<div style='text-align: left; background: #1e293b; padding: 15px; border-radius: 10px; margin-bottom: 10px;'>";
    
    html += "<strong>" + jugadores[0] + "</strong><br>";
    html += "Puntos de esta ronda: <span style='color:#facc15'>" + puntosRondaActual[0] + "</span><br>";
    html += "Total acumulado: <strong>" + totales[0] + "</strong><br>";
    
    if (jugadores.length === 2) {
        html += "<hr style='border-color: #334155; margin: 10px 0;'>";
        html += "<strong>" + jugadores[1] + "</strong><br>";
        html += "Puntos de esta ronda: <span style='color:#facc15'>" + puntosRondaActual[1] + "</span><br>";
        html += "Total acumulado: <strong>" + totales[1] + "</strong><br>";
    }
    
    html += "</div>";
    document.getElementById("roundScores").innerHTML = html;
    mostrar("roundResult");
}

function siguienteRonda() {
    ronda++;
    if (ronda > 3) {
        mostrarFinal();
        return;
    }
    jugadorActual = 0;
    resetRonda();
    iniciarTurno();
}

function mostrarFinal() {
    let html = "<div style='text-align: left; background: #1e293b; padding: 15px; border-radius: 10px;'>";
    html += "<strong>" + jugadores[0] + "</strong> : " + totales[0] + " puntos en total<br>";

    if (jugadores.length === 2) {
        html += "<strong>" + jugadores[1] + "</strong> : " + totales[1] + " puntos en total<br><br>";
        let ganador;
        if (totales[0] > totales[1]) ganador = jugadores[0];
        else if (totales[1] > totales[0]) ganador = jugadores[1];
        else ganador = "Empate";
        
        html += "<h3 style='color:#facc15; text-align:center;'>🏆 Gran Explorador: " + ganador + " 🏆</h3>";
    }
    html += "</div>";

    document.getElementById("finalScores").innerHTML = html;
    mostrar("finalResult");
}

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
}