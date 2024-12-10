document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginContainer = document.getElementById('login-container');
    const welcomeContainer = document.getElementById('welcome-container');
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutButton = document.getElementById('logout-button');

    // Maneja el envío del formulario de inicio de sesión
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        // Envía los datos al servidor
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    // Guarda el estado de inicio de sesión en el local storage
                    localStorage.setItem('isLoggedIn', true);
                    localStorage.setItem('currentUser', data.username);

                    showWelcomeMessage(data.username);
                } else {
                    alert(data.message);
                    // Redirige si el servidor indica una URL para redirección
                    if (data.redirectTo) {
                        window.location.href = data.redirectTo;
                    }
                }
            })
            .catch(() => {
                alert('Error al conectar con el servidor. Inténtalo más tarde.');
            });
    });

    // Maneja el cierre de sesión
    logoutButton.addEventListener('click', () => {
        // Elimina los datos de inicio de sesión del local storage
        localStorage.setItem('isLoggedIn', false);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('cart');
        cart = [];
        showLoginForm();
    });

    // Función para mostrar el mensaje de bienvenida
    function showWelcomeMessage(username) {
        loginContainer.style.display = 'none';
        welcomeContainer.style.display = 'flex';
        welcomeMessage.textContent = `Bienvenido, ${username}`;
    }

    // Función para mostrar el formulario de inicio de sesión
    function showLoginForm() {
        loginContainer.style.display = 'flex';
        welcomeContainer.style.display = 'none';
    }

    // Verifica si ya está autenticado
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = localStorage.getItem('currentUser');

    if (isLoggedIn && currentUser) {
        showWelcomeMessage(currentUser);
    } else {
        showLoginForm();
    }
});
