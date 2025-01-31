loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    // Envía los datos al servidor para el inicio de sesión
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

                window.location.href = "../paginas/administrador/inicio"; // Redirigir al inicio
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