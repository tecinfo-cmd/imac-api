import { ApiProperty } from '@nestjs/swagger';
import { ItensContestacao } from './itens-contestacao';

export class ContestacaoRequest {
  @ApiProperty()
  cdTerritory: string;

  contestation: ItensContestacao[];
}
