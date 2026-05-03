// ===================== CONTADOR DINÂMICO =====================
let interval = null;

function startCountdown() {
  if (!window.proximoEvento) return;

  const targetDate = window.proximoEvento.dataEvento.getTime();

  // botão dinâmico
  document.querySelector(".cta").onclick = () => {
    window.open(window.proximoEvento.youtubeLink, "_blank");
  };

  // evita duplicar intervalo
  if (interval) clearInterval(interval);

  interval = setInterval(() => {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff < 0) return;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = days;
    document.getElementById("hours").innerText = hours;
    document.getElementById("minutes").innerText = minutes;
    document.getElementById("seconds").innerText = seconds;
  }, 1000);
}

// espera o Firebase carregar
window.addEventListener("eventoCarregado", startCountdown);



// ===================== CARROSSEL =====================
function iniciarCarrossel() {
  const track = document.querySelector('.carousel-track');
  const next = document.querySelector('.next');
  const prev = document.querySelector('.prev');

  if (!track || !next || !prev) return;

  let cards = document.querySelectorAll('.carousel-track .card');
  const visible = 3;
  let index = visible;

  // se não tiver cards, não faz nada
  if (cards.length === 0) return;

  // limpar possíveis clones antigos
  track.innerHTML = track.innerHTML;

  cards = document.querySelectorAll('.carousel-track .card');

  // clones para loop infinito
  cards.forEach(card => {
    track.appendChild(card.cloneNode(true));
  });

  cards.forEach(card => {
    track.insertBefore(card.cloneNode(true), track.firstChild);
  });

  const allCards = document.querySelectorAll('.carousel-track .card');

  function updatePosition(animate = true) {
    track.style.transition = animate ? "0.5s" : "none";
    track.style.transform = `translateX(-${index * (100 / visible)}%)`;
  }

  updatePosition(false);

  next.onclick = () => {
    index++;
    updatePosition(true);
  };

  prev.onclick = () => {
    index--;
    updatePosition(true);
  };

  track.addEventListener('transitionend', () => {
    if (index >= allCards.length - visible) {
      index = visible;
      updatePosition(false);
    }

    if (index <= 0) {
      index = allCards.length - (visible * 2);
      updatePosition(false);
    }
  });
}