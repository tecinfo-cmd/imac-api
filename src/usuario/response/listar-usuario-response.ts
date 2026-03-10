import { Expose, Type } from "class-transformer";
import { StatusUsuario } from "../enums/usuario-status";
import { PessoaResponse } from "../../pessoa/response/pessoa-response";
import { UsuarioRole } from "../dto/usuario-role.dto";

export class ListarUsuarioResponse {

    @Expose()
    id: number;

    @Expose()
    email: string;

    @Expose()
    status?: StatusUsuario;

    @Expose()
    @Type(() => PessoaResponse)
    pessoa?: PessoaResponse;

    @Expose()
    @Type(() => UsuarioRole)
    roles: UsuarioRole[];

    @Expose()
    quantidadePropriedade?: number;

    @Expose()
    usuarioAnalista?: number;
}
