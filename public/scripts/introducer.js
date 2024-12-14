document.addEventListener('DOMContentLoaded', function () {
    const slides = document.querySelectorAll('.imageSlides');
    const slider = document.querySelector('.containsSlides');
    let sliderWidth = slider.clientWidth;
    
    // Iterate over each slide and get its computed style
    slides.forEach(slide => {
      const slideStyle = window.getComputedStyle(slide);
      slideWidth = slideStyle.width;
      console.log(slideWidth); // Do something with the width
    });
//slider.clientWidth
    let currentSlide = 0;
    let isScrolling = false;
    let isAutoScrolling = false;
    let imagesHTML = document.querySelectorAll('.slide');

    const element1 = document.querySelector('.sliderButton.left');
    const element2 = document.querySelector('.sliderButton.right');
    const thereIsInCode = element1 && element2;

    // Funzione per gestire lo scorrimento dello slider
    function scrollSlider(direction, callback) {
        if (isScrolling) return;  // Se lo slider è in movimento, blocca il clic

        isScrolling = true;  // Imposta lo stato di scrolling a true
        const scrollAmount = direction === 'next' ? sliderWidth : -sliderWidth;
        
        // Imposta lo scrolling e abilita la transizione fluida
        slider.scrollTo({
            left: slider.scrollLeft + scrollAmount,
            behavior: 'smooth'
        });

        // Dopo l'animazione, ripristina lo stato e consenti di nuovo il clic
        setTimeout(function () {
            isScrolling = false;  // Rende di nuovo disponibile lo scorrimento
            if (callback) callback();  // Esegui il callback se fornito
        }, 1500);  // Tempo di attesa per il termine dell'animazione
    }

    function toStart() {
        const toStart = slider.clientWidth * slides.length;
        slider.scrollBy({
            left: -toStart,
            behavior: 'smooth'
        });
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        scrollSlider('prev');
    }

    let isTimeoutFinished = true;

    function nextSlide() {
        if (isTimeoutFinished) {
            isTimeoutFinished = false;

            setTimeout(function () {
                isTimeoutFinished = true;
            }, 5000);  // Impostiamo un timeout per evitare troppi clic

            currentSlide = (currentSlide + 1) % slides.length;
            scrollSlider('next');

            if (currentSlide === slides.length - 1) {
                setTimeout(() => {
                    currentSlide = 0;
                    toStart();
                    setTimeout(nextSlide, 6000);
                }, 6000);
            } else {
                setTimeout(nextSlide, 6000);
            }
        }
    }

    function alwaysNextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        scrollSlider('next');
    }

    setTimeout(nextSlide, 6000);  // Avvia automaticamente lo slider

    // Event listeners per i pulsanti di navigazione
    if (thereIsInCode) {
        document.querySelector('.sliderButton.left').addEventListener('click', prevSlide);
        document.querySelector('.sliderButton.right').addEventListener('click', alwaysNextSlide);
    }

    // Funzione per determinare la forma dell'immagine
    function imgHeV(img) {
        console.log('Image loaded:', img);

        if (img && img.naturalHeight === img.naturalWidth) {
            console.log('square');
            img.classList.add('square');
        } else if (img && img.naturalHeight > img.naturalWidth) {
            console.log('vertical');
            img.classList.add('vertical');
        } else if (img) {
            console.log('horizontal');
            img.classList.add('horizontal');
        }
    }

    // Applica la funzione alle immagini caricate
    imagesHTML.forEach(function (img) {
        console.log('calling function time 1');
        img.onload = function () {
            console.log('calling function time 2');
            imgHeV(img);
        }
    });

    // Funzione per ricalcolare lo scroll quando cambia la larghezza
    function handleResize() {
        if (isScrolling) return; // Se lo slider è in movimento, non fare nulla

        const newSliderWidth = slider.clientWidth;
        const scrollOffset = currentSlide * newSliderWidth;
        slider.scrollTo({
            left: scrollOffset,
            behavior: 'instant'  // Immediate scrolling senza animazione
        });
    }

    // Ascolta l'evento di resize e aggiorna lo scroll
    window.addEventListener('resize', handleResize);
});
