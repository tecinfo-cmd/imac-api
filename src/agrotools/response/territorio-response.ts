import { Expose } from 'class-transformer';

export class TerritorioResponse {
  @Expose()
  cdTerritory: string;
  @Expose()
  cdAgents: string[];
  carCode: string;
  geom: string;
  voucherCode: string;
  imagemAdequacao: string;
}