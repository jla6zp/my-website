const gallery = document.getElementById('gallery');

// ---- Loading Screen ----

const loadingScreen = document.getElementById('loadingScreen');

function dismissLoadingScreen() {
    clearTimeout(safetyTimer);
    loadingScreen.classList.add('fade-out');
    loadingScreen.addEventListener('transitionend', () => loadingScreen.remove(), { once: true });
}

// Safety net: never block longer than 10s
const safetyTimer = setTimeout(dismissLoadingScreen, 10000);

gallery.addEventListener('photosAppended', () => {
    const images = Array.from(gallery.querySelectorAll('.GalleryImage'));
    // Only wait for images in initially visible columns
    const visibleImages = images.filter(img => img.offsetLeft < gallery.clientWidth);

    if (visibleImages.length === 0) { dismissLoadingScreen(); return; }

    let pending = visibleImages.length;
    function onSettled() { if (--pending === 0) dismissLoadingScreen(); }

    visibleImages.forEach(img => {
        if (img.complete && img.naturalWidth > 0) {
            onSettled();
        } else {
            img.addEventListener('load',  onSettled, { once: true });
            img.addEventListener('error', onSettled, { once: true });
        }
    });
}, { once: true });
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

// ---- Lightbox ----

const lightbox = document.createElement('div');
lightbox.classList.add('Lightbox');

const lightboxImg = document.createElement('img');
lightboxImg.classList.add('LightboxImg');

const lightboxClose = document.createElement('div');
lightboxClose.classList.add('LightboxClose');
lightboxClose.innerHTML = '&times;';

const lightboxPrev = document.createElement('div');
lightboxPrev.classList.add('LightboxArrow', 'LightboxArrowLeft');

const lightboxNext = document.createElement('div');
lightboxNext.classList.add('LightboxArrow', 'LightboxArrowRight');

const lightboxLoader = document.createElement('div');
lightboxLoader.classList.add('LightboxLoader', 'hidden');

const lightboxLoaderLogo = document.createElement('img');
lightboxLoaderLogo.classList.add('LightboxLoaderLogo');
lightboxLoaderLogo.src = 'Images/Filtered Logo.png';

const lightboxLoaderText = document.createElement('div');
lightboxLoaderText.classList.add('LightboxLoaderText');
lightboxLoaderText.textContent = 'Loading...';

lightboxLoader.appendChild(lightboxLoaderLogo);
lightboxLoader.appendChild(lightboxLoaderText);

lightbox.appendChild(lightboxImg);
lightbox.appendChild(lightboxClose);
lightbox.appendChild(lightboxPrev);
lightbox.appendChild(lightboxNext);
lightbox.appendChild(lightboxLoader);
document.body.appendChild(lightbox);

let currentIndex = 0;

function getGalleryImages() {
    return Array.from(gallery.querySelectorAll('.GalleryImage'));
}

function updateArrows(images) {
    lightboxPrev.classList.toggle('hidden', currentIndex === 0);
    lightboxNext.classList.toggle('hidden', currentIndex === images.length - 1);
}

function openLightbox(src, alt, index) {
    currentIndex = index;
    lightboxImg.style.transition = 'none';
    lightboxImg.style.opacity = '0';
    lightboxImg.src = '';
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateArrows(getGalleryImages());
    lightboxLoader.classList.remove('hidden');

    const preload = new Image();
    preload.onload = () => {
        lightboxLoader.classList.add('hidden');
        lightboxImg.src = src;
        lightboxImg.style.transition = '';
        lightboxImg.style.opacity = '1';
    };
    preload.onerror = () => lightboxLoader.classList.add('hidden');
    preload.src = src;
}

function navigateLightbox(delta) {
    const images = getGalleryImages();
    const next = currentIndex + delta;
    if (next < 0 || next >= images.length) return;
    const img = images[next];
    openLightbox(img.dataset.fullSrc, img.dataset.alt, next);
}

function closeLightbox() {
    lightbox.classList.remove('open');
    lightboxLoader.classList.add('hidden');
    document.body.style.overflow = '';
}

lightbox.addEventListener('click', (e) => {
    if (e.target !== lightboxImg) closeLightbox();
});

lightboxClose.addEventListener('click', closeLightbox);

lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateLightbox(-1);
});

lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateLightbox(1);
});

document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
});

// Delegate click on gallery images
gallery.addEventListener('click', (e) => {
    const img = e.target.closest('.GalleryImage');
    if (img && img.dataset.fullSrc) {
        const index = getGalleryImages().indexOf(img);
        openLightbox(img.dataset.fullSrc, img.dataset.alt, index);
    }
});

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
