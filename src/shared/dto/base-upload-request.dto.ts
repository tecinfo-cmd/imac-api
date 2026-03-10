import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested, ArrayNotEmpty, IsNotEmpty } from 'class-validator';

export class ParametrosArquivo {
  @ApiProperty({
    description: 'Nome original do arquivo enviado. Deve corresponder ao nome do arquivo na lista de arquivos enviados no campo "arquivos".',
    example: 'documento_identidade.pdf',
  })
  @IsString({ message: 'O nome do arquivo em parametros deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome do arquivo em parametros não pode ser vazio.' })
  nome: string;

  @ApiProperty({
    description: 'Tipo do documento (ex: RG_FRENTE, COMPROVANTE_ENDERECO, ESCRITURA).',
    example: 'RG_FRENTE',
  })
  @IsString({ message: 'O tipo do arquivo em parametros deve ser uma string.' })
  @IsNotEmpty({ message: 'O tipo do arquivo em parametros não pode ser vazio.' })
  tipo: string;
}

export class BaseUploadRequest {
  @ApiProperty({
    type: 'string',
    description: `String JSON representando um array de objetos. Cada objeto deve ter "nome" (string, nome original do arquivo) e "tipo" (string).
                  Deve possuir um parametro correspondente para cada arquivo enviado com nome do arquivo e seu tipo.
                  Exemplo de valor: '[{"nome": "documento1.pdf", "tipo": "CONTRATO"}, {"nome": "imagem_rg.jpg", "tipo": "RG_FRENTE"}]'`,
    example: '[{"nome": "escritura.pdf", "tipo": "ESCRITURA"}, {"nome": "rg_frente.jpg", "tipo": "RG_FRENTE"}]',
    required: true,
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch (e) { return value; }
    }
    return value;
  })
  @IsArray({ message: 'O campo parametros deve ser um array (ou um JSON string de um array).' })
  @ArrayNotEmpty({ message: 'O campo parametros não pode ser um array vazio.' })
  @ValidateNested({ each: true, message: 'Cada item em parametros deve ser um objeto FileParameter válido e conter "nome" e "tipo".' })
  @Type(() => ParametrosArquivo)
  parametros: ParametrosArquivo[];

  @ApiProperty({ type: 'string', format: 'binary', description: 'Arquivos a serem enviados', isArray: true, required: true })
  arquivos: Express.Multer.File[];
}