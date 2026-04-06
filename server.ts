import express from 'express';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

// Setup Data Directory
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const adminsFile = path.join(dataDir, 'admins.json');

// Initialize Admins
const initAdmins = async () => {
  if (!fs.existsSync(adminsFile)) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const initialAdmins = [{ email: adminEmail, password: hashedPassword }];
    fs.writeFileSync(adminsFile, JSON.stringify(initialAdmins, null, 2));
    console.log('Initialized admins.json with default admin.');
  }
};
initAdmins();

const getAdmins = () => {
  if (!fs.existsSync(adminsFile)) return [];
  return JSON.parse(fs.readFileSync(adminsFile, 'utf-8'));
};

const saveAdmins = (admins: any[]) => {
  fs.writeFileSync(adminsFile, JSON.stringify(admins, null, 2));
};

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

// Auth Middleware
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log('Authenticate middleware reached for', req.path);
  const token = req.cookies.token;
  if (!token) {
    console.log('No token found');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    console.log('Token verified');
    next();
  } catch (err) {
    console.log('Token verification failed');
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth Endpoints
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const admins = getAdmins();
  const admin = admins.find((a: any) => a.email === email);
  
  if (!admin) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ email: admin.email }, JWT_SECRET, { expiresIn: '1d' });
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  res.json({ message: 'Logged in successfully', email: admin.email });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/check-auth', authenticate, (req, res) => {
  console.log('GET /api/check-auth reached');
  res.json({ authenticated: true, user: (req as any).user });
});

app.get('/api/admins', authenticate, (req, res) => {
  const admins = getAdmins();
  res.json(admins.map((a: any) => ({ email: a.email })));
});

app.post('/api/admins/add', authenticate, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  
  const admins = getAdmins();
  if (admins.find((a: any) => a.email === email)) {
    return res.status(400).json({ error: 'Admin already exists' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  admins.push({ email, password: hashedPassword });
  saveAdmins(admins);
  
  res.json({ message: 'Admin added successfully' });
});

app.post('/api/admins/remove', authenticate, (req, res) => {
  const { email } = req.body;
  const currentUserEmail = (req as any).user.email;
  
  if (email === currentUserEmail) {
    return res.status(400).json({ error: 'Cannot remove yourself' });
  }
  
  let admins = getAdmins();
  const initialLength = admins.length;
  admins = admins.filter((a: any) => a.email !== email);
  
  if (admins.length === initialLength) {
    return res.status(404).json({ error: 'Admin not found' });
  }
  
  saveAdmins(admins);
  res.json({ message: 'Admin removed successfully' });
});

// Cloudinary Setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ dest: 'uploads/' });

app.post('/api/upload', authenticate, upload.array('files', 20), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadPromises = files.map(file => {
      return cloudinary.uploader.upload(file.path, {
        folder: 'gallery'
      }).finally(() => {
        // Clean up local file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    });

    const results = await Promise.all(uploadPromises);
    res.json({ message: 'Upload successful', results });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/gallery', async (req, res) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary credentials missing');
    }
    
    const result = await cloudinary.search
      .expression('folder:gallery')
      .sort_by('created_at', 'desc')
      .max_results(30)
      .execute();
      
    res.json(result.resources);
  } catch (error) {
    console.error('Gallery fetch error:', error);
    // Graceful fallback
    res.json([
      { secure_url: 'https://picsum.photos/seed/gallery1/800/600', public_id: 'mock1' },
      { secure_url: 'https://picsum.photos/seed/gallery2/800/600', public_id: 'mock2' },
      { secure_url: 'https://picsum.photos/seed/gallery3/800/600', public_id: 'mock3' },
      { secure_url: 'https://picsum.photos/seed/gallery4/800/600', public_id: 'mock4' }
    ]);
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
