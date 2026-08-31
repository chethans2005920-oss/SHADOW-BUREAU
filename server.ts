import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, 'server/data/db.json');

// Ensure database file exists
function initializeDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      projects: [],
      archive: [],
      capabilities: [],
      team: [],
      socialPosts: [],
      socialLinks: [],
      studio: {
        name: "Shadow Bureau",
        description: "Shadow Bureau is an experimental visual creative studio...",
        location: "Paris // Berlin // Tokyo",
        founded: 2024,
        contactEmail: "bureau@shadowbureau.co"
      },
      contactSubmissions: []
    }, null, 2));
  }
}

initializeDb();

// Database read/write helpers
function getDb() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database, resetting:', err);
    return {
      projects: [],
      archive: [],
      capabilities: [],
      team: [],
      socialPosts: [],
      socialLinks: [],
      studio: {},
      contactSubmissions: []
    };
  }
}

function saveDb(db: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// Generate unique request IDs for errors
function generateRequestId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Express App Initialization
const app = express();
app.use(express.json({ limit: '10mb' }));

// Set CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Zod schemas for validation
const ContactSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email address"),
  projectType: z.string().min(1, "Project type is required"),
  budget: z.string().min(1, "Budget range is required"),
  description: z.string().min(10, "Please describe your project with at least 10 characters")
});

const ProjectMediaSchema = z.object({
  id: z.string(),
  url: z.string().url("Valid media URL required"),
  type: z.enum(['IMAGE', 'VIDEO']),
  isCover: z.boolean(),
  altText: z.string().nullable()
});

const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string()
});

const CapabilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable()
});

const ProjectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  description: z.string().nullable(),
  year: z.number().int().min(2000).max(2100),
  projectType: z.enum(['CLIENT', 'SPEC', 'SELF_INITIATED', 'COLLABORATION']),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  featured: z.boolean(),
  client: z.string().nullable(),
  location: z.string().nullable(),
  objective: z.string().nullable(),
  approach: z.string().nullable(),
  execution: z.string().nullable(),
  results: z.string().nullable(),
  accentColor: z.string().nullable(),
  media: z.array(ProjectMediaSchema),
  categories: z.array(CategorySchema),
  capabilities: z.array(CapabilitySchema)
});

// Canonical error formatter
function sendError(res: express.Response, status: number, code: string, message: string, details: any = null) {
  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      details,
      requestId: generateRequestId()
    }
  });
}

// -------------------------------------------------------------
// PUBLIC PORTFOLIO API ENDPOINTS
// -------------------------------------------------------------

// GET /api/v1/projects
app.get('/api/v1/projects', (req, res) => {
  try {
    const db = getDb();
    const published = db.projects.filter((p: any) => p.status === 'PUBLISHED');
    res.json({
      success: true,
      data: published
    });
  } catch (err: any) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Failed to retrieve projects', err.message);
  }
});

// GET /api/v1/projects/featured
app.get('/api/v1/projects/featured', (req, res) => {
  try {
    const db = getDb();
    const featured = db.projects.filter((p: any) => p.status === 'PUBLISHED' && p.featured === true);
    res.json({
      success: true,
      data: featured
    });
  } catch (err: any) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Failed to retrieve featured projects', err.message);
  }
});

// GET /api/v1/projects/:slug
app.get('/api/v1/projects/:slug', (req, res) => {
  try {
    const db = getDb();
    const project = db.projects.find((p: any) => p.slug === req.params.slug && p.status === 'PUBLISHED');
    if (!project) {
      return sendError(res, 404, 'PROJECT_NOT_FOUND', 'This project could not be found.');
    }
    res.json({
      success: true,
      data: project
    });
  } catch (err: any) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Failed to retrieve project', err.message);
  }
});

// GET /api/v1/archive
app.get('/api/v1/archive', (req, res) => {
  try {
    const db = getDb();
    res.json({
      success: true,
      data: db.archive || []
    });
  } catch (err: any) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Failed to retrieve archive items', err.message);
  }
});

// GET /api/v1/capabilities
app.get('/api/v1/capabilities', (req, res) => {
  try {
    const db = getDb();
    res.json({
      success: true,
      data: db.capabilities || []
    });
  } catch (err: any) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Failed to retrieve capabilities', err.message);
  }
});

// GET /api/v1/studio
app.get('/api/v1/studio', (req, res) => {
  try {
    const db = getDb();
    res.json({
      success: true,
      data: db.studio || {}
    });
  } catch (err: any) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Failed to retrieve studio info', err.message);
  }
});

// GET /api/v1/manifesto
app.get('/api/v1/manifesto', (req, res) => {
  try {
    const db = getDb();
    res.json({
      success: true,
      data: [
        "We reject standard interfaces and visual complacency.",
        "Design is not a decorative skin; it is architectural storytelling.",
        "Every brand deserves its own bespoke digital laws.",
        "We build visual worlds.",
        "We are the Shadow Bureau."
      ]
    });
  } catch (err: any) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Failed to retrieve manifesto', err.message);
  }
});

// GET /api/v1/team
app.get('/api/v1/team', (req, res) => {
  try {
    const db = getDb();
    res.json({
      success: true,
      data: db.team || []
    });
  } catch (err: any) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Failed to retrieve team members', err.message);
  }
});

// GET /api/v1/social-posts
app.get('/api/v1/social-posts', (req, res) => {
  try {
    const db = getDb();
    res.json({
      success: true,
      data: db.socialPosts || []
    });
  } catch (err: any) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Failed to retrieve social posts', err.message);
  }
});

// GET /api/v1/social-links
app.get('/api/v1/social-links', (req, res) => {
  try {
    const db = getDb();
    res.json({
      success: true,
      data: db.socialLinks || []
    });
  } catch (err: any) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Failed to retrieve social links', err.message);
  }
});

// POST /api/v1/contact
app.post('/api/v1/contact', (req, res) => {
  try {
    const bodyResult = ContactSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid form data. Please review fields.', bodyResult.error.flatten());
    }

    const db = getDb();
    const newSubmission = {
      id: 'sub-' + Date.now(),
      ...bodyResult.data,
      status: 'NEW',
      createdAt: new Date().toISOString()
    };

    db.contactSubmissions = db.contactSubmissions || [];
    db.contactSubmissions.unshift(newSubmission);
    saveDb(db);

    res.json({
      success: true,
      data: newSubmission
    });
  } catch (err: any) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Failed to submit contact form', err.message);
  }
});

// -------------------------------------------------------------
// ADMIN SUITE API ENDPOINTS (No Relational database needed, files are write-persistent)
// -------------------------------------------------------------

// GET /api/v1/admin/projects
app.get('/api/v1/admin/projects', (req, res) => {
  try {
    const db = getDb();
    res.json({
      success: true,
      data: db.projects
    });
  } catch (err: any) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Failed to retrieve admin projects', err.message);
  }
});

// POST /api/v1/admin/projects
app.post('/api/v1/admin/projects', (req, res) => {
  try {
    const bodyResult = ProjectSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Project validation failed.', bodyResult.error.flatten());
    }

    const db = getDb();
    const slug = bodyResult.data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Check slug collision
    if (db.projects.some((p: any) => p.slug === slug)) {
      return sendError(res, 400, 'DUPLICATE_SLUG', 'A project with a similar title or slug already exists.');
    }

    const newProject = {
      ...bodyResult.data,
      id: 'proj-' + Date.now(),
      slug
    };

    db.projects.unshift(newProject);
    saveDb(db);

    res.json({
      success: true,
      data: newProject
    });
  } catch (err: any) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Failed to create project', err.message);
  }
});

// PUT /api/v1/admin/projects/:id
app.put('/api/v1/admin/projects/:id', (req, res) => {
  try {
    const bodyResult = ProjectSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Project validation failed.', bodyResult.error.flatten());
    }

    const db = getDb();
    const index = db.projects.findIndex((p: any) => p.id === req.params.id);
    if (index === -1) {
      return sendError(res, 404, 'PROJECT_NOT_FOUND', 'This project could not be found.');
    }

    const currentProject = db.projects[index];
    const newSlug = bodyResult.data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const updatedProject = {
      ...bodyResult.data,
      id: currentProject.id,
      slug: newSlug
    };

    db.projects[index] = updatedProject;
    saveDb(db);

    res.json({
      success: true,
      data: updatedProject
    });
  } catch (err: any) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Failed to update project', err.message);
  }
});

// DELETE /api/v1/admin/projects/:id
app.delete('/api/v1/admin/projects/:id', (req, res) => {
  try {
    const db = getDb();
    const index = db.projects.findIndex((p: any) => p.id === req.params.id);
    if (index === -1) {
      return sendError(res, 404, 'PROJECT_NOT_FOUND', 'This project could not be found.');
    }

    db.projects.splice(index, 1);
    saveDb(db);

    res.json({
      success: true,
      data: { id: req.params.id }
    });
  } catch (err: any) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Failed to delete project', err.message);
  }
});

// GET /api/v1/admin/contacts
app.get('/api/v1/admin/contacts', (req, res) => {
  try {
    const db = getDb();
    res.json({
      success: true,
      data: db.contactSubmissions || []
    });
  } catch (err: any) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Failed to retrieve submissions', err.message);
  }
});

// PUT /api/v1/admin/contacts/:id
app.put('/api/v1/admin/contacts/:id', (req, res) => {
  try {
    const db = getDb();
    const sub = db.contactSubmissions.find((s: any) => s.id === req.params.id);
    if (!sub) {
      return sendError(res, 404, 'SUBMISSION_NOT_FOUND', 'Submission not found');
    }

    const { status } = req.body;
    if (status && ['NEW', 'REVIEWED', 'ARCHIVED'].includes(status)) {
      sub.status = status;
      saveDb(db);
    }

    res.json({
      success: true,
      data: sub
    });
  } catch (err: any) {
    sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Failed to update submission', err.message);
  }
});

// -------------------------------------------------------------
// HYBRID INTEGRATED DEV & PRODUCTION ASSET SERVER
// -------------------------------------------------------------
const PORT = 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Starting full-stack server in DEVELOPMENT mode...');
    
    // Create Vite dev server in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });

    // Use Vite middlewares
    app.use(vite.middlewares);

    // Serve HTML entry through Vite index transformers
    app.get('*', async (req, res, next) => {
      // Exclude API routes from index serving
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (err: any) {
        vite.ssrFixStacktrace(err);
        next(err);
      }
    });

  } else {
    console.log('Starting full-stack server in PRODUCTION mode...');
    
    // Serve static files compiled to dist/
    app.use(express.static(path.resolve(__dirname, 'dist')));
    
    // Redirect all client routes to index.html for SPA router handling
    app.get('*', (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Shadow Bureau full-stack orchestrator online at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal failure starting Shadow Bureau system:', err);
});
