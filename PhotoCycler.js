const photoPanel = document.querySelector('.photo-panel:nth-child(3)');
const photoBar = photoPanel.querySelector('.photo-bar');
const photos = photoPanel.querySelectorAll('.photo');

let current = 0;
let hoverInterval = null;

// Preload images
photos.forEach(photo => {
    const img = new Image();
    const url = photo.style.backgroundImage.replace(/url\(["']?(.+?)["']?\)/, '$1');
    img.src = url;
});

// Show next photo
function showNextPhoto() {
    photos.forEach(p => p.classList.remove('active', 'slide', 'slide-out'));

    photos[current].classList.add('active');

    current = (current + 1) % photos.length;
}

function showFirstPhoto() {
    photos.forEach(p => p.classList.remove('active', 'slide', 'slide-out'));
    photos[0].classList.add('active');
    photos[0].classList.add('slide');
    current += 1;
}

// Hover starts cycling
photoBar.addEventListener('mouseenter', () => {
    current = 0;
    showFirstPhoto();

    // showNextPhoto(); // immediately show first photo sliding in

    hoverInterval = setInterval(showNextPhoto, 3000);
});

// Hover ends: slide out all images
photoBar.addEventListener('mouseleave', () => {
    clearInterval(hoverInterval);
    hoverInterval = null;

    photos.forEach(photo => {
        photo.classList.add('active');
        photo.classList.add('slide-out');
    });

    // // Reset after CSS transition
    // setTimeout(() => {
    //     photos.forEach(photo => photo.classList.remove('active', 'slide', 'slide-out'));
    //     photos.forEach(photo => photo.style.opacity = '');
    // }, 600);
});
