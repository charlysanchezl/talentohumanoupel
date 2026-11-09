const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { requireRole } = require('../middlewares/auth');

const uploadsTempDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsTempDir)) {
  fs.mkdirSync(uploadsTempDir, { recursive: true });
}

const publicDir = path.join(__dirname, '../../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const upload = multer({ 
  dest: uploadsTempDir,
  limits: { fileSize: 100 * 1024 * 1024 } // Soporte hasta 100 MB para reels y videos
});

// --- CONFIGURACIÓN DE FONDO DE PANTALLA DEL LOGIN ---
const LOGIN_BG_CONFIG_PATH = path.join(__dirname, '../login_bg_config.json');

function getLoginBgConfig() {
  try {
    if (fs.existsSync(LOGIN_BG_CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(LOGIN_BG_CONFIG_PATH, 'utf8'));
    }
  } catch (e) {}
  return { bgUrl: '/universidad.jpeg', opacity: 0.55, isDefault: true };
}

router.get('/config/login-bg', (req, res) => {
  res.json({ success: true, config: getLoginBgConfig() });
});

router.post('/config/login-bg', requireRole('ADMIN'), upload.single('image'), async (req, res) => {
  try {
    const opacity = req.body.opacity !== undefined ? Number(req.body.opacity) : 0.55;
    let bgUrl = null;

    if (req.file) {
      const ext = path.extname(req.file.originalname) || '.jpg';
      const targetFileName = `custom_login_bg${ext}`;
      const publicPath = path.join(__dirname, '../../public', targetFileName);
      const uploadsPath = path.join(__dirname, '../uploads', targetFileName);
      
      fs.copyFileSync(req.file.path, publicPath);
      try { fs.copyFileSync(req.file.path, uploadsPath); } catch (e) {}
      fs.unlinkSync(req.file.path);

      bgUrl = `/${targetFileName}?t=${Date.now()}`;
    } else if (req.body.imageBase64) {
      const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const publicPath = path.join(__dirname, '../../public/custom_login_bg.jpg');
      fs.writeFileSync(publicPath, Buffer.from(base64Data, 'base64'));
      bgUrl = `/custom_login_bg.jpg?t=${Date.now()}`;
    } else if (req.body.opacity !== undefined) {
      const current = getLoginBgConfig();
      bgUrl = current.bgUrl;
    }

    const newConfig = {
      bgUrl: bgUrl || '/universidad.jpeg',
      opacity: isNaN(opacity) ? 0.55 : opacity,
      isDefault: !bgUrl || bgUrl.includes('/universidad.jpeg'),
      updatedAt: Date.now()
    };

    fs.writeFileSync(LOGIN_BG_CONFIG_PATH, JSON.stringify(newConfig, null, 2));
    res.json({ success: true, config: newConfig });
  } catch (error) {
    console.error('Error guardando fondo de login:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/config/login-bg/reset', requireRole('ADMIN'), (req, res) => {
  try {
    const defaultConfig = { bgUrl: '/universidad.jpeg', opacity: 0.55, isDefault: true, updatedAt: Date.now() };
    fs.writeFileSync(LOGIN_BG_CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
    
    try {
      const customPath = path.join(__dirname, '../../public/custom_login_bg.jpg');
      if (fs.existsSync(customPath)) fs.unlinkSync(customPath);
    } catch (e) {}

    res.json({ success: true, config: defaultConfig });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- CONFIGURACIÓN DE FLYER / REEL INSTITUCIONAL (POPUP) ---
const FLYER_CONFIG_PATH = path.join(__dirname, '../flyer_config.json');
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.ogg', '.m4v'];

function isVideoFile(fileName) {
  if (!fileName) return false;
  const ext = path.extname(fileName.split('?')[0]).toLowerCase();
  return VIDEO_EXTENSIONS.includes(ext);
}

function getFlyerConfig() {
  try {
    if (fs.existsSync(FLYER_CONFIG_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(FLYER_CONFIG_PATH, 'utf8'));
      if (!parsed.mediaType) {
        parsed.mediaType = isVideoFile(parsed.imageUrl) ? 'video' : 'image';
      }
      return parsed;
    }
  } catch (e) {}
  return {
    imageUrl: '/dia_secretaria_upel.jpg',
    mediaType: 'image',
    title: 'Feliz Día de la Secretaria',
    subtitle: 'Instituto Pedagógico Rural "Gervasio Rubio" · UPEL',
    enabled: true,
    autoOpen: true,
    isDefault: true,
    updatedAt: Date.now()
  };
}

router.get('/config/flyer', (req, res) => {
  res.json({ success: true, config: getFlyerConfig() });
});

router.post('/config/flyer', requireRole(['ADMIN', 'AUDITOR', 'DOCENCIA']), upload.single('image'), async (req, res) => {
  try {
    const current = getFlyerConfig();
    let imageUrl = current.imageUrl;
    let isDefault = current.isDefault;
    let mediaType = current.mediaType || (isVideoFile(imageUrl) ? 'video' : 'image');

    if (req.file) {
      const ext = path.extname(req.file.originalname) || '.jpg';
      const targetFileName = `custom_flyer_${Date.now()}${ext}`;
      const publicPath = path.join(__dirname, '../../public', targetFileName);
      const uploadsPath = path.join(__dirname, '../uploads', targetFileName);
      
      fs.copyFileSync(req.file.path, publicPath);
      try { fs.copyFileSync(req.file.path, uploadsPath); } catch (e) {}
      fs.unlinkSync(req.file.path);

      imageUrl = `/${targetFileName}`;
      isDefault = false;
      mediaType = isVideoFile(targetFileName) ? 'video' : 'image';
    } else if (req.body.imageBase64) {
      const base64Data = req.body.imageBase64.replace(/^data:\w+\/\w+;base64,/, '');
      const targetFileName = `custom_flyer_${Date.now()}.jpg`;
      const publicPath = path.join(__dirname, '../../public', targetFileName);
      fs.writeFileSync(publicPath, Buffer.from(base64Data, 'base64'));
      imageUrl = `/${targetFileName}`;
      isDefault = false;
      mediaType = 'image';
    }

    if (req.body.mediaType) {
      mediaType = req.body.mediaType;
    }

    const title = req.body.title !== undefined ? req.body.title : current.title;
    const subtitle = req.body.subtitle !== undefined ? req.body.subtitle : current.subtitle;
    const enabled = req.body.enabled !== undefined ? (req.body.enabled === 'true' || req.body.enabled === true) : current.enabled;
    const autoOpen = req.body.autoOpen !== undefined ? (req.body.autoOpen === 'true' || req.body.autoOpen === true) : current.autoOpen;

    const newConfig = {
      imageUrl: imageUrl || '/dia_secretaria_upel.jpg',
      mediaType: mediaType || (isVideoFile(imageUrl) ? 'video' : 'image'),
      title: title || 'Feliz Día de la Secretaria',
      subtitle: subtitle || 'Instituto Pedagógico Rural "Gervasio Rubio" · UPEL',
      enabled: enabled !== undefined ? enabled : true,
      autoOpen: autoOpen !== undefined ? autoOpen : true,
      isDefault: isDefault,
      updatedAt: Date.now()
    };

    fs.writeFileSync(FLYER_CONFIG_PATH, JSON.stringify(newConfig, null, 2));
    res.json({ success: true, config: newConfig });
  } catch (error) {
    console.error('Error guardando flyer institucional:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/config/flyer/reset', requireRole(['ADMIN', 'AUDITOR', 'DOCENCIA']), (req, res) => {
  try {
    const defaultConfig = {
      imageUrl: '/dia_secretaria_upel.jpg',
      mediaType: 'image',
      title: 'Feliz Día de la Secretaria',
      subtitle: 'Instituto Pedagógico Rural "Gervasio Rubio" · UPEL',
      enabled: true,
      autoOpen: true,
      isDefault: true,
      updatedAt: Date.now()
    };
    fs.writeFileSync(FLYER_CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
    res.json({ success: true, config: defaultConfig });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
