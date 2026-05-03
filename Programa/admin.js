import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey:"AIzaSyCKER2IZUX8J2kWuPpXDeQdrofgpDf6MpY",
  authDomain: "hcs-site-bca98.firebaseapp.com",
  projectId: "hcs-site-bca98",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let editandoId = null;

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth(app);

import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);

  // 🔥 volta pra HOME (como você quer)
  window.location.href = "index.html";
};

// 🔒 trava o acesso
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});

// 🔥 LISTAR EVENTOS
async function carregarEventos() {
  const lista = document.getElementById("listaEventos");
  lista.innerHTML = "";

  const snapshot = await getDocs(collection(db, "eventos"));

  snapshot.forEach(docSnap => {
    const data = docSnap.data();

    const div = document.createElement("div");
    div.className = "evento";

    div.innerHTML = `
      <div class="info">
        <strong>${data.titulo}</strong>
        <span>${new Date(data.data.seconds * 1000).toLocaleString()}</span>

        <div class="acoes">
          <button onclick="editar('${docSnap.id}')">Editar</button>
          <button onclick="excluir('${docSnap.id}')">Excluir</button>
        </div>
      </div>
    `;

    lista.appendChild(div);
  });
}

// 🔥 EXCLUIR
window.excluir = async (id) => {
  if (!confirm("Tem certeza que deseja excluir?")) return;

  await deleteDoc(doc(db, "eventos", id));
  carregarEventos();
};

// 🔥 EDITAR
window.editar = async (id) => {
  try {
    const docRef = doc(db, "eventos", id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      alert("Evento não encontrado");
      return;
    }

    const data = snap.data();

    document.getElementById("titulo").value = data.titulo || "";
    document.getElementById("palestrante").value = data.palestrante || "";
    document.getElementById("instituicao").value = data.instituicao || "";
    document.getElementById("descricao").value = data.descricao || "";

    document.getElementById("data").value =
      data.data ? new Date(data.data.seconds * 1000).toISOString().slice(0,16) : "";

    document.getElementById("youtube").value = data.youtube || "";

    document.getElementById("imagem").value =
      data.imagem ? data.imagem.replace("Imagens/Palestrantes/", "") : "";

    document.getElementById("banner").value =
      data.banner ? data.banner.replace("Imagens/Posters/", "") : "";

    document.getElementById("inscricaoLink").value = data.inscricaoLink || "";

    editandoId = id;
    abrirModal("Editar Evento");

  } catch (e) {
    console.error(e);
    alert("Erro ao carregar evento");
  }
};

// 🔥 SALVAR (CRIAR OU EDITAR)
document.getElementById("formEvento").addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value.trim();
  const dataInput = document.getElementById("data").value;

  if (!titulo) {
    alert("Título é obrigatório");
    return;
  }

  if (!dataInput) {
    alert("Data é obrigatória");
    return;
  }

  try {
    const evento = {
      titulo,
      palestrante: document.getElementById("palestrante").value || "",
      instituicao: document.getElementById("instituicao").value || "",
      descricao: document.getElementById("descricao").value || "",
      data: Timestamp.fromDate(new Date(dataInput)),
      youtube: document.getElementById("youtube").value || "",
      imagem: "Imagens/Palestrantes/" + (document.getElementById("imagem").value || "default.png"),
      banner: "Imagens/Posters/" + (document.getElementById("banner").value || "default.png"),
      inscricaoLink: document.getElementById("inscricaoLink").value || ""
    };

    if (editandoId) {
      await updateDoc(doc(db, "eventos", editandoId), evento);
    } else {
      await addDoc(collection(db, "eventos"), evento);
    }

    fecharModal();
    carregarEventos();

  } catch (err) {
    console.error(err);
    alert("Erro ao salvar evento");
  }
});

// 🔥 MODAL
const modal = document.getElementById("modal");

function abrirModal(titulo) {
  document.getElementById("modalTitulo").innerText = titulo;
  modal.classList.add("ativo"); // ABRE
}

function fecharModal() {
  modal.classList.remove("ativo"); // FECHA
  document.getElementById("formEvento").reset();
}

document.getElementById("btnNovo").onclick = () => {
  editandoId = null;
  abrirModal("Novo Evento");
};

document.getElementById("fechar").onclick = fecharModal;

// INIT
carregarEventos();