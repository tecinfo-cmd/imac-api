import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  private readonly UPLOAD_DIR = './uploads';

  constructor() {
    if (!fs.existsSync(this.UPLOAD_DIR)) {
      fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
    }
  }

  validateCsvFile(file: Express.Multer.File): void {
    if (!file.mimetype.includes('csv') && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('Apenas arquivos CSV são permitidos.');
    }

    if (file.size > 400 * 1024 * 1024) {
      throw new BadRequestException('O arquivo deve ter no máximo 50MB.');
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    const filename = `${path.parse(file.originalname).name.replace(/\s/g, '')}-${Date.now()}${path.extname(file.originalname)}`;
    const filePath = path.join(this.UPLOAD_DIR, filename);

    await fs.promises.writeFile(filePath, file.buffer);

    return filePath;
  }
}
