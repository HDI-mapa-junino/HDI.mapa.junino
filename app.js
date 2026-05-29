document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const btnStand = document.getElementById('btn-hotspot-stand');
  const btnCat = document.getElementById('btn-hotspot-cat');
  
  const modalStand = document.getElementById('modal-stand');
  const modalCat = document.getElementById('modal-cat');
  
  const closeStand = document.getElementById('modal-stand-close');
  const closeCat = document.getElementById('modal-cat-close');

  // Functions to open modals
  const openModal = (modal, hotspotKey, hotspotName) => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling underneath
    
    // Track modal open event
    if (window.HDI_TrackEvent) {
      window.HDI_TrackEvent('open_hotspot', {
        hotspot: hotspotKey,
        hotspot_name: hotspotName
      });
    }
  };

  // Functions to close modals
  const closeModal = (modal) => {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
  };

  // Event Listeners for Opening
  if (btnStand) {
    btnStand.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(modalStand, 'stand', 'Stand HDI Seguros');
    });
  }

  if (btnCat) {
    btnCat.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(modalCat, 'cat', 'C.A.T. Turista');
    });
  }

  // Event Listeners for Closing
  if (closeStand) {
    closeStand.addEventListener('click', () => closeModal(modalStand));
  }

  if (closeCat) {
    closeCat.addEventListener('click', () => closeModal(modalCat));
  }

  // Close when clicking background backdrop
  [modalStand, modalCat].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    }
  });

  // Close when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(modalStand);
      closeModal(modalCat);
    }
  });

  // Add click vibration trigger & custom analytics for Como Chegar
  const btnComoChegar = document.getElementById('btn-como-chegar');
  if (btnComoChegar) {
    btnComoChegar.addEventListener('click', () => {
      if (window.HDI_TrackEvent) {
        window.HDI_TrackEvent('click_direction', {
          destination: 'Pátio de Eventos Luiz Gonzaga Caruaru'
        });
      }
    });
  }

  // Track Phone Clicks
  document.querySelectorAll('.phone-link').forEach(phoneLink => {
    phoneLink.addEventListener('click', (e) => {
      const phoneText = phoneLink.innerText.trim();
      const phoneHref = phoneLink.getAttribute('href');
      const cleanPhoneName = phoneText.split(/\s+/)[0]; // Extract name like SAMU, Defesa, etc.
      
      if (window.HDI_TrackEvent) {
        window.HDI_TrackEvent('click_phone', {
          phone_name: cleanPhoneName,
          phone_number: phoneHref.replace('tel:', '')
        });
      }
    });
  });

  // Add click vibration trigger if supported (nice micro-interaction for mobiles)
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
  };

  [btnStand, btnCat, btnComoChegar, ...document.querySelectorAll('.phone-link')].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', triggerHaptic);
    }
  });
});
