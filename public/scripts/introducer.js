document.addEventListener('DOMContentLoaded', function () {
    const slides = document.querySelectorAll('.imageSlides');
    const slider = document.querySelector('.containsSlides');
    const sliderWidth = slider.clientWidth;
    let currentSlide = 0;

    function scrollSlider(direction) {
        const scrollAmount = direction === 'next' ? slider.clientWidth : -slider.clientWidth;
        slider.scrollTo({
            left: slider.scrollLeft + scrollAmount,
            behavior: 'smooth'
        });
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        scrollSlider('prev');
    }
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        scrollSlider('next');

        if (currentSlide === slides.length - 1) {
            setTimeout(() => {
                currentSlide = 0;
                scrollSlider('prev');
            }, 6000);
        } else {
            setTimeout(nextSlide, 6000);
        }
    }

    setTimeout(nextSlide, 6000);

    document.querySelector('.sliderButton.left').addEventListener('click', prevSlide);
    document.querySelector('.sliderButton.right').addEventListener('click', nextSlide);
});