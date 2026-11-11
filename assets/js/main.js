/* ============================================
   MAIN.JS - Navigation, animations globales
   L'Envol des Pétales
   ============================================ */

(function() {
    'use strict';

    /* --- BURGER MENU MOBILE --- */
    var burger = document.getElementById('burger');
    var nav = document.getElementById('nav');

    if (burger && nav) {
        function setMenu(open) {
            nav.classList.toggle('open', open);
            burger.classList.toggle('active', open);
            burger.setAttribute('aria-expanded', open ? 'true' : 'false');
            burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
            document.body.classList.toggle('menu-ouvert', open);
        }

        burger.addEventListener('click', function() {
            setMenu(!nav.classList.contains('open'));
        });

        // Fermer le menu au clic sur un lien ou avec Échap
        nav.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() { setMenu(false); });
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('open')) {
                setMenu(false);
                burger.focus();
            }
        });
        // Repasser en grand écran referme le menu
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && nav.classList.contains('open')) setMenu(false);
        });
    }

    /* --- HEADER SCROLL EFFECT --- */
    var header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    /* --- ANIMATIONS FADE-IN AU SCROLL --- */
    var fadeElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        fadeElements.forEach(function(el) {
            observer.observe(el);
        });
    } else {
        // Fallback : tout rendre visible
        fadeElements.forEach(function(el) {
            el.classList.add('visible');
        });
    }

    /* --- CITATION : les mots apparaissent un à un --- */
    document.querySelectorAll('[data-mots]').forEach(function(bloc) {
        var i = 0;
        Array.prototype.slice.call(bloc.childNodes).forEach(function(node) {
            if (node.nodeType === 3) {
                var frag = document.createDocumentFragment();
                node.textContent.split(/(\s+)/).forEach(function(part) {
                    if (!part) return;
                    if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
                    var span = document.createElement('span');
                    span.className = 'mot';
                    span.style.setProperty('--i', i++);
                    span.textContent = part;
                    frag.appendChild(span);
                });
                bloc.replaceChild(frag, node);
            } else if (node.nodeType === 1) {
                node.classList.add('mot');
                node.style.setProperty('--i', i++);
            }
        });
        var figure = bloc.closest('.quote');
        if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            figure.classList.add('visible');
            return;
        }
        var obs = new IntersectionObserver(function(entries) {
            if (entries[0].isIntersecting) {
                figure.classList.add('visible');
                obs.disconnect();
            }
        }, { threshold: 0.4 });
        obs.observe(figure);
    });

    /* --- VALIDATION DES FORMULAIRES --- */

    // Formulaire de devis (evenements.html)
    var formDevis = document.getElementById('form-devis');
    if (formDevis) {
        formDevis.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateForm(formDevis, 'devis')) {
                // Simuler l'envoi
                formDevis.style.display = 'none';
                var success = document.getElementById('form-success-devis');
                if (success) success.classList.add('visible');
            }
        });
    }

    // Formulaire de contact (contact.html)
    var formContact = document.getElementById('form-contact');
    if (formContact) {
        formContact.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateForm(formContact, 'contact')) {
                formContact.style.display = 'none';
                var success = document.getElementById('form-success-contact');
                if (success) success.classList.add('visible');
            }
        });
    }

    function validateForm(form, prefix) {
        var isValid = true;
        var requiredFields = form.querySelectorAll('[required]');

        // Reset errors
        form.querySelectorAll('.error').forEach(function(el) {
            el.classList.remove('error');
        });
        form.querySelectorAll('.form-error').forEach(function(el) {
            el.classList.remove('visible');
        });

        requiredFields.forEach(function(field) {
            var value = field.value.trim();
            var fieldValid = true;

            if (field.type === 'radio') {
                // Groupe de pastilles : au moins une doit être cochée
                fieldValid = !!form.querySelector('input[name="' + field.name + '"]:checked');
            } else if (!value) {
                fieldValid = false;
            }

            // Validation email
            if (field.type === 'email' && value) {
                var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    fieldValid = false;
                }
            }

            if (!fieldValid) {
                isValid = false;
                (field.type === 'radio' ? field.closest('.chips') : field).classList.add('error');
                // Trouver le message d'erreur associé
                var errorId = 'error-' + (prefix ? prefix + '-' : '') + field.name;
                // Essayer aussi sans prefix
                var errorEl = document.getElementById(errorId) ||
                              (field.closest('.form-group') || field.parentElement).querySelector('.form-error');
                if (errorEl) {
                    errorEl.classList.add('visible');
                }
            }
        });

        return isValid;
    }

    // Retirer l'erreur quand l'utilisateur modifie un champ
    document.querySelectorAll('input, select, textarea').forEach(function(field) {
        field.addEventListener(field.type === 'radio' ? 'change' : 'input', function() {
            this.classList.remove('error');
            var group = this.closest('.form-group');
            var chips = this.closest('.chips');
            if (chips) chips.classList.remove('error');
            var errorEl = group && group.querySelector('.form-error');
            if (errorEl) errorEl.classList.remove('visible');
        });
    });

    /* --- GALERIE RÉALISATIONS : filtres + visionneuse --- */
    var gallery = document.querySelector('.gallery');
    if (gallery) {
        var galleryItems = Array.prototype.slice.call(gallery.querySelectorAll('.gallery__item'));
        var galleryFilters = document.querySelectorAll('.gallery__filters .filter-btn');

        // Filtres par occasion
        galleryFilters.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var filtre = btn.dataset.filtre;
                galleryFilters.forEach(function(b) {
                    var actif = b === btn;
                    b.classList.toggle('active', actif);
                    b.setAttribute('aria-pressed', actif ? 'true' : 'false');
                });
                galleryItems.forEach(function(item) {
                    item.hidden = filtre !== 'tout' && item.dataset.categorie !== filtre;
                });
            });
        });

        // Visionneuse plein écran
        var lightbox = document.getElementById('lightbox');
        var lbImg = lightbox.querySelector('.lightbox__img');
        var lbTitle = lightbox.querySelector('.lightbox__title');
        var lbCount = lightbox.querySelector('.lightbox__count');
        var lbClose = lightbox.querySelector('.lightbox__close');
        var lbList = [];
        var lbIndex = 0;
        var lbOpener = null;

        function lbShow(index) {
            lbIndex = (index + lbList.length) % lbList.length;
            var img = lbList[lbIndex].querySelector('img');
            lbImg.src = img.src;
            lbImg.alt = img.alt;
            lbTitle.textContent = img.alt;
            lbCount.textContent = (lbIndex + 1) + ' / ' + lbList.length;
        }

        function lbOpen(item) {
            // On ne fait défiler que les photos visibles avec le filtre actif
            lbList = galleryItems.filter(function(i) { return !i.hidden; });
            lbOpener = document.activeElement;
            lightbox.hidden = false;
            document.body.style.overflow = 'hidden';
            lbShow(lbList.indexOf(item));
            lbClose.focus();
        }

        function lbCloseFn() {
            lightbox.hidden = true;
            document.body.style.overflow = '';
            if (lbOpener) lbOpener.focus();
        }

        galleryItems.forEach(function(item) {
            item.querySelector('.gallery__open').addEventListener('click', function() { lbOpen(item); });
        });

        lbClose.addEventListener('click', lbCloseFn);
        lightbox.querySelector('.lightbox__nav--prev').addEventListener('click', function() { lbShow(lbIndex - 1); });
        lightbox.querySelector('.lightbox__nav--next').addEventListener('click', function() { lbShow(lbIndex + 1); });

        // Clic sur le fond sombre pour fermer
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) lbCloseFn();
        });

        // Clavier : Échap, flèches, et focus gardé dans la visionneuse
        document.addEventListener('keydown', function(e) {
            if (lightbox.hidden) return;
            if (e.key === 'Escape') lbCloseFn();
            else if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
            else if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
            else if (e.key === 'Tab') {
                var focusables = lightbox.querySelectorAll('button');
                var first = focusables[0], last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        });

        // Glisser du doigt sur mobile
        var touchX = null;
        lightbox.addEventListener('touchstart', function(e) { touchX = e.touches[0].clientX; }, { passive: true });
        lightbox.addEventListener('touchend', function(e) {
            if (touchX === null) return;
            var dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 50) lbShow(lbIndex + (dx < 0 ? 1 : -1));
            touchX = null;
        });
    }

    /* --- LAZY LOADING DES IMAGES --- */
    // Les navigateurs modernes supportent loading="lazy" nativement
    // Pour les anciens navigateurs, on utilise IntersectionObserver
    if ('IntersectionObserver' in window) {
        var lazyImages = document.querySelectorAll('img[data-src]');
        var imgObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imgObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(function(img) {
            imgObserver.observe(img);
        });
    }

})();
