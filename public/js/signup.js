document.addEventListener('DOMContentLoaded', () => {
    const createAccountForm = document.querySelector('form');

    createAccountForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Captura los valores de todos los campos del formulario
        const userData = {
            nombre: document.querySelector('input[name="nombre"]').value.trim(),
            apellido: document.querySelector('input[name="apellido"]').value.trim(),
            cedula: document.querySelector('input[name="cedula"]').value.trim(),
            username: document.querySelector('input[name="username"]').value.trim(),
            email: document.querySelector('input[name="email"]').value.trim(),
            telefono: document.querySelector('input[name="telefono"]').value.trim(),
            direccion: document.querySelector('input[name="direccion"]').value.trim(),
            fecha_nacimiento: document.querySelector('input[name="fecha_nacimiento"]').value.trim(),
            intereses: document.querySelector('input[name="intereses"]').value.trim(),
            password: document.querySelector('input[name="password"]').value.trim(),
        };

        // Verifica que las contraseñas coincidan
        const confirmPassword = document.querySelector('input[name="confirmar_password"]').value.trim();
        if (userData.password !== confirmPassword) {
            alert('Las contraseñas no coinciden. Por favor, inténtalo de nuevo.');
            return;
        }

        // Deshabilitar el botón de envío mientras se procesa
        const submitButton = document.querySelector('.btn-enviar');
        submitButton.disabled = true;
        submitButton.textContent = 'Registrando...';

        // Enviar los datos al servidor
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const result = await response.json();

            if (result.success) {
                alert('Cuenta creada con éxito. Ahora puedes iniciar sesión.');
                window.location.href = '../../paginas/menu/usuario.html';
            } else {
                alert(result.message || 'Ocurrió un error al registrar la cuenta.');
                submitButton.disabled = false;
                submitButton.textContent = 'Crear Cuenta';
            }
        } catch (error) {
            console.error('Error al enviar los datos:', error);
            alert('Error al conectar con el servidor. Inténtalo más tarde.' + error);
            submitButton.disabled = false;
            submitButton.textContent = 'Crear Cuenta';
        }
    });
});

// Mantener los valores del formulario en sessionStorage
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const inputs = form.querySelectorAll('input, textarea, select');

    // Restaurar los valores del formulario desde sessionStorage
    inputs.forEach((input) => {
        const savedValue = sessionStorage.getItem(input.name);
        if (savedValue) {
            if (input.type === 'checkbox') {
                input.checked = savedValue === 'true';
            } else {
                input.value = savedValue;
            }
        }
    });

    // Guardar los valores del formulario en sessionStorage
    inputs.forEach((input) => {
        input.addEventListener('input', () => {
            if (input.type === 'checkbox') {
                sessionStorage.setItem(input.name, input.checked);
            } else {
                sessionStorage.setItem(input.name, input.value);
            }
        });
    });

    // Limpiar sessionStorage cuando se envía el formulario
    form.addEventListener('submit', () => {
        sessionStorage.clear();
    });
});
