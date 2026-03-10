import { Expose } from "class-transformer";

export class ListarPessoaProprietarioResponse {
    @Expose()
    nome: string;
}