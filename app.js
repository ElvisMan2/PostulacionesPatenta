const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');

const app = express();

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

// Endpoint para subir archivos
app.post('/submit', upload.fields([
    { name: 'ficha_postulante', maxCount: 1 },
    { name: 'ficha_invencion', maxCount: 1 },
    { name: 'acta_compromiso', maxCount: 1 }
]), (req, res) => {
    const { tipo_participante, nombre_institucion, titulo_invencion, sector_tecnologico, apellidos_representante, nombres_representante, dni_representante, correo_electronico, region } = req.body;
    const ficha_postulante = req.files['ficha_postulante'] ? req.files['ficha_postulante'][0].path : null;
    const ficha_invencion = req.files['ficha_invencion'] ? req.files['ficha_invencion'][0].path : null;
    const acta_compromiso = req.files['acta_compromiso'] ? req.files['acta_compromiso'][0].path : null;

    const query = 'INSERT INTO postulaciones (tipo_participante, nombre_institucion, titulo_invencion, sector_tecnologico, apellidos_representante, nombres_representante, dni_representante, correo_electronico, region, ficha_postulante, ficha_invencion, acta_compromiso) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(query, [tipo_participante, nombre_institucion, titulo_invencion, sector_tecnologico, apellidos_representante, nombres_representante, dni_representante, correo_electronico, region, ficha_postulante, ficha_invencion, acta_compromiso], (err, result) => {
        if (err) throw err;
        res.send('Datos guardados exitosamente');
    });
});

app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});
