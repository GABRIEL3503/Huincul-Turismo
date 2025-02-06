const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

const app = express();
const port = 3026;

// Crear directorios para almacenamiento si no existen
['uploads', 'uploads/images', 'uploads/pdfs'].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuración de sesión
app.use(session({
  secret: 'tu_clave_secreta',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,  // ⚠ Cambiar a true solo si usas HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 día de sesión activa
  }
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(express.static('public'));
app.use('/uploads', express.static('uploads')); // Servir archivos subidos

// Configuración de SQLite
const db = new sqlite3.Database('database.sqlite');

// Inicializar la base de datos
db.run(`
  CREATE TABLE IF NOT EXISTS destinos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT,
    fecha TEXT,
    imagen_url TEXT,
    pdf_url TEXT,
    frase_corta TEXT,
    estadia TEXT,
    transporte TEXT,
    alojamiento TEXT,
    regimen_comidas TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = file.fieldname === 'imagen' ? 'uploads/images' : 'uploads/pdfs';
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Máximo 5MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'pdf' && file.mimetype !== 'application/pdf') {
      return cb(new Error('Solo se permiten archivos PDF'));
    }
    if (file.fieldname === 'imagen' && !file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten imágenes'));
    }
    cb(null, true);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'pdf') {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Solo se permiten archivos PDF'), false);
      return;
    }
    if (parseInt(req.headers['content-length']) > 5 * 1024 * 1024) {
      cb(new Error('El PDF no debe superar los 5MB'), false);
      return;
    }
  } else if (file.fieldname === 'imagen') {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Solo se permiten imágenes'), false);
      return;
    }
    if (parseInt(req.headers['content-length']) > 2 * 1024 * 1024) {
      cb(new Error('La imagen no debe superar los 2MB'), false);
      return;
    }
  }
  cb(null, true);
};


// Función para procesar imagen
async function processImage(imagePath) {
  const outputPath = imagePath;
  await sharp(imagePath)
    .resize(800, 600, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality: 80 })
    .toFile(outputPath + '_temp');
  
  fs.unlinkSync(imagePath);
  fs.renameSync(outputPath + '_temp', outputPath);
}

// Función para comprimir PDF
async function compressPDF(inputPath) {
  try {
    const pdfBytes = await fs.promises.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      updateMetadata: false,
      compress: true
    });

    await fs.promises.writeFile(inputPath, compressedBytes);
    return true;
  } catch (error) {
    console.error('Error al comprimir PDF:', error);
    return false;
  }
}

// Middleware de autenticación
const requireAuth = (req, res, next) => {
  console.log('Estado de la sesión:', req.session);
  if (req.session.isAuthenticated) {
      next();
  } else {
      res.status(401).json({ error: 'No autorizado' });
  }
};


// Rutas CRUD

// Login
app.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === 'tu_contraseña') { // Cambiar por tu contraseña deseada
    req.session.isAuthenticated = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

// Obtener todos los destinos
// Modificar la ruta GET /api/destinos
app.get('/api/destinos', (req, res) => {
  db.all('SELECT * FROM destinos ORDER BY created_at DESC', [], (err, rows) => {
      if (err) {
          res.status(500).json({ error: err.message });
          return;
      }
      // Asegurarse de que las URLs sean correctas
      const destinosConURLsCorrectas = rows.map(destino => ({
          ...destino,
          imagen_url: destino.imagen_url.startsWith('/') ? destino.imagen_url : '/' + destino.imagen_url,
          pdf_url: destino.pdf_url?.startsWith('/') ? destino.pdf_url : '/' + destino.pdf_url
      }));
      res.json(destinosConURLsCorrectas);
  });
});

app.post('/api/destinos', upload.fields([
  { name: 'imagen', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('📥 Recibiendo datos...');
    console.log('🔹 Datos recibidos:', req.body);
    console.log('🖼 Archivos recibidos:', req.files);

    const { titulo, fecha, frase_corta, estadia, transporte, alojamiento, regimen_comidas } = req.body;

    let imagen_url = null;
    if (req.files && req.files['imagen']) {
      console.log('✅ Imagen detectada...');
      const imagePath = req.files['imagen'][0].path;
      imagen_url = '/uploads/images/' + path.basename(imagePath);
    }

    let pdf_url = null;
    if (req.files && req.files['pdf']) {
      console.log('✅ PDF detectado...');
      const pdfPath = req.files['pdf'][0].path;
      // await compressPDF(pdfPath);  // ⚠️ Posible punto de fallo
      pdf_url = '/uploads/pdfs/' + path.basename(pdfPath);
    }

    console.log('📝 Preparando para insertar en la base de datos...');
    console.log(`📌 Título: ${titulo}, Fecha: ${fecha}, Imagen: ${imagen_url}, PDF: ${pdf_url}`);

    const sql = `
      INSERT INTO destinos (titulo, fecha, imagen_url, pdf_url, frase_corta, estadia, transporte, alojamiento, regimen_comidas)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      titulo, fecha, imagen_url, pdf_url, frase_corta, estadia, transporte, alojamiento, regimen_comidas
    ], function(err) {
      if (err) {
        console.error('❌ Error en la base de datos:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log('✅ Registro insertado correctamente con ID:', this.lastID);
      res.json({ id: this.lastID, success: true });
    });

  } catch (error) {
    console.error('❌ Error general en POST /api/destinos:', error);
    res.status(500).json({ error: error.message });
  }
});


// Actualizar destino
app.put('/api/destinos/:id', requireAuth, upload.fields([
  { name: 'imagen', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, fecha, frase_corta, estadia, transporte, alojamiento, regimen_comidas } = req.body;
    
    db.get('SELECT imagen_url, pdf_url FROM destinos WHERE id = ?', [id], async (err, destino) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      let imagen_url = destino.imagen_url;
      let pdf_url = destino.pdf_url;

      if (req.files['imagen']) {
        if (imagen_url) {
          const oldImagePath = path.join(__dirname, 'public', imagen_url);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        
        const imagePath = req.files['imagen'][0].path;
        await processImage(imagePath);
        imagen_url = '/uploads/images/' + path.basename(imagePath);
      }

      if (req.files['pdf']) {
        if (pdf_url) {
          const oldPdfPath = path.join(__dirname, 'public', pdf_url);
          if (fs.existsSync(oldPdfPath)) {
            fs.unlinkSync(oldPdfPath);
          }
        }
        
        const pdfPath = req.files['pdf'][0].path;
        await compressPDF(pdfPath);
        pdf_url = '/uploads/pdfs/' + path.basename(pdfPath);
      }

      const sql = `
        UPDATE destinos 
        SET titulo = ?, fecha = ?, imagen_url = ?, pdf_url = ?, 
            frase_corta = ?, estadia = ?, transporte = ?, 
            alojamiento = ?, regimen_comidas = ?
        WHERE id = ?
      `;
      
      db.run(sql, [
        titulo, fecha, imagen_url, pdf_url, frase_corta, 
        estadia, transporte, alojamiento, regimen_comidas, id
      ], (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ success: true });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar destino
app.delete('/api/destinos/:id', requireAuth, (req, res) => {
  const { id } = req.params;

  db.get('SELECT imagen_url, pdf_url FROM destinos WHERE id = ?', [id], (err, destino) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (destino.imagen_url) {
      const imagePath = path.join(__dirname, 'public', destino.imagen_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    if (destino.pdf_url) {
      const pdfPath = path.join(__dirname, 'public', destino.pdf_url);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    db.run('DELETE FROM destinos WHERE id = ?', [id], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    });
  });
});

// Agregar esta ruta en server.js junto con las otras rutas API
app.get('/api/destinos/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM destinos WHERE id = ?', [id], (err, destino) => {
      if (err) {
          res.status(500).json({ error: err.message });
          return;
      }
      
      if (!destino) {
          res.status(404).json({ error: 'Destino no encontrado' });
          return;
      }

      // Asegurarse de que las URLs sean correctas
      destino.imagen_url = destino.imagen_url?.startsWith('/') ? destino.imagen_url : '/' + destino.imagen_url;
      destino.pdf_url = destino.pdf_url?.startsWith('/') ? destino.pdf_url : '/' + destino.pdf_url;
      
      res.json(destino);
  });
});
app.get('/api/check-auth', (req, res) => {
  res.json({ authenticated: !!req.session.isAuthenticated });
});


app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});