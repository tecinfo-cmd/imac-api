import { Injectable } from '@nestjs/common';
import * as csvParser from 'csv-parser';
import * as fs from 'node:fs';
import { promisify } from 'util';
import { CsvRowDto } from './csv-row.dto';

const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class CsvParserService {
  async parseCsvFile(filePath: string): Promise<CsvRowDto[]> {
    return new Promise((resolve, reject) => {

      const rows: CsvRowDto[] = [];

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
          try {
            rows.push(row as CsvRowDto);
          } catch (error) {
            console.error(`Erro ao processar linha do CSV:`, error);
          }
        })
        .on('end', async () => {
          await unlinkAsync(filePath).catch(console.error);
          resolve(rows);
        })
        .on('error', reject);
    });
  }
}
