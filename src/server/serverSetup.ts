import express from 'express';
import path from 'path';
import { type ServerSetupFn } from 'wasp/server';

const serverSetup: ServerSetupFn = async ({ app }) => {
  const clientBuildPath = path.join(process.cwd(), 'build/client');
  
  app.use('/assets', express.static(path.join(clientBuildPath, 'assets'), {
    maxAge: '1y',
    etag: true,
    immutable: true
  }));
  
  app.use(express.static(clientBuildPath, {
    maxAge: '1d',
    etag: true
  }));
  
  app.use((req, res, next) => {
    if (req.url.startsWith('/assets/')) {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
    next();
  });
};

export default serverSetup;
