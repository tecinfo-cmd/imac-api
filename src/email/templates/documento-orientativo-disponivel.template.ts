import { BaseTemplate } from "./base-template";
import * as process from 'process';

interface EmailData {}

const gerarUrl = () => `${process.env.URL_BASE_FRONTEND}/auth`;
 
export class DocumentoOrientativoDisponivelTemplate extends BaseTemplate<EmailData>{
    generate(): string {
        return `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Novo documento orientativo disponível!</title>
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
            display: block;
            padding: 12px 20px;
            text-align: center;
            background-color: #52A532;
            border-radius: 6px;
            font-size: 16px;
            text-decoration: none;
            width: 250px;
            margin: 20px auto;
        }

        .button strong{
            color: #FFFFFF;
        }

        .button:hover{
            color: inherit;
        }

        ul{
            margin: 10px 0;
            list-style-position: inside;
            line-height: 1.5em;
            font-size:16px;
        }

        #observation {
            font-size: 14px;
            margin: 20px 0;
        }

        #footer-text {
            margin-bottom: 30px;
        }

        #negative-text {
            margin: 40px 0;
        }

        .hidden {
            visibility: hidden;
            width: 0;
            height: 0;
            overflow: hidden;
            display: none;
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
                    <h1>Novo documento orientativo disponível!</h1>
                    <p style="margin: 50px 0 40px 0;">Olá, <strong>Produtor</strong>,</p>
                    <p style="margin: 0 0 40px 0;">Um novo documento orientativo está disponível. </br> Acesse o portal PREM para visualizar. </p>
                    <a href="${gerarUrl()}" class="button"><strong>Acessar o PREM</strong></a>
                </div>
            </td>
        </tr>
        <tr>
            <td>
                <footer>
                    <p>Atenciosamente,<br>Equipe PREM</p>

                    <p style="margin-top: 20px;"><strong>CONTATO</strong><br>
                        Fones: (65) 99977-8227<br>
                        Email: <a href="mailto:prem@imac.agr.br">prem@imac.agr.br</a>
                        Site: <a href=" https://imac.agr.br/">https://imac.agr.br</a>
                    </p>
                </footer>
            </td>
        </tr>
    </table>
</body>
</html>`
    }
}
