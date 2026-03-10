import { Expose } from "class-transformer";
import { ApiProperty } from '@nestjs/swagger';

export class PessoaResponse {

    @ApiProperty()
    @Expose()
    nome: string;

    @ApiProperty()
    @Expose()
    telefone: string;
}