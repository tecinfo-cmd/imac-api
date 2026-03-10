import { BadRequestException, Injectable } from '@nestjs/common';
import { S3 } from "@aws-sdk/client-s3";
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const FOLDER = "documents";
const IMAGES_FOLDER = "images";

export interface File {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  stream: any;
  // These are part of Express.Multer.File, but not always used.
  destination: string;
  filename: string;
  path: string;
}

export interface UploadDocumento {
  filename: string;
  originalName: string;
  url: string;
}

// TODO: Separar o módulo de upload em um local e usar esse como base apenas para documentos
@Injectable()
export class DocumentoUploadService {
  private readonly s3: S3;
  private readonly bucketName: string;
  private readonly allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.google-earth.kml+xml',
    'application/octet-stream',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
    'multipart/x-zip'
  ];

constructor(private readonly configService: ConfigService) {
    this.s3 = new S3({
      forcePathStyle: false,
      endpoint: this.configService.get('BUCKET_ENDPOINT'),
      region: this.configService.get('BUCKET_REGION'),
      credentials: {
        accessKeyId: this.configService.get('BUCKET_ACCESS_KEY')!,
        secretAccessKey: this.configService.get('BUCKET_KEY')!,
      },
    });
    this.bucketName = this.configService.get('BUCKET_NAME')!;
  }

  async uploadBase64Image(base64Image: string): Promise<UploadDocumento> {
    try {
      const key = `${uuid()}.png`;
      const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');

      await this.s3.putObject({
        Bucket: this.bucketName,
        Key: `${IMAGES_FOLDER}/${key}`,
        Body: buffer,
        ACL: 'public-read',
        ContentType: 'image/png',
      });

      return {
        filename: key,
        originalName: key,
        url: `https://${this.bucketName}.nyc3.digitaloceanspaces.com/${IMAGES_FOLDER}/${key}`
      };
    } catch (error) {
      throw new BadRequestException(`Erro ao fazer upload da imagem base64`); 
    }
  }

  async uploadFiles(files: File[]): Promise<UploadDocumento[]> {
    this.validateFiles(files);

    const uploadPromises = files.map(async (file) => {
      const key = `${uuid()}-${file.originalname}`;
      await this.s3
        .putObject({
          Bucket: this.bucketName,
          Key: `${FOLDER}/${key}`,
          Body: file.buffer,
          ACL: 'public-read',
          ContentType: file.mimetype,
        });
      return {
        filename: key,
        originalName: file.originalname,
          //.normalize('NFD')
         // .replace(/[\u0300-\u036f]/g, ''),
        url: `https://${this.bucketName}.nyc3.digitaloceanspaces.com/${FOLDER}/${key}`
      };
    });

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new BadRequestException(`Erro ao fazer upload dos arquivos`);
    }
  }

  private validateFiles(files: Express.Multer.File[]): void {
    for (const file of files) {
        const isAllowed = this.allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/');
      if (!isAllowed) {
        throw new BadRequestException(`Tipo de arquivo inválido: ${file.originalname}. Apenas PDFs e imagens são permitidos.`);
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new BadRequestException(`Arquivo muito grande: ${file.originalname}`);
      }
    }
  }

  async deleteFiles(files: string[]): Promise<void> {
    const deletePromises = files.map(async (file) => {
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: file,
      });
    });

    await Promise.all(deletePromises);
  }
}
