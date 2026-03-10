import { BadRequestException } from '@nestjs/common';
import { ValidacaoArquivoPipe } from './validacao-arquivo.pipe';
import { ParametrosArquivo } from '../dto/base-upload-request.dto';
import { IsString, IsNotEmpty } from 'class-validator';
import { plainToInstance } from 'class-transformer';

// DTO de mock para os testes
class MockDto {
  @IsString({ message: 'status deve ser uma string' })
  @IsNotEmpty({ message: 'status não pode ser vazio' })
  status: string;
}

describe('ValidacaoArquivoPipe', () => {
  let pipe: ValidacaoArquivoPipe;

  beforeEach(() => {
    pipe = new ValidacaoArquivoPipe();
  });

  const mockFile = (originalname: string): Express.Multer.File => ({
    originalname,
    fieldname: 'test',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 100,
    buffer: Buffer.from('test'),
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  });

  // Objeto base para os testes
  const createTestValue = (
    files: Express.Multer.File[] = [],
    body: any = {},
    dtoClass: any = MockDto,
  ) => ({
    arquivos: files,
    body,
    dtoClass,
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('transform', () => {
    it('should pass validation when input is correct', async () => {
      const arquivos = [mockFile('doc1.pdf')];
      const parametros: ParametrosArquivo[] = [{ nome: 'doc1.pdf', tipo: 'CONTRATO' }];
      const valor = createTestValue(arquivos, { status: 'ativo', parametros });

      const result = await pipe.transform(valor);

      expect(result.body).toBeInstanceOf(MockDto);
      expect((result.body as MockDto).status).toEqual('ativo');
      expect(result.arquivos).toEqual(arquivos);
    });

    it('should correctly parse stringified JSON fields', async () => {
      const arquivos = [mockFile('doc1.pdf')];
      const parametros: ParametrosArquivo[] = [{ nome: 'doc1.pdf', tipo: 'CONTRATO' }];
      const valor = createTestValue(arquivos, { status: 'ativo', parametros: JSON.stringify(parametros) });

      const result = await pipe.transform(valor);

      expect((result.body as MockDto).status).toEqual('ativo');
      expect((result.body as any).parametros).toEqual(parametros);
    });

    it('should throw BadRequestException if DTO validation fails', async () => {
      const arquivos = [mockFile('doc1.pdf')];
      const parametros: ParametrosArquivo[] = [{ nome: 'doc1.pdf', tipo: 'CONTRATO' }];
      const valor = createTestValue(arquivos, { status: '', parametros });

      await expect(pipe.transform(valor)).rejects.toThrow(
        new BadRequestException(['status não pode ser vazio']),
      );
    });

    it('should throw BadRequestException if no files are sent', async () => {
      const valor = createTestValue([], { status: 'ativo', parametros: [] });
      await expect(pipe.transform(valor)).rejects.toThrow(
        new BadRequestException('Nenhum arquivo enviado. Por favor, inclua pelo menos um arquivo.'),
      );
    });

    it('should throw BadRequestException if parametros is not an array', async () => {
      const arquivos = [mockFile('doc1.pdf')];
      const valor = createTestValue(arquivos, { status: 'ativo', parametros: 'invalid' });
      
      await expect(pipe.transform(valor)).rejects.toThrow(
        new BadRequestException('Os parâmetros dos arquivos (JSON) são obrigatórios e devem ser um array não vazio.'),
      );
    });

    it('should throw BadRequestException if a parsed parametro is an empty array', async () => {
      const arquivos = [mockFile('doc1.pdf')];
      const valor = createTestValue(arquivos, { status: 'ativo', parametros: JSON.stringify([]) });
      await expect(pipe.transform(valor)).rejects.toThrow(
        new BadRequestException('Os parâmetros dos arquivos (JSON) são obrigatórios e devem ser um array não vazio.'),
      );
    });

    it('should throw BadRequestException if a parameter is missing "nome" or "tipo"', async () => {
      const arquivos = [mockFile('doc1.pdf')];
      const valor = createTestValue(arquivos, { status: 'ativo', parametros: [{ nome: 'doc1.pdf' }] });
      
      await expect(pipe.transform(valor)).rejects.toThrow(
        new BadRequestException('Cada parâmetro de arquivo deve conter um "nome" e um "tipo" válidos.'),
      );
    });

    it('should throw BadRequestException if a parameter has empty "nome" or "tipo"', async () => {
        const arquivos = [mockFile('doc1.pdf')];
        const valor = createTestValue(arquivos, { status: 'ativo', parametros: [{ nome: ' ', tipo: 'CONTRATO' }] });
        
        await expect(pipe.transform(valor)).rejects.toThrow(
          new BadRequestException('Cada parâmetro de arquivo deve conter um "nome" e um "tipo" válidos.'),
        );
      });

    it('should throw BadRequestException if a file does not have a corresponding parameter', async () => {
      const arquivos = [mockFile('doc1.pdf'), mockFile('unmatched.jpg')];
      const valor = createTestValue(arquivos, {
        status: 'ativo',
        parametros: [{ nome: 'doc1.pdf', tipo: 'CONTRATO' }],
      });
      await expect(pipe.transform(valor)).rejects.toThrow(
        new BadRequestException('Um ou mais arquivos não possuem parâmetros correspondentes: unmatched.jpg'),
      );
    });

    it('should throw BadRequestException if there are duplicate parameter names', async () => {
      const arquivos = [mockFile('doc1.pdf'), mockFile('doc2.pdf')];
      const valor = createTestValue(arquivos, {
        status: 'ativo',
        parametros: [{ nome: 'doc1.pdf', tipo: 'CONTRATO' }, { nome: 'doc1.pdf', tipo: 'OUTRO' }],
      });

      await expect(pipe.transform(valor)).rejects.toThrow(
        new BadRequestException('Não pode haver parâmetros de arquivos com nomes duplicados.'),
      );
    });
  });
});