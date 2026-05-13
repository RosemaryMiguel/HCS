// 🔥 IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔧 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCKER2IZUX8J2kWuPpXDeQdrofgpDf6MpY",
  authDomain: "hcs-site-bca98.firebaseapp.com",
  projectId: "hcs-site-bca98",
};

// 🚀 INIT
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔥 FUNÇÃO PRINCIPAL
async function carregarEventos() {

  const container = document.getElementById("lista-eventos");
  container.innerHTML = "<p>Carregando eventos...</p>";

  try {
    const snapshot = await getDocs(collection(db, "eventos"));

    let eventos = [];

    snapshot.forEach(docSnap => {
      const data = docSnap.data();

      eventos.push({
        id: docSnap.id,
        titulo: data.titulo || "Sem título",
        palestrante: data.palestrante || "Desconhecido",
        descricao: data.descricao || "",
        banner: data.banner || "Imagens/default.png",
        data: data.data ? new Date(data.data.seconds * 1000) : null
      });
    });

    // ordenar do mais recente → mais antigo
    eventos.sort((a, b) => b.data - a.data);

    container.innerHTML = "";

    // 🔥 AGRUPAR POR ANO
    const eventosPorAno = {};

    eventos.forEach(e => {
      if (!e.data) return;

      const ano = e.data.getFullYear();

      if (!eventosPorAno[ano]) {
        eventosPorAno[ano] = [];
      }

      eventosPorAno[ano].push(e);
    });

    // 🔥 RENDERIZAÇÃO
    Object.keys(eventosPorAno)
      .sort((a, b) => b - a) // ano mais recente primeiro
      .forEach(ano => {

        // título do ano
        const tituloAno = document.createElement("h2");
        tituloAno.className = "ano";
        tituloAno.textContent = ano;

        container.appendChild(tituloAno);

        // eventos daquele ano
        eventosPorAno[ano].forEach(e => {
          container.appendChild(criarEvento(e));
        });
      });

  } catch (err) {
    console.error("Erro:", err);
    container.innerHTML = "<p>Erro ao carregar eventos.</p>";
  }
}

// 🔥 CRIA CARD NO NOVO FORMATO
function criarEvento(e) {
  const card = document.createElement("a");
  card.className = "evento-card";
  card.href = `palestra.html?id=${e.id}`;

  card.innerHTML = `
    <img class="evento-img" src="${e.banner}" 
         onerror="this.src='Imagens/default.png'">

    <div class="evento-info">
      <h3>${e.titulo}</h3>
      <p>${e.palestrante}</p>
      <p class="evento-data">
        ${e.data ? e.data.toLocaleString() : "Data não definida"}
      </p>
    </div>
  `;

  return card;
}

// 🚀 EXECUTA
carregarEventos();