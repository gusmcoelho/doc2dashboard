import { Router, Request, Response } from 'express';
import multer from 'multer';
import { parseDocument, resolveFileType } from '../parsers';
import { generateDashboard } from '../engine/dashboardGenerator';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

export const uploadRouter = Router();

uploadRouter.post(
  '/',
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Nenhum arquivo enviado.' });
        return;
      }

      const originalName = req.file.originalname;
      const fileType = resolveFileType(originalName);

      if (!fileType) {
        res.status(400).json({
          error:
            'Formato não suportado. Por favor, envie um arquivo .xlsx, .xls, .csv, .docx ou .pdf.',
        });
        return;
      }

      const targetSheet = typeof req.query.sheet === 'string' ? req.query.sheet : undefined;
      const parsed = await parseDocument(req.file.buffer, originalName, targetSheet);

      const dashboard = generateDashboard(
        parsed.fileName,
        parsed.fileType,
        parsed.fileSizeBytes,
        parsed.records,
        parsed.textSummary,
        parsed.availableSheets
      );

      res.json(dashboard);
    } catch (err: any) {
      res.status(500).json({
        error: err?.message || 'Falha ao processar o documento.',
      });
    }
  }
);
