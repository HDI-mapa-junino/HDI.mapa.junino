document.addEventListener('DOMContentLoaded', () => {

  // ─── Parallax Background ───────────────────────────────────────────────────
  const parallaxOrbs = document.querySelectorAll('.parallax-orb');
  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    parallaxOrbs.forEach((orb, i) => {
      const speed = 0.1 + i * 0.06;
      orb.style.transform = `translateY(${scrollY * speed}px)`;
    });
    ticking = false;
  }

  if (parallaxOrbs.length) {
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  // ─── Scroll Reveal ─────────────────────────────────────────────────────────
  const revealEls = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('revealed'));
  }

  // ─── Modais ────────────────────────────────────────────────────────────────
  const btnStand  = document.getElementById('btn-hotspot-stand');
  const btnCat    = document.getElementById('btn-hotspot-cat');
  const modalStand = document.getElementById('modal-stand');
  const modalCat   = document.getElementById('modal-cat');
  const closeStand = document.getElementById('modal-stand-close');
  const closeCat   = document.getElementById('modal-cat-close');

  const openModal = (modal, hotspotKey, hotspotName) => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (window['HDI_TrackEvent']) {
      window['HDI_TrackEvent']('open_hotspot', { hotspot: hotspotKey, hotspot_name: hotspotName });
    }
  };

  const closeModal = (modal) => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (btnStand)  btnStand.addEventListener('click',  (e) => { e.preventDefault(); openModal(modalStand, 'stand', 'Stand HDI Seguros'); });
  if (btnCat)    btnCat.addEventListener('click',    (e) => { e.preventDefault(); openModal(modalCat,   'cat',   'C.A.T. Turista'); });
  if (closeStand) closeStand.addEventListener('click', () => closeModal(modalStand));
  if (closeCat)   closeCat.addEventListener('click',   () => closeModal(modalCat));

  [modalStand, modalCat].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModal(modalStand); closeModal(modalCat); }
  });

  // ─── CTA Tracking ──────────────────────────────────────────────────────────
  const btnComoChegar = document.getElementById('btn-como-chegar');
  if (btnComoChegar) {
    btnComoChegar.addEventListener('click', () => {
      if (window['HDI_TrackEvent']) {
        window['HDI_TrackEvent']('click_direction', {
          destination: 'Pátio de Eventos Luiz Gonzaga Caruaru'
        });
      }
    });
  }

  // ─── Phone Tracking ────────────────────────────────────────────────────────
  document.querySelectorAll('.phone-item').forEach(item => {
    item.addEventListener('click', () => {
      const name   = item.querySelector('.phone-name')?.textContent.trim();
      const number = item.getAttribute('href')?.replace('tel:', '');
      if (window['HDI_TrackEvent']) {
        window['HDI_TrackEvent']('click_phone', { phone_name: name, phone_number: number });
      }
    });
  });

  // ─── Haptic Feedback ───────────────────────────────────────────────────────
  const triggerHaptic = () => { if ('vibrate' in navigator) navigator.vibrate(15); };

  [btnStand, btnCat, btnComoChegar, ...document.querySelectorAll('.phone-item')].forEach(el => {
    if (el) el.addEventListener('click', triggerHaptic);
  });
});
