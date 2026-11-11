/* ============================================
   PANIER - Logique panier avec localStorage
   L'Envol des Pétales
   ============================================ */

var Panier = (function() {
    'use strict';

    var STORAGE_KEY = 'edp_panier';

    /* --- Récupérer le panier depuis localStorage --- */
    function getItems() {
        try {
            var data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    /* --- Sauvegarder le panier --- */
    function saveItems(items) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (e) {
            // localStorage plein ou indisponible
        }
    }

    /* --- Ajouter un article --- */
    function addItem(product) {
        var items = getItems();
        var existing = null;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === product.id) {
                existing = items[i];
                break;
            }
        }

        if (existing) {
            existing.qty += 1;
        } else {
            items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                qty: product.qty || 1
            });
        }

        saveItems(items);
        updateUI();
        openDrawer();
    }

    /* --- Retirer un article --- */
    function removeItem(productId) {
        var items = getItems();
        items = items.filter(function(item) { return item.id !== productId; });
        saveItems(items);
        updateUI();
    }

    /* --- Changer la quantité --- */
    function updateQty(productId, delta) {
        var items = getItems();
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === productId) {
                items[i].qty += delta;
                if (items[i].qty <= 0) {
                    items.splice(i, 1);
                }
                break;
            }
        }
        saveItems(items);
        updateUI();
    }

    /* --- Calculer le total --- */
    function getTotal() {
        var items = getItems();
        var total = 0;
        for (var i = 0; i < items.length; i++) {
            total += items[i].price * items[i].qty;
        }
        return total;
    }

    /* --- Compter les articles --- */
    function getCount() {
        var items = getItems();
        var count = 0;
        for (var i = 0; i < items.length; i++) {
            count += items[i].qty;
        }
        return count;
    }

    /* --- Mettre à jour l'interface --- */
    function updateUI() {
        var items = getItems();
        var count = getCount();
        var total = getTotal();

        // Compteur dans le header
        var countEl = document.getElementById('cart-count');
        if (countEl) {
            countEl.textContent = count;
            if (count > 0) {
                countEl.classList.remove('empty');
            } else {
                countEl.classList.add('empty');
            }
        }

        // Contenu du drawer
        var itemsContainer = document.getElementById('cart-items');
        var emptyEl = document.getElementById('cart-empty');
        var footerEl = document.getElementById('cart-footer');
        var totalEl = document.getElementById('cart-total');

        if (!itemsContainer) return;

        // Vider le contenu sauf le message vide
        var cartItemEls = itemsContainer.querySelectorAll('.cart-item');
        for (var i = 0; i < cartItemEls.length; i++) {
            cartItemEls[i].remove();
        }

        if (items.length === 0) {
            if (emptyEl) emptyEl.style.display = 'block';
            if (footerEl) footerEl.style.display = 'none';
        } else {
            if (emptyEl) emptyEl.style.display = 'none';
            if (footerEl) footerEl.style.display = 'block';
            if (totalEl) totalEl.textContent = formatPrice(total);

            for (var j = 0; j < items.length; j++) {
                var item = items[j];
                var el = document.createElement('div');
                el.className = 'cart-item';
                el.innerHTML =
                    '<div class="cart-item__image"><div class="placeholder-img placeholder-img--bouquets" style="width:100%;height:100%;font-size:1rem;"></div></div>' +
                    '<div class="cart-item__info">' +
                        '<p class="cart-item__name">' + escapeHtml(item.name) + '</p>' +
                        '<p class="cart-item__price">' + formatPrice(item.price) + '</p>' +
                        '<div class="cart-item__qty">' +
                            '<button data-id="' + escapeHtml(item.id) + '" data-action="minus" aria-label="Réduire la quantité">-</button>' +
                            '<span>' + item.qty + '</span>' +
                            '<button data-id="' + escapeHtml(item.id) + '" data-action="plus" aria-label="Augmenter la quantité">+</button>' +
                        '</div>' +
                    '</div>' +
                    '<button class="cart-item__remove" data-id="' + escapeHtml(item.id) + '" data-action="remove" aria-label="Supprimer ' + escapeHtml(item.name) + '">&times;</button>';

                itemsContainer.appendChild(el);
            }
        }
    }

    /* --- Ouvrir le drawer --- */
    function openDrawer() {
        var drawer = document.getElementById('cart-drawer');
        var overlay = document.getElementById('cart-overlay');
        if (drawer) drawer.classList.add('open');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /* --- Fermer le drawer --- */
    function closeDrawer() {
        var drawer = document.getElementById('cart-drawer');
        var overlay = document.getElementById('cart-overlay');
        if (drawer) drawer.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    /* --- Formater le prix --- */
    function formatPrice(price) {
        return price.toFixed(2).replace('.', ',') + ' \u20AC';
    }

    /* --- Échapper le HTML pour éviter l'injection --- */
    function escapeHtml(text) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(String(text)));
        return div.innerHTML;
    }

    /* --- Initialisation --- */
    function init() {
        // Bouton panier ouvre le drawer
        var cartBtn = document.getElementById('cart-btn');
        if (cartBtn) {
            cartBtn.addEventListener('click', function() {
                openDrawer();
            });
        }

        // Bouton fermer
        var closeBtn = document.getElementById('cart-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeDrawer);
        }

        // Overlay ferme le drawer
        var overlay = document.getElementById('cart-overlay');
        if (overlay) {
            overlay.addEventListener('click', closeDrawer);
        }

        // Délégation d'événements pour les boutons +/- et supprimer
        var itemsContainer = document.getElementById('cart-items');
        if (itemsContainer) {
            itemsContainer.addEventListener('click', function(e) {
                var btn = e.target.closest('button[data-action]');
                if (!btn) return;

                var id = btn.dataset.id;
                var action = btn.dataset.action;

                if (action === 'plus') updateQty(id, 1);
                else if (action === 'minus') updateQty(id, -1);
                else if (action === 'remove') removeItem(id);
            });
        }

        // Fermer avec Echap
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeDrawer();
        });

        // Mettre à jour l'UI au chargement
        updateUI();
    }

    // Initialiser quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // API publique
    return {
        addItem: addItem,
        removeItem: removeItem,
        updateQty: updateQty,
        getItems: getItems,
        getTotal: getTotal,
        getCount: getCount,
        openDrawer: openDrawer,
        closeDrawer: closeDrawer
    };

})();
