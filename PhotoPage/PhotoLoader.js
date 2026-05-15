fetch("PhotoPage/PhotoList.json")
  .then(res => res.json())
  .then(data => {
    const gallery = document.querySelector(".Gallery");
    const photos = data.photos;

    const buildSrcSet = (sizes) => {
      return Object.values(sizes)
        .map(size => `${size.url} ${size.width}w`)
        .join(", ");
    };

    const getDefaultSrc = (sizes) => {
      if (sizes.small) return sizes.small.url;
      if (sizes.thumbnail) return sizes.thumbnail.url;
      return Object.values(sizes)[0].url;
    };

    photos.forEach((photo) => {
      const img = document.createElement("img");

      img.src = getDefaultSrc(photo.sizes);
      img.srcset = buildSrcSet(photo.sizes);

      img.sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px";

      img.alt = photo.alt;

      // Use thumbnail dimensions to prevent layout shift
      if (photo.sizes.thumbnail) {
        img.width = photo.sizes.thumbnail.width;
        img.height = photo.sizes.thumbnail.height;
      }

      img.loading = "lazy";
      img.classList.add("GalleryImage");

      const fullSrc = photo.sizes.large?.url
        || photo.sizes.medium?.url
        || getDefaultSrc(photo.sizes);
      img.dataset.fullSrc = fullSrc;
      img.dataset.alt = photo.alt;

      gallery.appendChild(img);
    });
  })
  .catch(err => console.error("Error loading images:", err));