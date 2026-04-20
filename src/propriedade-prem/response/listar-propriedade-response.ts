import { Expose, Type } from "class-transformer";
import { ListarProprietarioResponse } from "./listar-proprietario-response";
import { CidadeResponse } from './cidade-response';
import { ApiProperty } from '@nestjs/swagger';
import { SolicitacaoElegibilidadeResponse } from './solicitacao-elegibilidade-response';
import { UsuarioRole } from '../../usuario/dto/usuario-role.dto';
import { UsuarioResponse } from '../../usuario/response/usuario-response';

export class ListarPropriedadeResponse {

    @ApiProperty()
    @Expose()
    id: number;

    @ApiProperty()
    @Expose()
    nomePropriedade: string;

    @ApiProperty()
    @Expose()
    @Type(() => ListarProprietarioResponse)
    proprietarios: ListarProprietarioResponse[];

    @ApiProperty()
    @Expose()
    @Type(() => CidadeResponse)
    cidade: CidadeResponse;

    @ApiProperty()
    @Expose()
    carFederal: string;

    @ApiProperty()
    @Expose()
    carEstadual: string;

    @ApiProperty()
    @Expose()
    status: string;

    @ApiProperty({ type: () => SolicitacaoElegibilidadeResponse, required: false })
    @Expose()
    solicitacaoElegibilidade: SolicitacaoElegibilidadeResponse;

    @ApiProperty({ type: () => UsuarioResponse})
    @Expose()
    analista: UsuarioResponse;
}
