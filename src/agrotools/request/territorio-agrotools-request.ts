import { AgentsRequest } from './agents-request';

export class TerritorioAgrotoolsRequest {
  car: string;
  vlOwnerCode: string;
  territoryName: string;
  producersId?: number [] = [];
  agents: AgentsRequest [] = [];

}