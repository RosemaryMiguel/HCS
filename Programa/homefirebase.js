import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCKER2IZUX8J2kWuPpXDeQdrofgpDf6MpY",
    authDomain: "hcs-site-bca98.firebaseapp.com",
    projectId: "hcs-site-bca98",
    storageBucket: "hcs-site-bca98.firebasestorage.app",
    messagingSenderId: "808200606131",
    appId: "1:808200606131:web:6b8f6adde5630386487bc6",
    measurementId: "G-BWD411PY98"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.proximoEvento = null;

async function carregarEventos() {
  const snapshot = await getDocs(collection(db, "eventos"));

  let eventos = [];

  snapshot.forEach(doc => {
    const data = doc.data();

    eventos.push({
      ...data,
      id: doc.id,
      dataEvento: data.data.toDate()
    });
  });

  // 🔥 ordenar do mais recente para o mais antigo
  eventos.sort((a, b) => b.dataEvento - a.dataEvento);


  // 🔥 pegar próximo evento (futuro)
  const agora = new Date();
  const futuros = eventos.filter(e => e.dataEvento > agora);

  if (futuros.length > 0) {
    window.proximoEvento = futuros.sort((a, b) => a.dataEvento - b.dataEvento)[0];
    window.dispatchEvent(new Event("eventoCarregado"));
  }

  // 🔥 limitar a 7
  eventos = eventos.slice(0, 7);

  // 🔥 gerar cards
  criarCards(eventos);
}

function criarCards(eventos) {
  const track = document.getElementById("carouselTrack");

  track.innerHTML = "";

  eventos.forEach(evento => {
    const card = document.createElement("a");

    card.className = "card";

    // 🔥 link dinâmico com ID
    card.href = `palestra.html?id=${evento.id}`;

    card.innerHTML = `
        <img src="${evento.banner || 'Imagens/default.png'}" onerror="this.src='Imagens/default.png'">
        <div class="overlay">Ver palestra</div>
    `;

    track.appendChild(card);
  });

  console.log("Cards criados:", eventos.length);
}

carregarEventos();