import { ItensPlanoAdequacao } from './itens-plano-adequacao';
import { ApiProperty } from '@nestjs/swagger';

export class PlanoAdequacaoRequest {
  @ApiProperty()
  cdTerritory: string;

  adequancyPlanItems: ItensPlanoAdequacao[];
}