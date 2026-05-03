import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCKER2IZUX8J2kWuPpXDeQdrofgpDf6MpY",
  authDomain: "hcs-site-bca98.firebaseapp.com",
  projectId: "hcs-site-bca98"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    await signInWithEmailAndPassword(auth, email, senha);

    window.location.href = "admin.html";

  } catch (err) {
    console.error(err);
    alert("Email ou senha inválidos");
  }
});