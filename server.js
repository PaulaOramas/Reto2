require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg"); // Importar el módulo pg para PostgreSQL
const app = express();
const PORT = process.env.PORT || 3000;
const host = process.env.HOST || "172.16.0.133";

// Middleware para parsear JSON
app.use(bodyParser.json());

// Servir archivos estáticos desde una carpeta específica
app.use(express.static("public"));

app.get('/api/producto/:nombre', async (req, res) => {
  const { nombre } = req.params;
  try {
      const query = "SELECT * FROM producto WHERE pro_nombre = $1";
      const result = await pool.query(query, [nombre]);
      if (result.rows.length === 0) {
          return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }
      res.json(result.rows[0]);
  } catch (error) {
      console.error('Error al obtener el producto:', error);
      res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Actualizar el estado del producto a 'INA'
app.put('/api/producto/:nombre/actualizar', async (req, res) => {
  const { nombre } = req.params;
  const { estado } = req.body;
  try {
      const query = "UPDATE producto SET estado_pro = $1 WHERE pro_nombre = $2 RETURNING *";
      const result = await pool.query(query, [estado, nombre]);
      if (result.rowCount === 0) {
          return res.status(404).json({ success: false, message: 'Producto no encontrado o no actualizado' });
      }
      res.json({ success: true, message: 'Estado del producto actualizado a INA', producto: result.rows[0] });
  } catch (error) {
      console.error('Error al actualizar el estado del producto:', error);
      res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});


// Conexión a PostgreSQL
const pool = new Pool({
  user: "postgres",
  host: "172.16.0.133",
  database: "Desarrollo",
  password: "1234",
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*-------------------------------------
PARTE CRUD DE ADMIN
-------------------------------------*/


// CRUD FACTURAS

//ver detalle
app.get("/api/facturas/detalle/:idFactura", async (req, res) => {
  const { idFactura } = req.params;
  const query = `
        SELECT df.id_factura, df.id_producto, p.pro_nombre, df.pxf_cantidad, p.pro_precio_venta, df.estado_pro_fac 
        FROM detalle_factura df
        JOIN producto p ON df.id_producto = p.id_producto
        WHERE df.id_factura = $1;
    `;

  try {
    const result = await pool.query(query, [idFactura]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo detalle de factura:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al obtener detalle de factura" });
  }
});

//generar factura
app.post('/api/factura/generar', async (req, res) => {
  const { productos } = req.body;
  if (!productos || productos.length === 0) {
      return res.status(400).json({ success: false, message: 'Datos insuficientes para generar la factura' });
  }

  const client = await pool.connect();
  try {
      await client.query('BEGIN');

      // Crear factura con ID fijo
      const id_factura = 'FAC164';
      const cli_cedula = '1701'; // Cliente fijo
      const fac_fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const fac_monto = productos.reduce((acc, prod) => acc + prod.price, 0);
      const estado_fac = 'ACT';

      const facturaQuery = `
          INSERT INTO factura (id_factura, cli_cedula, fac_fecha, fac_monto, estado_fac)
          VALUES ($1, $2, $3, $4, $5);
      `;
      await client.query(facturaQuery, [id_factura, cli_cedula, fac_fecha, fac_monto, estado_fac]);

      // Insertar detalles de factura
      for (const prod of productos) {
          await client.query(
              `INSERT INTO detalle_factura (id_factura, id_producto, pxf_cantidad, estado_pro_fac)
               VALUES ($1, (SELECT id_producto FROM producto WHERE pro_nombre = $2 LIMIT 1), 1, 'ACT');`,
              [id_factura, prod.name]
          );
      }

      await client.query('COMMIT');
      res.json({ success: true, message: 'Factura generada exitosamente' });
  } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al generar la factura:', error);
      res.status(500).json({ success: false, message: 'Error en el servidor' });
  } finally {
      client.release();
  }
});

//busqueda
app.get('/api/facturas', async (req, res) => {
  const { cliente, fechaInicio, fechaFin } = req.query;
  let query = `SELECT * FROM factura WHERE 1=1`;
  let values = [];

  if (cliente) {
      query += ` AND cli_cedula = $1`;
      values.push(cliente);
  }
  if (fechaInicio) {
      query += ` AND fac_fecha >= $${values.length + 1}`;
      values.push(fechaInicio);
  }
  if (fechaFin) {
      query += ` AND fac_fecha <= $${values.length + 1}`;
      values.push(fechaFin);
  }

  try {
      const result = await pool.query(query, values);
      res.json(result.rows);
  } catch (error) {
      console.error('Error obteniendo facturas:', error);
      res.status(500).json({ success: false, message: 'Error al obtener facturas' });
  }
});

//anular factura
app.put('/api/facturas/anular/:idFactura', async (req, res) => {
  const { idFactura } = req.params;
  const client = await pool.connect();

  try {
      await client.query('BEGIN');

      // Actualizar estado de la factura
      await client.query("UPDATE factura SET estado_fac = 'ANU' WHERE id_factura = $1", [idFactura]);

      // Actualizar estado de los detalles de la factura
      await client.query("UPDATE detalle_factura SET estado_pro_fac = 'ANU' WHERE id_factura = $1", [idFactura]);

      // Restaurar stock de productos
      const detalleProductos = await client.query("SELECT id_producto, pxf_cantidad FROM detalle_factura WHERE id_factura = $1", [idFactura]);

      for (let row of detalleProductos.rows) {
          await client.query("UPDATE producto SET pro_stock = pro_stock + $1 WHERE id_producto = $2", [row.pxf_cantidad, row.id_producto]);
      }

      await client.query('COMMIT');
      res.json({ success: true, message: 'Factura anulada y stock restaurado' });
  } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al anular factura:', error);
      res.status(500).json({ success: false, message: 'Error al anular factura' });
  } finally {
      client.release();
  }
});

//CRUD CLIENTES

// Obtener clientes con filtros
app.get('/api/clientes', async (req, res) => {
  const { codigo, nombre, artista, fecha } = req.query;
  let query = `SELECT * FROM cliente WHERE 1=1`;
  let values = [];

  if (codigo) {
      query += ` AND cli_cedula = $${values.length + 1}`;
      values.push(codigo);
  }
  if (nombre) {
      query += ` AND cli_nombre ILIKE $${values.length + 1}`;
      values.push(`%${nombre}%`);
  }
  if (artista) {
      query += ` AND cli_intereses ILIKE $${values.length + 1}`;
      values.push(`%${artista}%`);
  }
  if (fecha) {
      query += ` AND cli_fecha_nacimiento = $${values.length + 1}`;
      values.push(fecha);
  }

  try {
      const result = await pool.query(query, values);
      res.json(result.rows);
  } catch (error) {
      console.error('Error obteniendo clientes:', error);
      res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Agregar un nuevo cliente
app.post('/api/clientes', async (req, res) => {
  const { cli_cedula, cli_nombre, cli_apellido, cli_mail, cli_telefono, cli_direccion, cli_fecha_nacimiento, cli_intereses, usuario } = req.body;
  
  try {
      await pool.query(`INSERT INTO cliente (cli_cedula, cli_nombre, cli_apellido, cli_mail, cli_telefono, cli_direccion, cli_fecha_nacimiento, cli_intereses, usuario) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, 
      [cli_cedula, cli_nombre, cli_apellido, cli_mail, cli_telefono, cli_direccion, cli_fecha_nacimiento, cli_intereses, usuario]);
      res.json({ success: true, message: 'Cliente agregado exitosamente' });
  } catch (error) {
      console.error('Error agregando cliente:', error);
      res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

/*-------------------------------------
FIN CRUD ADMIN
-------------------------------------*/

/*-------------------------------------
PARTE PAGINA WEB
-------------------------------------*/

// Ruta para registrar un usuario y su información en clientes
app.post("/api/register", async (req, res) => {
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

  // Validación de campos
  if (
    !nombre ||
    !apellido ||
    !cedula ||
    !username ||
    !email ||
    !telefono ||
    !direccion ||
    !fecha_nacimiento ||
    !intereses ||
    !password
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Todos los campos son obligatorios" });
  }

  const client = await pool.connect(); // Iniciar transacción
  try {
    await client.query("BEGIN");

    // Insertar en la tabla usuarios
    const insertUserQuery = `
            INSERT INTO usuario (usuario, contrasena, tipo, us_estado)
            VALUES ($1, $2, 'CLI', 'ACT')  -- Asignamos 'ACT' por defecto al estado
            RETURNING usuario;
        `;
    await client.query(insertUserQuery, [username, password]);

    // Insertar en la tabla clientes con la FK usuario
    const insertClientQuery = `
            INSERT INTO cliente (cli_cedula, cli_nombre, cli_apellido, cli_mail, cli_telefono, cli_direccion, cli_fecha_nacimiento, cli_intereses, usuario)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        `;
    await client.query(insertClientQuery, [
      cedula,
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      fecha_nacimiento,
      intereses,
      username,
    ]);

    await client.query("COMMIT"); // Confirmar transacción

    res
      .status(201)
      .json({
        success: true,
        message: "Usuario y cliente registrados con éxito",
      });
  } catch (error) {
    await client.query("ROLLBACK"); // Revertir en caso de error
    console.error("Error al registrar usuario y cliente:", error);
    res
      .status(500)
      .json({ success: false, message: "Error en el servidor: " + error });
  } finally {
    client.release();
  }
});

// Ruta para manejar el inicio de sesión
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Por favor, ingresa nombre de usuario y contraseña.",
      });
  }

  const client = await pool.connect(); // Iniciar transacción
  try {
    const checkUserQuery = `
            SELECT * FROM usuario WHERE usuario = $1;
        `;
    const result = await client.query(checkUserQuery, [username]);

    if (result.rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "El usuario no existe." });
    }

    const user = result.rows[0];

    // Comparar la contraseña con la almacenada en la base de datos
    if (user.contrasena !== password) {
      return res
        .status(400)
        .json({ success: false, message: "Contraseña incorrecta." });
    }

    // Si el usuario y la contraseña son correctos
    res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      username: user.usuario, // Puedes devolver más datos si lo deseas
    });
  } catch (error) {
    console.error("Error al intentar iniciar sesión:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  } finally {
    client.release();
  }
});

/*-------------------------------------
FIN PAGINA WEB
-------------------------------------*/

// Iniciar el servidor
app.listen(PORT, host, () => {
  console.log(`Servidor corriendo en http://${host}:${PORT}`);
});
