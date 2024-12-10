
  // Lista de imágenes y descripciones
  const carouselData = [
    {
        img: "imagenes/obras/eclipse.png",
        title: "ECLIPSE",
        info: "2023"
    },
    {
        img: "imagenes/obras/enchantment.png",
        title: "Enchantment",
        info: "2023"
    },
    {
        img: "imagenes/obras/porcelain.png",
        title: "Porcelain",
        info: "2023"
    },
    {
        img: "imagenes/obras/fourLounging.png",
        title: "Four Lounging",
        info: "2018"
    },
    {
        img: "imagenes/obras/flyOnRideThrough.png",
        title: "Fly on, Ride through",
        info: "2023"
    },
    {
        img: "imagenes/obras/eatenFledTears.png",
        title: "Eaten // Fled Tears",
        info: "2021"
    },
    {
        img: "imagenes/obras/ghostsAndShadows.png",
        title: "Ghost and Shadows",
        info: "2022"
    },
    {
        img: "imagenes/obras/theCathedralsOfArt.png",
        title: "The Cathedrals of Art",
        info: "1942"
    }
  ];
  
  let currentIndex = 0;
  const imgElement = document.getElementById("gallery-img");
  const titleElement = document.getElementById("gallery-title");
  const infoElement = document.getElementById("gallery-info");
  
  // Función para actualizar la imagen y la descripción
  function updateCarousel() {
    const { img, title, info } = carouselData[currentIndex];
    imgElement.src = img;
    titleElement.textContent = title;
    infoElement.textContent = info;
  
    currentIndex = (currentIndex + 1) % carouselData.length;
  }
  
  function openModal() {
    const { img, title, info } = carouselData[currentIndex];
    document.getElementById("modal-img").src = img;
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-info").innerText = info;
    document.getElementById("featuredModal").style.display = "flex";
  }
  
  function closeModal() {
    document.getElementById("featuredModal").style.display = "none";
  }
  
  function changeModalImage(src) {
    const modalImg = document.getElementById("modal-img");
    modalImg.src = src; // Cambia la imagen principal al hacer clic en una miniatura
  }
  
  
  // Cambiar cada 5 segundos
  setInterval(updateCarousel, 5000);
  
  // Inicializar con la primera imagen
  updateCarousel();