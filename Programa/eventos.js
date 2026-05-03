// 🔥 IMPORTS CORRETOS (ESSENCIAL)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔧 CONFIG DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCKER2IZUX8J2kWuPpXDeQdrofgpDf6MpY",
  authDomain: "hcs-site-bca98.firebaseapp.com",
  projectId: "hcs-site-bca98",
};

// 🚀 INICIALIZAÇÃO
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔥 FUNÇÃO PRINCIPAL
async function carregarEventos() {
  const futurosContainer = document.getElementById("futuros");
  const passadosContainer = document.getElementById("passados");

  futurosContainer.innerHTML = "<p>Carregando...</p>";
  passadosContainer.innerHTML = "<p>Carregando...</p>";

  try {
    const snapshot = await getDocs(collection(db, "eventos"));

    let eventos = [];

    snapshot.forEach(docSnap => {
      const data = docSnap.data();

      eventos.push({
        id: docSnap.id,
        titulo: data.titulo || "Sem título",
        palestrante: data.palestrante || "Desconhecido",
        banner: data.banner || "Imagens/default.png",
        data: data.data ? new Date(data.data.seconds * 1000) : null
      });
    });

    const agora = new Date();

    const futuros = eventos.filter(e => e.data && e.data >= agora);
    const passados = eventos.filter(e => e.data && e.data < agora);

    futuros.sort((a, b) => a.data - b.data);
    passados.sort((a, b) => b.data - a.data);

    futurosContainer.innerHTML = "";
    passadosContainer.innerHTML = "";

    // 🧩 CRIA CARD
    function criarCard(e, isFuturo = false) {
      const card = document.createElement("a");
      card.className = "card";
      card.href = `palestra.html?id=${e.id}`;
      card.style.position = "relative";

      card.innerHTML = `
        ${isFuturo ? '<span class="badge">Em breve</span>' : ""}
        <img src="${e.banner}" onerror="this.src='Imagens/default.png'">
        <div class="info">
          <h3>${e.titulo}</h3>
          <p>${e.palestrante}</p>
          <p>${e.data ? e.data.toLocaleString() : "Data não definida"}</p>
        </div>
      `;

      return card;
    }

    // 🔵 FUTUROS
    if (futuros.length === 0) {
      futurosContainer.innerHTML = "<p>Nenhuma palestra futura.</p>";
    } else {
      futuros.forEach(e => {
        futurosContainer.appendChild(criarCard(e, true));
      });
    }

    // ⚫ PASSADOS
    if (passados.length === 0) {
      passadosContainer.innerHTML = "<p>Nenhuma palestra passada.</p>";
    } else {
      passados.forEach(e => {
        passadosContainer.appendChild(criarCard(e));
      });
    }

  } catch (err) {
    console.error("ERRO REAL:", err);

    futurosContainer.innerHTML = "<p>Erro ao carregar eventos.</p>";
    passadosContainer.innerHTML = "<p>Erro ao carregar eventos.</p>";
  }
}

// 🚀 EXECUTA
carregarEventos();