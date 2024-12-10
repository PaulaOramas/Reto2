document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.getElementById('dark-mode-toggle');
    const body = document.body;

    // Cargar preferencia del Session Storage
    const darkMode = sessionStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        body.classList.add('dark-mode');
        toggleDarkModeForCards(true);
        toggleSwitch.checked = true;
    }

    // Alternar entre modos
    toggleSwitch.addEventListener('change', () => {
        if (toggleSwitch.checked) {
            body.classList.add('dark-mode');
            sessionStorage.setItem('darkMode', 'enabled');
            toggleDarkModeForCards(true);
        } else {
            body.classList.remove('dark-mode');
            sessionStorage.setItem('darkMode', 'disabled');
            toggleDarkModeForCards(false);
        }
    });

    // Cambiar estilos de las cartas
    function toggleDarkModeForCards(isDarkMode) {
        const cards = document.querySelectorAll('.card');
        cards.forEach((card) => {
            if (isDarkMode) {
                card.classList.add('dark-mode');
            } else {
                card.classList.remove('dark-mode');
            }
        });
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const fontSizeSelector = document.getElementById('font-size-selector');
    const body = document.body;

    // Cargar preferencia de tamaño de letra desde Session Storage
    const savedFontSize = sessionStorage.getItem('fontSize');
    if (savedFontSize) {
        setFontSize(savedFontSize);
        fontSizeSelector.value = savedFontSize;
    }

    // Cambiar tamaño de letra al seleccionar una opción
    fontSizeSelector.addEventListener('change', (event) => {
        const selectedSize = event.target.value;
        setFontSize(selectedSize);
        sessionStorage.setItem('fontSize', selectedSize); // Guardar preferencia en Session Storage
    });

    // Función para aplicar el tamaño de letra
    function setFontSize(size) {
        body.classList.remove('font-small', 'font-large'); // Quitar clases anteriores
        if (size === 'small') {
            body.classList.add('font-small');
        } else if (size === 'large') {
            body.classList.add('font-large');
        }
        // Si es "normal", no se aplica ninguna clase
    }
});
