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

import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;

// Request logging
app.use((req, res, next) => {
  if (!req.path.startsWith('/@vite') && !req.path.startsWith('/src')) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  }
  next();
});

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());

const apiRouter = express.Router();

// Mount API router
app.use('/api', apiRouter);

// API Catch-all (to prevent SPA fallback for missing API routes)
app.all('/api/*', (req, res) => {
  console.log(`404 API Route Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'API route not found', 
    path: req.path, 
    method: req.method 
  });
});

// Setup Data and Upload Directories
const dataDir = path.join(__dirname, 'data');
const uploadDir = path.join(os.tmpdir(), 'lit-lounge-uploads');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
// Ensure data directory is writable
try {
  fs.accessSync(dataDir, fs.constants.W_OK);
  console.log('Data directory is writable');
} catch (err) {
  console.error('Data directory is NOT writable:', err);
}

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Ensure upload directory is writable
try {
  fs.accessSync(uploadDir, fs.constants.W_OK);
  console.log('Upload directory is writable');
} catch (err) {
  console.error('Upload directory is NOT writable:', err);
}

const adminsFile = path.join(dataDir, 'admins.json');

const getAdmins = () => {
  try {
    if (!fs.existsSync(adminsFile)) return [];
    const content = fs.readFileSync(adminsFile, 'utf-8');
    if (!content.trim()) return [];
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading admins file:', err);
    return [];
  }
};

const saveAdmins = (admins: any[]) => {
  try {
    fs.writeFileSync(adminsFile, JSON.stringify(admins, null, 2));
  } catch (err) {
    console.error('Error saving admins file:', err);
  }
};

// Initialize Admins
const initAdmins = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
    
    let admins = getAdmins();
    
    // Check if the environment-specified admin already exists
    const existingAdmin = admins.find((a: any) => a.email === adminEmail);
    
    if (!existingAdmin) {
      console.log(`Adding environment-specified admin: ${adminEmail}`);
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      admins.push({ email: adminEmail, password: hashedPassword });
      saveAdmins(admins);
      console.log('Admin initialized/updated in admins.json');
    } else {
      console.log(`Environment-specified admin ${adminEmail} already exists in admins.json`);
    }
  } catch (err) {
    console.error('Failed to initialize admins:', err);
  }
};
initAdmins();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

// Auth Middleware
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log('Authenticate middleware reached for', req.path);
  const token = req.cookies.token;
  if (!token) {
    console.log('No token found in cookies. Available cookies:', Object.keys(req.cookies));
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

apiRouter.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    env: process.env.NODE_ENV,
    cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
    admin: !!process.env.ADMIN_EMAIL
  });
});

// Auth Endpoints
apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email} at ${new Date().toISOString()}`);
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const admins = getAdmins();
    const admin = admins.find((a: any) => a.email === email);
    
    if (!admin) {
      console.log(`Login failed: Admin not found for ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log(`Login failed: Password mismatch for ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ email: admin.email }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: true, 
      sameSite: 'none', 
      maxAge: 24 * 60 * 60 * 1000 
    });
    console.log(`Login successful for: ${email}`);
    res.json({ message: 'Logged in successfully', email: admin.email });
  } catch (error: any) {
    console.error('Login route error:', error);
    res.status(500).json({ error: 'Internal server error during login', details: error.message });
  }
});

// Explicitly handle GET /api/auth/login to provide a helpful error
apiRouter.get('/auth/login', (req, res) => {
  res.status(405).json({ error: 'Method Not Allowed. Please use POST for login.' });
});

apiRouter.post('/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

apiRouter.get('/auth/check-auth', authenticate, (req, res) => {
  console.log('GET /api/auth/check-auth reached');
  res.json({ authenticated: true, user: (req as any).user });
});

apiRouter.get('/config-status', authenticate, (req, res) => {
  res.json({
    cloudinary: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
    admin: !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.JWT_SECRET)
  });
});

apiRouter.get('/test-cloudinary', authenticate, async (req, res) => {
  try {
    const config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
      api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.trim().slice(-4) : 'Missing',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Missing'
    };

    if (!config.cloud_name || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: 'Missing credentials', config });
    }

    console.log('Testing Cloudinary connectivity...');
    await cloudinary.api.ping();
    
    console.log('Testing Cloudinary Admin API (Usage)...');
    const usage = await cloudinary.api.usage();
    
    console.log('Testing Cloudinary Upload API (Small test image)...');
    const testUpload = await cloudinary.uploader.upload('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', {
      folder: 'test_connection',
      public_id: 'test_ping_' + Date.now(),
      resource_type: 'image'
    });
    
    res.json({ 
      status: 'ok', 
      message: 'Connection, Admin API, and Upload API verified!',
      details: `Plan: ${usage.plan}. Objects: ${usage.objects.used}/${usage.objects.limit}. Test Upload ID: ${testUpload.public_id}`,
      cloud_name: config.cloud_name
    });
  } catch (error: any) {
    console.error('Cloudinary test failed:', error);
    res.status(500).json({ 
      error: 'Cloudinary test failed', 
      details: error.message,
      http_code: error.http_code,
      help: 'A 403 error usually means your API Key or Secret is incorrect for this Cloud Name, or your account has restrictions. Please double check them in Cloudinary Dashboard.'
    });
  }
});

apiRouter.get('/admins', authenticate, (req, res) => {
  const admins = getAdmins();
  res.json(admins.map((a: any) => ({ email: a.email })));
});

apiRouter.post('/admins/add', authenticate, async (req, res) => {
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

apiRouter.post('/admins/remove', authenticate, (req, res) => {
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
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim()
};

console.log('Configuring Cloudinary with:', {
  cloud_name: cloudinaryConfig.cloud_name,
  api_key: cloudinaryConfig.api_key ? 'Present' : 'Missing',
  api_secret: cloudinaryConfig.api_secret ? 'Present' : 'Missing'
});

cloudinary.config(cloudinaryConfig);

// Use the existing uploadDir defined at the top
const upload = multer({ 
  dest: uploadDir,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 20
  }
});

apiRouter.post('/upload', authenticate, (req, res, next) => {
  console.log('Upload request received');
  upload.array('files', 20)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer Error:', err);
      return res.status(400).json({ error: 'Upload Error', details: err.message });
    } else if (err) {
      console.error('Multer Unknown Error:', err);
      return res.status(500).json({ error: 'Upload Error', details: err.message });
    }
    console.log('Multer upload successful, moving to Cloudinary...');
    next();
  });
}, async (req, res) => {
  console.log('Main upload handler reached. Files count:', (req.files as any)?.length);
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      console.log('No files in request');
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log('Missing Cloudinary credentials');
      return res.status(500).json({ 
        error: 'Cloudinary Configuration Error', 
        details: 'Cloudinary credentials are missing in environment.' 
      });
    }

    console.log(`Starting upload of ${files.length} files to Cloudinary...`);

    const uploadPromises = files.map(async (file) => {
      try {
        console.log(`Uploading file: ${file.originalname} (${file.size} bytes, ${file.mimetype})`);
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'gallery',
          resource_type: 'auto',
          use_filename: true,
          unique_filename: true,
          chunk_size: 6000000 // 6MB chunks for better video handling
        });
        console.log(`Successfully uploaded ${file.originalname} to Cloudinary as ${result.public_id}`);
        return result;
      } catch (uploadError: any) {
        console.error(`Cloudinary upload failed for ${file.originalname}:`, uploadError.message);
        const code = (uploadError as any).http_code || 'N/A';
        throw new Error(`Cloudinary Error for ${file.originalname}: ${uploadError.message} (HTTP ${code})`);
      } finally {
        // Clean up local file
        if (fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (unlinkError) {
            console.error(`Failed to delete temp file ${file.path}:`, unlinkError);
          }
        }
      }
    });

    const results = await Promise.all(uploadPromises);
    const simplifiedResults = results.map((r: any) => ({
      public_id: r.public_id,
      secure_url: r.secure_url,
      resource_type: r.resource_type
    }));
    
    console.log('Upload successful. Sending response.');
    res.json({ message: 'Upload successful', results: simplifiedResults });
  } catch (error: any) {
    console.error('Upload process error:', error);
    res.status(500).json({ 
      error: 'Upload failed', 
      details: error.message || 'Unknown server error'
    });
  }
});

apiRouter.get('/gallery', async (req, res) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn('Cloudinary credentials missing, using mock data');
      throw new Error('Cloudinary credentials missing');
    }
    
    console.log('Fetching gallery from Cloudinary...');
    
    try {
      // Try Search API first (most efficient for mixed media)
      const result = await cloudinary.search
        .expression('folder:gallery')
        .sort_by('created_at', 'desc')
        .max_results(30)
        .execute();
      
      console.log(`Search API returned ${result.resources.length} resources`);
      return res.json(result.resources);
    } catch (searchError: any) {
      console.warn('Cloudinary Search API failed, falling back to Admin API:', searchError.message);
      
      // Fallback to Admin API (more reliable but requires multiple calls for mixed media)
      const [images, videos] = await Promise.all([
        cloudinary.api.resources({ type: 'upload', prefix: 'gallery/', resource_type: 'image', max_results: 30 }),
        cloudinary.api.resources({ type: 'upload', prefix: 'gallery/', resource_type: 'video', max_results: 30 })
      ]);
      
      const combined = [...images.resources, ...videos.resources]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      console.log(`Admin API returned ${combined.length} resources`);
      return res.json(combined);
    }
  } catch (error) {
    console.error('Gallery fetch error:', error);
    // Graceful fallback with mock data
    res.json([
      { secure_url: 'https://picsum.photos/seed/gallery1/800/600', public_id: 'mock1', resource_type: 'image' },
      { secure_url: 'https://picsum.photos/seed/gallery2/800/600', public_id: 'mock2', resource_type: 'image' },
      { secure_url: 'https://picsum.photos/seed/gallery3/800/600', public_id: 'mock3', resource_type: 'image' },
      { secure_url: 'https://picsum.photos/seed/gallery4/800/600', public_id: 'mock4', resource_type: 'image' }
    ]);
  }
});

apiRouter.delete('/gallery/:publicId(*)', authenticate, async (req, res) => {
  try {
    const { publicId } = req.params;
    const resourceType = req.query.type as string || 'image';
    
    console.log(`Deleting resource ${publicId} of type ${resourceType}`);
    
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    
    if (result.result === 'ok' || result.result === 'not found') {
      res.json({ message: 'Resource deleted successfully', result: result.result });
    } else {
      console.error('Cloudinary delete error:', result);
      res.status(400).json({ error: 'Failed to delete resource', details: result });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Mount API router
// app.use('/api', apiRouter);

// API Catch-all (to prevent SPA fallback for missing API routes)
// app.all('/api/*', (req, res) => {
//   console.log(`404 API Route Not Found: ${req.method} ${req.path}`);
//   res.status(404).json({ 
//     error: 'API route not found', 
//     path: req.path, 
//     method: req.method 
//   });
// });

// Global Error Handler (Must be last)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: 'Server error',
    details: err.message || 'An unexpected error occurred'
  });
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
