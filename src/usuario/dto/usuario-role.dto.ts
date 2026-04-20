import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class UsuarioRole {

    @ApiProperty()
    @Expose()
    id: number;

    @ApiProperty()
    @Expose()
    nome: string;
}