/**

*/

import { join, dirname, basename } from 'path';
import { mkdirSync } from 'fs';
import { Router } from 'express';
import multer from 'multer';
import { PathTraversalError, assertPathWithinBase } from '../../utils/path';
import { MediaModel, PathConfig } from '../models/media';

export const createMediaRouter = (config: PathConfig): Router => {
  const mediaFolder = join(
    config.rootPath,
    config.publicFolder,
    config.mediaRoot
  );
  const storage = multer.diskStorage({
    destination: function (req, _file, cb) {
      // req.params[0] may be a path like "content/doctors/dr-amit/photo.jpg".
      // Split into subdirectory + filename so files land in the right folder.
      const uploadPath = req.params[0];
      const subDir = dirname(uploadPath);
      const destDir =
        subDir && subDir !== '.'
          ? join(mediaFolder, subDir)
          : mediaFolder;
      try {
        assertPathWithinBase(destDir, mediaFolder);
      } catch (error) {
        return cb(error, undefined);
      }
      mkdirSync(destDir, { recursive: true });
      cb(null, destDir);
    },
    filename: function (req, _file, cb) {
      // @security req.params[0] is untrusted — the upload filename could
      // contain traversal sequences like `../../etc/shadow`. We validate it
      // before passing it to multer.
      const uploadPath = req.params[0];
      try {
        assertPathWithinBase(uploadPath, mediaFolder);
      } catch (error) {
        return cb(error, undefined);
      }
      cb(null, basename(uploadPath));
    },
  });

  const upload = multer({ storage });
  const uploadRoute = upload.single('file');

  const mediaModel = new MediaModel(config);

  const mediaRouter = Router();

  mediaRouter.get('/list/*', async (req, res) => {
    try {
      // @security req.params[0] is untrusted user input — path traversal
      // validation happens inside mediaModel.listMedia via resolveWithinBase.
      const folder = req.params[0];
      const cursor = req.query.cursor as string;
      const limit = req.query.limit as string;
      const media = await mediaModel.listMedia({
        searchPath: folder,
        cursor,
        limit,
      });
      res.json(media);
    } catch (error) {
      if (error instanceof PathTraversalError) {
        res.status(403).json({ error: error.message });
        return;
      }
      throw error;
    }
  });

  mediaRouter.delete('/*', async (req, res) => {
    try {
      // @security req.params[0] is untrusted user input — path traversal
      // validation happens inside mediaModel.deleteMedia via resolveStrictlyWithinBase.
      const file = req.params[0];
      const didDelete = await mediaModel.deleteMedia({ searchPath: file });
      res.json(didDelete);
    } catch (error) {
      if (error instanceof PathTraversalError) {
        res.status(403).json({ error: error.message });
        return;
      }
      throw error;
    }
  });

  mediaRouter.post('/upload/*', async function (req, res) {
    // do it this way for better error handling
    await uploadRoute(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        res.status(500).json({ message: err.message });
        // A Multer error occurred when uploading.
      } else if (err) {
        // An unknown error occurred when uploading.
        res.status(500).json({ message: err.message });
      } else {
        res.json({ success: true });
      }
    });
  });

  return mediaRouter;
};
