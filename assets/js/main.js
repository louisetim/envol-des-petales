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
        burger.addEventListener('click', function() {
            var isOpen = nav.classList.toggle('open');
            burger.classList.toggle('active');
            burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Fermer le menu au clic sur un lien
        var navLinks = nav.querySelectorAll('.nav__link');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                nav.classList.remove('open');
                burger.classList.remove('active');
                burger.setAttribute('aria-expanded', 'false');
            });
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

            if (!value) {
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
                field.classList.add('error');
                // Trouver le message d'erreur associé
                var errorId = 'error-' + (prefix ? prefix + '-' : '') + field.name;
                // Essayer aussi sans prefix
                var errorEl = document.getElementById(errorId) ||
                              field.parentElement.querySelector('.form-error');
                if (errorEl) {
                    errorEl.classList.add('visible');
                }
            }
        });

        return isValid;
    }

    // Retirer l'erreur quand l'utilisateur modifie un champ
    document.querySelectorAll('input, select, textarea').forEach(function(field) {
        field.addEventListener('input', function() {
            this.classList.remove('error');
            var errorEl = this.parentElement.querySelector('.form-error');
            if (errorEl) errorEl.classList.remove('visible');
        });
    });

    /* --- SLIDESHOW RÉALISATIONS --- */
    var slideshow = document.querySelector('.realisations-slideshow');
    if (slideshow) {
        var displayImg = slideshow.querySelector('.slideshow-display');
        var mosaicItems = document.querySelectorAll('.mosaic-item');
        var prevBtn = slideshow.querySelector('.slideshow-btn--prev');
        var nextBtn = slideshow.querySelector('.slideshow-btn--next');
        var currentIndex = 0;

        function showImage(index) {
            currentIndex = (index + mosaicItems.length) % mosaicItems.length;
            var img = mosaicItems[currentIndex].querySelector('img');

            // Fade out
            displayImg.classList.add('fading');
            setTimeout(function() {
                displayImg.src = img.src;
                displayImg.alt = img.alt;
                displayImg.classList.remove('fading');
            }, 300);

            // Update active state on mosaic
            mosaicItems.forEach(function(item) { item.classList.remove('active'); });
            mosaicItems[currentIndex].classList.add('active');
        }

        // Clic sur une image de la mosaïque
        mosaicItems.forEach(function(item, i) {
            item.addEventListener('click', function() { showImage(i); });
        });

        prevBtn.addEventListener('click', function() { showImage(currentIndex - 1); });
        nextBtn.addEventListener('click', function() { showImage(currentIndex + 1); });
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
