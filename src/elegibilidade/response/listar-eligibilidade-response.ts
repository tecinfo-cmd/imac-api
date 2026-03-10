import { Expose } from 'class-transformer';
import { StatusSolicitacaoEligibilidade } from '../entities/solicitacao-elegibilidade.entity';
import { ApiProperty } from '@nestjs/swagger';
import { PropriedadeResponse } from './propriedade-response';
import { PagamentoBoletoResponse } from '../../cobranca/response/pagamento-boleto-response';

export class ListarEligibilidadeResponse {

    @ApiProperty()
    @Expose()
    id: number;

    @ApiProperty()
    @Expose()
    nomePropriedade: string;

    @ApiProperty()
    @Expose()
    telefone: string;

    @ApiProperty()
    @Expose()
    email: string;

    @ApiProperty()
    @Expose()
    cpfCnpj: string;

    @ApiProperty()
    @Expose()
    carFederal: string;

    @ApiProperty({type: PropriedadeResponse })
    @Expose()
    propriedade: PropriedadeResponse;

    @ApiProperty()
    @Expose()
    status: StatusSolicitacaoEligibilidade;
}
