// =====================================================
//  HCS — home.js
// =====================================================

const pad = n => String(n).padStart(2, '0');

// =====================================================
//  CONTADOR DINÂMICO
// =====================================================
let interval = null;

function startCountdown() {
  const evento = window.proximoEvento;
  if (!evento) return;

  const targetDate = evento.dataEvento.getTime();

  // Nome do evento acima do countdown
  const nomeEl = document.getElementById('evento-nome');
  if (nomeEl && evento.titulo) {
    nomeEl.textContent = evento.titulo;
    nomeEl.style.display = 'block';
  }

  // Preenche a seção de destaque do próximo evento
  preencherProxEvento(evento);

  // Botão dinâmico do hero
  const ctaBtn = document.querySelector('.cta');
  if (ctaBtn && evento.youtubeLink) {
    ctaBtn.onclick = () => window.open(evento.youtubeLink, '_blank');
  }

  // Evita duplicar intervalo
  if (interval) clearInterval(interval);

  interval = setInterval(() => {
    const diff = targetDate - Date.now();

    if (diff <= 0) {
      ['days', 'hours', 'minutes', 'seconds'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '00';
      });
      ctaBtn?.classList.add('cta--pulse');
      clearInterval(interval);
      return;
    }

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = pad(val);
    };

    set('days',    days);
    set('hours',   hours);
    set('minutes', minutes);
    set('seconds', seconds);

    if (diff < 86_400_000) {
      ctaBtn?.classList.add('cta--pulse');
    }
  }, 1000);
}

function preencherProxEvento(evento) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el && val != null) el.textContent = val;
  };

  set('pe-titulo', evento.titulo);
  set('pe-desc',   evento.descricao ?? '');

  if (evento.dataEvento instanceof Date) {
    const data = evento.dataEvento;

    const dataFormatada = data.toLocaleDateString('pt-BR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    const horaFormatada = data.toLocaleTimeString('pt-BR', {
      hour: '2-digit', minute: '2-digit',
    }) + ' (Brasília)';

    const diasRestantes = Math.ceil((data.getTime() - Date.now()) / 86_400_000);
    const subLabel = diasRestantes > 0
      ? `Em ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''} · YouTube`
      : 'Hoje · YouTube ao vivo';

    set('pe-data',       dataFormatada);
    set('pe-hora',       horaFormatada);
    set('pe-visual-sub', subLabel);
  }

  const btnLive = document.getElementById('pe-btn-live');
  if (btnLive && evento.youtubeLink) {
    btnLive.onclick = () => window.open(evento.youtubeLink, '_blank');
  }
}

window.addEventListener('eventoCarregado', startCountdown);


// =====================================================
//  CARROSSEL
// =====================================================
function iniciarCarrossel() {
  const track   = document.getElementById('carouselTrack');
  const nextBtn = document.querySelector('.next');
  const prevBtn = document.querySelector('.prev');

  if (!track || !nextBtn || !prevBtn) return;

  let index = 0;
  let cards  = [];

  function getVisible() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  function aplicarLayout() {
    cards = Array.from(track.children);
    if (cards.length === 0) return;

    const visible = getVisible();
    const pct     = 100 / visible;

    cards.forEach(card => {
      card.style.width    = `${pct}%`;
      card.style.minWidth = 'unset'; // garante que CSS não sobrescreve
      card.style.flexShrink = '0';
    });

    const maxIndex = Math.max(0, cards.length - visible);
    if (index > maxIndex) index = maxIndex;

    mover();
  }

  function mover() {
    if (cards.length === 0) return;
    const visible = getVisible();
    const pct     = 100 / visible;
    const offset  = index * pct;
    track.style.transform = `translateX(-${offset}%)`;
    atualizarBotoes();
  }

  function atualizarBotoes() {
    const visible  = getVisible();
    const maxIndex = Math.max(0, cards.length - visible);
    prevBtn.disabled      = index === 0;
    nextBtn.disabled      = index >= maxIndex;
    prevBtn.style.opacity = prevBtn.disabled ? '0.4' : '1';
    nextBtn.style.opacity = nextBtn.disabled ? '0.4' : '1';
  }

  nextBtn.addEventListener('click', () => {
    const visible = getVisible();
    if (index < cards.length - visible) { index++; mover(); }
  });

  prevBtn.addEventListener('click', () => {
    if (index > 0) { index--; mover(); }
  });

  // Swipe mobile
  let startX = 0;
  track.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const delta = startX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      const visible = getVisible();
      if (delta > 0 && index < cards.length - visible) index++;
      if (delta < 0 && index > 0) index--;
      mover();
    }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(aplicarLayout, 100);
  });

  // ✅ MutationObserver: espera os cards serem injetados pelo Firebase
  const observer = new MutationObserver(() => {
    if (track.children.length > 0) {
      observer.disconnect(); // para de observar após inicializar
      aplicarLayout();
    }
  });

  // Se já tem cards (raro, mas possível), inicializa direto
  if (track.children.length > 0) {
    aplicarLayout();
  } else {
    observer.observe(track, { childList: true });
  }
}


// =====================================================
//  NEWSLETTER
// =====================================================
function iniciarNewsletter() {
  const form    = document.getElementById('nlForm');
  const btn     = document.getElementById('nlSubmit');
  const sucesso = document.getElementById('nlSucesso');

  if (!form || !btn || !sucesso) return;

  btn.addEventListener('click', async () => {
    const nome  = document.getElementById('nlNome')?.value.trim();
    const email = document.getElementById('nlEmail')?.value.trim();

    if (!nome || !email) {
      alert('Preencha seu nome e e-mail para continuar.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Informe um e-mail válido.');
      return;
    }

    btn.disabled    = true;
    btn.textContent = 'Enviando...';

    try {
      // Conectar ao Firebase aqui se necessário:
      // await window.salvarInscricaoNewsletter({ nome, email });
      await new Promise(r => setTimeout(r, 600));

      form.hidden    = true;
      sucesso.hidden = false;
    } catch (err) {
      console.error('Erro ao salvar newsletter:', err);
      btn.disabled    = false;
      btn.textContent = 'Quero receber →';
      alert('Ocorreu um erro. Tente novamente.');
    }
  });
}


// =====================================================
//  INIT
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  iniciarCarrossel();
  iniciarNewsletter();
});