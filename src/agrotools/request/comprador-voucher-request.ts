import { EnderecoPagRequest } from './endereco-pag-request';
import { ApiProperty } from '@nestjs/swagger';
import { PagamentoRequest } from './pagamento-request';
import { DocumentoRequest } from './documento-request';

export class CompradorVoucherRequest{
  @ApiProperty()
  name: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  phone: string;
  @ApiProperty()
  document: DocumentoRequest;
  @ApiProperty()
  address: EnderecoPagRequest
}
