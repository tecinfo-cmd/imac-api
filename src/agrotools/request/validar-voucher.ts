import { ApiProperty } from '@nestjs/swagger';

export class  ValidarVoucher {

  @ApiProperty({
    name: 'voucher',
    required: true,
    type: String
  })
  voucher: string

  @ApiProperty({
    name: 'idPropriedade',
    required: true
  })
  idPropriedade: number
}