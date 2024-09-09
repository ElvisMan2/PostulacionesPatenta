const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');  // Para redirigir de HTTP a HTTPS

const app = express();

const jwt = require('jsonwebtoken');

// Clave secreta para JWT
const secretKey = '6LdUDjMqAAAAABBnVq8EKW_2tv_xCM4mvrDmxhRV';  // Reemplaza con tu clave secreta de reCAPTCHA

// Cargar los certificados SSL
const privateKey = fs.readFileSync('/etc/letsencrypt/live/programapatenta.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/programapatenta.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/programapatenta.com/chain.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};

// Redirigir todo el tráfico HTTP a HTTPS
http.createServer((req, res) => {
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
}).listen(80);

// Crear servidor HTTPS
const httpsServer = https.createServer(credentials, app);

// Servir la aplicación en HTTPS (puerto 443)
httpsServer.listen(443, () => {
  console.log('Servidor HTTPS corriendo en el puerto 443');
});


// Middleware para verificar el token JWT
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ success: false, message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];  // Extraer el token sin el prefijo 'Bearer'

    jwt.verify(token, secretKey, (err, decoded) => {//VERIFICACIÓN DE JWT
        if (err) {
            return res.status(401).json({ success: false, message: 'Token inválido' });
        }
        req.userId = decoded.id;  // Guardar el id del usuario decodificado
        next();
    });
}

app.use(express.json());

// Configuración de multer para manejar la carga de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12348765',
    database: 'programa_patenta'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Conectado a la base de datos');
});

// Configurar el middleware para servir archivos estáticos
app.use(express.static('public'));

// Endpoint protegido para obtener los datos de la tabla postulaciones
app.get('/postulaciones', verifyToken, (req, res) => {
    const query = 'SELECT * FROM postulaciones';

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error al obtener los datos' });
        }
        res.json({ success: true, data: results });
    });
});

//endpoint para login
app.post('/login', (req, res) => {
    const { usuario, contrasena } = req.body;
    const query = 'SELECT * FROM usuarios WHERE usuario = ?';

    db.query(query, [usuario], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            const user = result[0];
            if (user.contrasena === contrasena) { // Generar el JWT usando la misma clave secreta
                const token = jwt.sign({ id: user.id, usuario: user.usuario }, secretKey, {//JWT
                    expiresIn: '1h',  // Token válido por 1 hora
                });
                return res.json({ success: true, token });
            } else {
                return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
            }
        } else {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
    });
});

// Endpoint para registro
app.post('/registro', (req, res) => {
    console.log('Datos recibidos:', req.body);
    const { usuario, contrasena, nombre_completo, email } = req.body;
    
    const query = 'INSERT INTO usuarios (usuario, contrasena, nombre_completo, email) VALUES (?, ?, ?, ?)';

    db.query(query, [usuario, contrasena, nombre_completo, email], (err, result) => {
        if (err) {
            console.error('Error en la consulta:', err);  // Log del error en el servidor
            return res.status(500).json({ success: false, message: 'Error en el servidor' });  // Enviar un JSON en caso de error
        }
        res.json({ success: true });
    });
});

// Endpoint para subir archivos
app.post('/submit', upload.fields([
    { name: 'ficha_postulante', maxCount: 1 },
    { name: 'ficha_invencion', maxCount: 1 },
    { name: 'acta_compromiso', maxCount: 1 }
]), (req, res) => {
    const { tipo_participante, nombre_institucion, titulo_invencion, sector_tecnologico, apellidos_representante, nombres_representante, dni_representante, correo_electronico, region, recaptcha_token } = req.body;

    const ficha_postulante = req.files['ficha_postulante'] ? req.files['ficha_postulante'][0].path : null;
    const ficha_invencion = req.files['ficha_invencion'] ? req.files['ficha_invencion'][0].path : null;
    const acta_compromiso = req.files['acta_compromiso'] ? req.files['acta_compromiso'][0].path : null;

    const query = 'INSERT INTO postulaciones (tipo_participante, nombre_institucion, titulo_invencion, sector_tecnologico, apellidos_representante, nombres_representante, dni_representante, correo_electronico, region, ficha_postulante, ficha_invencion, acta_compromiso, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())';

    db.query(query, [tipo_participante, nombre_institucion, titulo_invencion, sector_tecnologico, apellidos_representante, nombres_representante, dni_representante, correo_electronico, region, ficha_postulante, ficha_invencion, acta_compromiso], (err, result) => {
        if (err) throw err;
        res.json({ success: true, message: 'Postulación ingresada' });
    });
});

// Endpoint para obtener un archivo
app.get('/uploads/:file', (req, res) => {
    const file = req.params.file;
    res.sendFile(path.join(__dirname, 'uploads', file));
});