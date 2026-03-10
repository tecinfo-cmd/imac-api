import { BaseTemplate } from "./base-template";
import * as process from 'process';

interface EmailData{
    idSolicitacao: number;
    carFederal: string;
    nomePropriedade: string;
    token: string;
}

const gerarUrl = (id: number, token: string ) => `${process.env.URL_BASE_FRONTEND}/confirmation?id=${id}&token=${token}`;
 
export class SolicitacaoEligibilidadeTemplate extends BaseTemplate<EmailData>{
    generate(): string {
        return `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmação de Solicitação</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
            color: #222222;
        }

        strong {
            font-weight: 700;
        }

        body {
            background-color: #FFFFFF;
        }

        table {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
        }

        td {
            text-align: left;
        }

        header {
            background-color: #1F3F13;
            padding: 20px 50px;
            width: 100%;
        }

        header table {
            width: 100%;
            border-spacing: 0;
        }

        header td {
            padding: 0;
            text-align: center;
        }

        header img {
            vertical-align: middle;
        }

        .container {
            padding: 20px 40px;
        }

        h1 {
            font-weight: 800;
            margin-bottom: 20px;
        }

        p {
            line-height: 2;
            font-size: 16px;
            color: #333333;
        }

        footer {
            background-color: #F5F5F5;
            padding: 30px 40px;
        }

        footer p {
            color: #000000;
            font-weight: 300;
            line-height: 1.5;
        }

        .button {
            display: inline-block;
            padding: 12px 20px;
            text-align: center;
            background-color: #52A532;
            border-radius: 6px;
            text-decoration: none;
            font-size: 16px;
            width: 250px;
            margin: 30px 0;
        }

        .button strong{
            color: #FFFFFF;
        }

        .button:hover{
            color: inherit;
        }

        .result{
            font-size: 14px;
        }
    </style>
</head>
<body>
    <table>
        <tr>
            <td>
                <header>
                    <table>
                        <tr>
                            <td style="width: 50%; text-align: left;">
                                <img style="height: 44px;" src="https://imac-image.nyc3.digitaloceanspaces.com/public/programa_greenbg.jpg" alt="Logo Programa de Reinserção e Monitoramento">
                            </td>
                            <td style="width: 50%; text-align: right;">
                                <img style="height: 36px;" src="https://imac-image.nyc3.digitaloceanspaces.com/public/Logo_IMAC_greenbg.jpg" alt="Logo IMAC">
                            </td>
                        </tr>
                    </table>
                </header>
            </td>
        </tr>
        <tr>
            <td>
                <div class="container">
                    <h1>Confirmação de Solicitação</h1>
                    <p style="margin-bottom: 20px;">Olá, <strong>Produtor,</strong></p>
                    <p style="margin-bottom: 20px;">Recebemos sua solicitação para análise de elegibilidade da sua propriedade:</p>
                    <p class="result"><strong>${this.data.nomePropriedade} </strong></p>
                    <p class="result"><strong>CAR - ${this.data.carFederal}</strong></p>
                    <a href="${gerarUrl(this.data.idSolicitacao, this.data.token)}" class="button"><strong>Clique aqui para confirmar</strong></a>
                    <p>Caso não tenha solicitado, ignore este e-mail.</p>
                </div>
            </td>
        </tr>
        <tr>
            <td>
                <footer>
                    <p>Atenciosamente,<br>Equipe PREM</p>

                    <p style="margin-top: 20px;"><strong>CONTATO</strong><br>
                        Fones: (65) 9 9977-8287 / (65) 3057-9291<br>
                        Email: <a href="mailto:prem@imac.agr.br">prem@imac.agr.br</a>
                    </p>
                </footer>
            </td>
        </tr>
    </table>
</body>
</html>`
    }
}
