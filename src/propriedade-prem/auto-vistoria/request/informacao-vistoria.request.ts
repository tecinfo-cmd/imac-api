import { ApiProperty } from '@nestjs/swagger';

export class InformacaoVistoriaRequest {

  @ApiProperty({example: 10})
  id: number;

  @ApiProperty({example: 'https://analise-avancada-api.agrotools.com.br/Documents/Evidences/4622330586775848738/db540310-7c58-41ee-8f4b-73483f57f11c/Relat%c3%b3rio%20de%20coleta.pdf'})
  reportUrl: string;
}
