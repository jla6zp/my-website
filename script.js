const gallery = document.querySelector(".Gallery");
const scrollLeftBtn = document.querySelector(".ScrollLeft");
const scrollRightBtn = document.querySelector(".ScrollRight");

function scrollGallery(direction) {
    const currentScroll = gallery.scrollLeft;
    const targetScroll = direction === 'left' 
        ? currentScroll - 300 
        : currentScroll + 300;
    
    smoothScroll(currentScroll, targetScroll);
}

function smoothScroll(start, end) {
    const duration = 500; // milliseconds
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        gallery.scrollLeft = start + (end - start) * easeInOutQuad(progress);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

scrollLeftBtn.addEventListener("mouseenter", () => {
    scrollGallery('left');
});

scrollRightBtn.addEventListener("mouseenter", () => {
    scrollGallery('right');
});
