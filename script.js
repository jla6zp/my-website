const gallery = document.getElementById('gallery');
const scrollLeftBtn = document.getElementById('scrollLeft');
const scrollRightBtn = document.getElementById('scrollRight');
const hoverScrollLeft = document.getElementById('hoverScrollLeft');
const hoverScrollRight = document.getElementById('hoverScrollRight');
const menuToggle = document.getElementById('menuToggle');
const menuDropdown = document.getElementById('menuDropdown');
const menuContainer = document.getElementById('menuContainer');

// ---- Menu Toggle ----

menuToggle.addEventListener('click', () => {
    menuDropdown.classList.toggle('open');
});

document.addEventListener('click', (e) => {
    if (!menuContainer.contains(e.target)) {
        menuDropdown.classList.remove('open');
    }
});

// ---- Click Scroll (3 photo widths) ----

function getPhotoWidth() {
    const firstPhoto = gallery.querySelector('.GalleryImage');
    if (!firstPhoto) return 300;
    return firstPhoto.offsetWidth + 5; // +gap
}

function clickScroll(direction) {
    const scrollAmount = getPhotoWidth() * 3;
    const maxScroll = gallery.scrollWidth - gallery.clientWidth;
    const current = gallery.scrollLeft;

    const target = direction === 'right'
        ? Math.min(current + scrollAmount, maxScroll)
        : Math.max(current - scrollAmount, 0);

    smoothScroll(current, target);
}

scrollLeftBtn.addEventListener('click', () => clickScroll('left'));
scrollRightBtn.addEventListener('click', () => clickScroll('right'));

// ---- Smooth Scroll Helper ----

function smoothScroll(start, end) {
    const duration = 500;
    const startTime = Date.now();

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        gallery.scrollLeft = start + (end - start) * easeInOutQuad(progress);
        if (progress < 1) requestAnimationFrame(animate);
    }
    animate();
}

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// ---- Hover Scroll (continuous slow pan) ----

let hoverRaf = null;
const HOVER_SPEED = 1.8;

function startHoverScroll(direction) {
    stopHoverScroll();
    function frame() {
        const maxScroll = gallery.scrollWidth - gallery.clientWidth;
        if (direction === 'right') {
            if (gallery.scrollLeft >= maxScroll) return;
            gallery.scrollLeft += HOVER_SPEED;
        } else {
            if (gallery.scrollLeft <= 0) return;
            gallery.scrollLeft -= HOVER_SPEED;
        }
        hoverRaf = requestAnimationFrame(frame);
    }
    hoverRaf = requestAnimationFrame(frame);
}

function stopHoverScroll() {
    if (hoverRaf) {
        cancelAnimationFrame(hoverRaf);
        hoverRaf = null;
    }
}

hoverScrollLeft.addEventListener('mouseenter', () => startHoverScroll('left'));
hoverScrollLeft.addEventListener('mouseleave', stopHoverScroll);
hoverScrollRight.addEventListener('mouseenter', () => startHoverScroll('right'));
hoverScrollRight.addEventListener('mouseleave', stopHoverScroll);

// ---- Scroll Button Visibility ----

function updateScrollButtons() {
    const atStart = gallery.scrollLeft <= 0;
    const atEnd = gallery.scrollLeft >= gallery.scrollWidth - gallery.clientWidth - 1;

    scrollLeftBtn.classList.toggle('hidden', atStart);
    hoverScrollLeft.classList.toggle('hidden', atStart);
    scrollRightBtn.classList.toggle('hidden', atEnd);
    hoverScrollRight.classList.toggle('hidden', atEnd);
}

gallery.addEventListener('scroll', updateScrollButtons);
window.addEventListener('resize', updateScrollButtons);

// Re-check once photos are injected into the gallery
new MutationObserver(updateScrollButtons).observe(gallery, { childList: true });
