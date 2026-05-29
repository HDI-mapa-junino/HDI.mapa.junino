document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const btnStand = document.getElementById('btn-hotspot-stand');
  const btnCat = document.getElementById('btn-hotspot-cat');
  
  const modalStand = document.getElementById('modal-stand');
  const modalCat = document.getElementById('modal-cat');
  
  const closeStand = document.getElementById('modal-stand-close');
  const closeCat = document.getElementById('modal-cat-close');

  // Functions to open modals
  const openModal = (modal) => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling underneath
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
      openModal(modalStand);
    });
  }

  if (btnCat) {
    btnCat.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(modalCat);
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

  // Add click vibration trigger if supported (nice micro-interaction for mobiles)
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
  };

  [btnStand, btnCat, document.getElementById('btn-como-chegar')].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', triggerHaptic);
    }
  });
});
