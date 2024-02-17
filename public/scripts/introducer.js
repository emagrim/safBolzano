document.addEventListener('DOMContentLoaded', function () {
    const slides = document.querySelectorAll('.imageSlides');
    const slider = document.querySelector('.containsSlides');
    const sliderWidth = slider.clientWidth;
    let currentSlide = 0;
    let isScrolling = false;

    const element1 = document.querySelector('.sliderButton.left');
    const element2 = document.querySelector('.sliderButton.right');
    const thereIsInCode = element1 && element2;

    /*slides.forEach(function (slide) {
        var img = container.querySelector('img');
      
        if (img.naturalHeight > img.naturalWidth) {
          console.log('vertical.');
        } else if(img.naturalHeight = img.naturalWidth) {
          console.log('square.');
        } else {
            console.log('horizzontal')
        }
      });*/

    function scrollSlider(direction, callback) {
        if (thereIsInCode) {
            document.querySelector('.sliderButton.right').removeEventListener('click', alwaysNextSlide);
            const scrollAmount = direction === 'next' ? slider.clientWidth : -slider.clientWidth;
            slider.scrollTo({
                left: slider.scrollLeft + scrollAmount,
                behavior: 'smooth'
            });

            setTimeout(function () {
                document.querySelector('.sliderButton.right').addEventListener('click', alwaysNextSlide);
            }, 1000);
        } else {
            const scrollAmount = direction === 'next' ? slider.clientWidth : -slider.clientWidth;
            slider.scrollTo({
                left: slider.scrollLeft + scrollAmount,
                behavior: 'smooth'
            });
        }
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
            }, 5000);

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


    setTimeout(nextSlide, 6000);


    if (thereIsInCode) {
        document.querySelector('.sliderButton.left').addEventListener('click', prevSlide);
        document.querySelector('.sliderButton.right').addEventListener('click', alwaysNextSlide);
    }
});