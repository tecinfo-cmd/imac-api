import { Expose } from "class-transformer";
import { ListarPessoaProprietarioResponse } from "./listar-pessoa-proprietario-response";
import { ApiProperty } from '@nestjs/swagger';

export class ListarProprietarioResponse {

    @ApiProperty()
    @Expose()
    pessoa: ListarPessoaProprietarioResponse
}