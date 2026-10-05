import express, { RequestHandler } from 'express';
import fs from 'fs';
import path from 'path';

export const REVALIDATE = 'no-cache, max-age=0, must-revalidate';

// API responses and errors stay private unless a public route explicitly opts in.
export const preventResponseCaching: RequestHandler = (_req, res, next) => {
  res.set('Cache-Control', 'private, no-store');
  next();
};

export function createClientFilesRouter(buildPath: string) {
  const router = express.Router();
  const root = path.resolve(buildPath);

  router.get('*', (req, res, next) => {
    const relativePath = req.path.replace(/^\/+|\/+$/g, '');
    if (!relativePath || path.extname(relativePath)) return next();

    const htmlPath = path.resolve(root, relativePath, 'index.html');
    if (!htmlPath.startsWith(`${root}${path.sep}`) || !fs.existsSync(htmlPath)) return next();

    res.set('Cache-Control', REVALIDATE);
    return res.sendFile(htmlPath);
  });

  router.use(express.static(root, {
    redirect: false,
    setHeaders(res, filePath) {
      const relativePath = path.relative(root, filePath).split(path.sep).join('/');
      let policy = 'public, max-age=3600';
      if (relativePath.startsWith('hbd/')) {
        policy = 'private, no-store';
      } else if (/\.html$/i.test(relativePath) || /(^|\/)(sw\.js|manifest\.json)$/.test(relativePath)) {
        policy = REVALIDATE;
      } else if (relativePath.startsWith('assets/') && /-[a-f0-9]{8,}\.[^.]+$/i.test(relativePath)) {
        policy = 'public, max-age=31536000, immutable';
      }
      res.setHeader('Cache-Control', policy);
    },
  }));

  // A missing script must not receive the SPA HTML shell or a cacheable 404.
  router.get('*', (req, res, next) => {
    if (!path.extname(req.path) && !/^\/(assets|images|_pixel-office\/assets)(\/|$)/.test(req.path)) return next();
    res.set('Cache-Control', 'no-store');
    return res.status(404).type('text/plain').send('File not found');
  });

  return router;
}
