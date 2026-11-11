/* ============================================
   BOUTIQUE - Filtres produits & Modal
   L'Envol des Pétales
   ============================================ */

(function() {
    'use strict';

    /* --- FILTRES PAR OCCASION --- */
    var filterBtns = document.querySelectorAll('.filter-btn');
    var productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var filter = this.dataset.filter;

            // Mettre à jour le bouton actif
            filterBtns.forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');

            // Filtrer les produits
            productCards.forEach(function(card) {
                if (filter === 'tous' || card.dataset.category === filter) {
                    card.style.display = '';
                    // Re-animer
                    card.classList.remove('visible');
                    setTimeout(function() { card.classList.add('visible'); }, 50);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    /* --- MODAL PRODUIT --- */
    var modal = document.getElementById('product-modal');
    var modalClose = document.getElementById('modal-close');
    var modalTitle = document.getElementById('modal-title');
    var modalBadge = document.getElementById('modal-badge');
    var modalDesc = document.getElementById('modal-desc');
    var modalPrice = document.getElementById('modal-price');
    var modalPlaceholder = document.getElementById('modal-placeholder');
    var modalAddCart = document.getElementById('modal-add-cart');
    var currentProduct = null;

    // Ouvrir la modal au clic sur une card (mais pas sur le bouton Commander)
    productCards.forEach(function(card) {
        card.addEventListener('click', function(e) {
            // Si on a cliqué sur le bouton "Commander", ne pas ouvrir la modal
            if (e.target.closest('.btn-add-cart')) return;

            currentProduct = {
                id: card.dataset.id,
                name: card.dataset.name,
                price: parseFloat(card.dataset.price),
                badge: card.dataset.badge,
                desc: card.dataset.desc,
                gradient: card.dataset.gradient
            };

            if (modalTitle) modalTitle.textContent = currentProduct.name;
            if (modalBadge) modalBadge.textContent = currentProduct.badge;
            if (modalDesc) modalDesc.textContent = currentProduct.desc;
            if (modalPrice) modalPrice.textContent = currentProduct.price.toFixed(2).replace('.', ',') + ' \u20AC';
            if (modalPlaceholder) {
                modalPlaceholder.className = 'placeholder-img ' + currentProduct.gradient;
            }

            if (modal) modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Fermer la modal
    function closeModal() {
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
        currentProduct = null;
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal();
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Ajouter au panier depuis la modal
    if (modalAddCart) {
        modalAddCart.addEventListener('click', function() {
            if (currentProduct && typeof Panier !== 'undefined') {
                Panier.addItem({
                    id: currentProduct.id,
                    name: currentProduct.name,
                    price: currentProduct.price,
                    qty: 1
                });
                closeModal();
            }
        });
    }

    /* --- BOUTONS "COMMANDER" DANS LES CARDS --- */
    document.querySelectorAll('.btn-add-cart').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var card = this.closest('.product-card');
            if (card && typeof Panier !== 'undefined') {
                Panier.addItem({
                    id: card.dataset.id,
                    name: card.dataset.name,
                    price: parseFloat(card.dataset.price),
                    qty: 1
                });
            }
        });
    });

})();
