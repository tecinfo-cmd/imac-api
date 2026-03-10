import { ApiProperty } from '@nestjs/swagger';

export class MensagemResponse {
  @ApiProperty()
  sucesso: boolean
  @ApiProperty()
  mensagem: string
}
