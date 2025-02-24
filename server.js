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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
  limits: { fileSize: 50 * 1024 * 1024 }, // Aumentamos el límite a 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf' && !file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten archivos PDF e imágenes'));
    }
    cb(null, true);
  }
});



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

    let imagen_url = req.files?.imagen ? '/uploads/images/' + path.basename(req.files['imagen'][0].path) : '';
    let pdf_url = req.files?.pdf ? '/uploads/pdfs/' + path.basename(req.files['pdf'][0].path) : ''; 

    console.log('📝 Preparando para insertar en la base de datos...');
    console.log('📌 Título:', titulo, 'Fecha:', fecha, 'Imagen:', imagen_url, 'PDF:', pdf_url);

    const sql = `
      INSERT INTO destinos (titulo, fecha, imagen_url, pdf_url, frase_corta, estadia, transporte, alojamiento, regimen_comidas)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    console.log('📝 Ejecutando consulta SQL...');
    console.log('🔹 Valores:', [
      titulo, fecha, imagen_url || '', pdf_url || '', frase_corta || '', 
      estadia || '', transporte || '', alojamiento || '', regimen_comidas || ''
    ]);
    
    db.run(sql, [
      titulo, fecha, imagen_url || '', pdf_url || '', frase_corta || '', 
      estadia || '', transporte || '', alojamiento || '', regimen_comidas || ''
    ], function(err) {
      if (err) {
        console.error('❌ Error en la base de datos:', err.message);
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

    // Obtener información actual del destino
    db.get('SELECT pdf_url FROM destinos WHERE id = ?', [id], async (err, destino) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener el destino' });
      }

      if (!destino) {
        return res.status(404).json({ error: 'Destino no encontrado' });
      }

      let pdf_url = destino.pdf_url;

      // Si se sube un nuevo PDF, eliminar el anterior
      if (req.files['pdf']) {
        if (pdf_url) {
          const oldPdfPath = path.join(__dirname, pdf_url);
          if (fs.existsSync(oldPdfPath)) {
            fs.unlink(oldPdfPath, (err) => {
              if (err) console.error('⚠️ Error al eliminar el PDF anterior:', err);
              else console.log('🗑 PDF anterior eliminado:', oldPdfPath);
            });
          }
        }

        const newPdfPath = req.files['pdf'][0].path;
        pdf_url = '/uploads/pdfs/' + path.basename(newPdfPath);
      }

      // Actualizar la base de datos con los nuevos valores
      const sql = `
        UPDATE destinos 
        SET titulo = ?, fecha = ?, pdf_url = ?, frase_corta = ?, 
            estadia = ?, transporte = ?, alojamiento = ?, regimen_comidas = ?
        WHERE id = ?
      `;

      db.run(sql, [
        titulo, fecha, pdf_url, frase_corta, 
        estadia, transporte, alojamiento, regimen_comidas, id
      ], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error al actualizar el destino' });
        }
        res.json({ success: true, message: 'Destino actualizado correctamente' });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.delete('/api/destinos/:id', requireAuth, (req, res) => {
  const { id } = req.params;

  // Buscar los archivos asociados antes de eliminar
  db.get('SELECT pdf_url FROM destinos WHERE id = ?', [id], (err, destino) => {
    if (err) {
      return res.status(500).json({ error: 'Error al consultar la base de datos' });
    }

    if (!destino) {
      return res.status(404).json({ error: 'Destino no encontrado' });
    }

    // Obtener ruta absoluta del PDF
    const pdfPath = destino.pdf_url ? path.join(__dirname, destino.pdf_url) : null;

    // Eliminar el PDF si existe
    if (pdfPath && fs.existsSync(pdfPath)) {
      fs.unlink(pdfPath, (err) => {
        if (err) console.error('⚠️ Error al eliminar el PDF:', err);
        else console.log('🗑 PDF eliminado:', pdfPath);
      });
    }

    // Finalmente, eliminar el destino de la base de datos
    db.run('DELETE FROM destinos WHERE id = ?', [id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al eliminar el destino de la base de datos' });
      }
      res.json({ success: true, message: 'Destino eliminado correctamente junto con su PDF' });
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