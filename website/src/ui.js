const url = window.location.href;

switch (true) {
    case url.includes('misogyny'):
        document.getElementById('comb').style.display = 'none';
        break;
    case url.includes('life'):
        document.getElementById('plaster').style.display = 'none';
        break;
    case url.includes('societal'):
        document.getElementById('camera').style.display = 'none';
        break;
    case url.includes('reproductive'):
        document.getElementById('test').style.display = 'none';
        break;
    default:
        document.getElementById('test').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const list = document.querySelector('.objects__list');
    const svgs = document.querySelectorAll('.objects__nav svg circle');

    const updateScrollProgress = () => {
        const scrollLeft = list.scrollLeft;
        const scrollWidth = list.scrollWidth - list.clientWidth;
        let scrollPercentage = scrollLeft / scrollWidth;
        scrollPercentage = Math.min(Math.max(0, scrollPercentage), 0.9);

        // Reset all circle colors
        svgs.forEach(circle => {
            circle.setAttribute('fill', 'white');
        });

        // Determine which circle to fill based on scroll percentage
        const totalCircles = svgs.length;
        const activeIndex = Math.floor(scrollPercentage * totalCircles);

        if (activeIndex < totalCircles) {
            svgs[activeIndex].setAttribute('fill', '#F94300');
        }
    };

    list.addEventListener('scroll', updateScrollProgress);

    // Add touch event listeners for better mobile support
    list.addEventListener('touchmove', updateScrollProgress);
    list.addEventListener('touchend', updateScrollProgress);

    // Initial update in case the list is pre-scrolled
    updateScrollProgress();
});
