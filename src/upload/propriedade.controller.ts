import { Controller, HttpException, HttpStatus, Post, Query, Request, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PropriedadeService } from './propriedade.service';
import { FileUploadService } from './file-upload.service';
import { DocumentoUploadService } from './documento-upload.service';
import { UploadCsvResponseDto } from './upload-csv-response.dto';
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Propriedades')
@Controller('propriedades')
export class PropriedadeController {
  constructor(
    private readonly propriedadeService: PropriedadeService,
    private readonly fileUploadService: FileUploadService,
    private readonly documentoUploadService: DocumentoUploadService
  ) {
  }

  /**
   * Faz o upload de um arquivo CSV, processa os dados e os persiste no banco.
   *
   * - O arquivo é validado quanto ao formato e tamanho.
   * - O conteúdo do CSV é processado e transformado em entidades.
   *
   * @param file Arquivo CSV a ser enviado
   * @returns Mensagem de sucesso ou erro durante o processamento
   */
  @Post('upload-csv')
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({
    status: 201,
    description: 'CSV processado e dados persistidos com sucesso.',
    type: UploadCsvResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Solicitação inválida ou arquivo não enviado.',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno ao processar o arquivo CSV.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo CSV a ser enviado.',
        },
      },
    },
  })
  async uploadCsvFile(@UploadedFile() file: Express.Multer.File): Promise<UploadCsvResponseDto> {
    if (!file) {
      throw new HttpException('Arquivo não enviado.', HttpStatus.BAD_REQUEST);
    }

    try {
      this.fileUploadService.validateCsvFile(file);
      const storedFilePath = await this.fileUploadService.saveFile(file);
      this.propriedadeService.processCsv(storedFilePath);
      return { message: 'CSV processado e dados persistidos com sucesso!' };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Erro ao processar o arquivo CSV.',
          error: error.message || 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
