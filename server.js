const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para parsear JSON y servir archivos estáticos
app.use(bodyParser.json());
app.use(express.static('public')); // Cambia 'public' por tu carpeta de frontend

// Simulación de datos en memoria
const users = [{ username: 'usuario1', password: '12345' }];
let currentSession = null;

// Ruta para verificar sesión
app.get('/api/session', (req, res) => {
    res.json({ isLoggedIn: !!currentSession, currentUser: currentSession });
});

// Ruta para manejar inicio de sesión
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const credencialesFilePath = path.join(__dirname, 'credenciales.txt');

    // Leer el archivo de credenciales
    fs.readFile(credencialesFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error al leer credenciales.txt:', err);
            return res.status(500).json({ success: false, message: 'Error al verificar las credenciales.' });
        }

        // Separar las líneas del archivo
        const lines = data.split('\n');
        let userExists = false;

        // Buscar si el usuario y contraseña coinciden
        for (const line of lines) {
            const [storedUsername, storedPassword] = line.replace('Username: ', '').replace('Password: ', '').split(', ');

            if (storedUsername === username && storedPassword === password) {
                userExists = true;
                break;
            }
        }

        if (userExists) {
            currentSession = username;
            return res.json({ success: true, username, isLoggedIn: true });
        } else {
            return res.json({ success: false, message: 'Credenciales inválidas o usuario no existe.', redirectTo: '/paginas/Usuario/registarse.html' });
        }
    });
});

// Ruta para manejar cierre de sesión
app.post('/api/logout', (req, res) => {
    currentSession = null;
    res.json({ success: true });
});

// Ruta para manejar la creación de cuentas y guardarlas en archivos
app.post('/api/register', (req, res) => {
    const {
        nombre,
        apellido,
        cedula,
        username,
        email,
        telefono,
        direccion,
        fecha_nacimiento,
        intereses,
        password,
    } = req.body;

    // Verifica que no falten campos
    if (!nombre || !apellido || !cedula || !username || !email || !telefono || !direccion || !fecha_nacimiento || !intereses || !password) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

    // Verifica si el usuario ya existe
    if (users.find((u) => u.username === username)) {
        return res.status(400).json({ success: false, message: 'El nombre de usuario ya está registrado.' });
    }

    // Agrega el nuevo usuario al array en memoria
    users.push({ username, password });

    // Guarda el usuario en los archivos
    const cuentasFilePath = path.join(__dirname, 'cuentas.txt');
    const credencialesFilePath = path.join(__dirname, 'credenciales.txt');

    // Formato para guardar en los archivos
    const userEntryFull = `Nombre: ${nombre}, Apellido: ${apellido}, Cédula: ${cedula}, Username: ${username}, Email: ${email}, Teléfono: ${telefono}, Dirección: ${direccion}, Fecha de Nacimiento: ${fecha_nacimiento}, Intereses: ${intereses}, Password: ${password}\n`;
    const userEntryCredentials = `Username: ${username}, Password: ${password}\n`;

    // Guardar en cuentas.txt
    fs.appendFile(cuentasFilePath, userEntryFull, (err) => {
        if (err) {
            console.error('Error al guardar en cuentas.txt:', err);
            return res.status(500).json({ success: false, message: 'Error al guardar en cuentas.txt.' });
        }

        // Guardar en credenciales.txt
        fs.appendFile(credencialesFilePath, userEntryCredentials, (err) => {
            if (err) {
                console.error('Error al guardar en credenciales.txt:', err);
                return res.status(500).json({ success: false, message: 'Error al guardar en credenciales.txt.' });
            }

            res.json({ success: true, message: 'Usuario registrado con éxito.' });
        });
    });
});

// Maneja el inicio de la aplicación en el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
