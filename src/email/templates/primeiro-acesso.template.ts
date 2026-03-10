import { BaseTemplate } from "./base-template";
import * as process from 'process';

interface EmailData{
    token: string;
}

const gerarUrl = (token: string) => `${process.env.URL_BASE_FRONTEND}/firstAccess?token=${token}`;

export class PrimeiroAcessoTemplate extends BaseTemplate<EmailData>{
    generate(): string {
        return `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Usuário criado com sucesso</title>
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

        table {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            border-collapse: collapse;
        }

        td {
            text-align: left;
            vertical-align: top;
        }

        .container {
            padding: 20px 40px;
            text-align: center;
        }

        .container h3 {
            font-size: 24px;
        }

        .container p {
            line-height: 2;
            color: #0A3503;
            font-weight: 500;
            font-size: 20px;
        }

        #p1{
            padding-bottom: 60px;
        }

        #p2{
            font-weight: 600;
        }

        h3 {
            text-transform: uppercase;
            color: #1E4618;
            display: inline-block;
            vertical-align: middle;
            margin: 0;
        }

        #header{
            margin: 50px 0 100px 0;
        }

        #header h1 {
            color: #175912;
            font-size: 40px;
        }

        #logo-header {
            display: inline-block;
            width: 188.92px;
        }

        #icon {
            width: 48px;
            display: inline-block;
            vertical-align: middle;
            margin-right: 8px;
        }

        .button {
            display: inline-block;
            padding: 12px 20px;
            text-align: center;
            background-color: #52A532;
            color: #FFFFFF;
            border-radius: 6px;
            font-size: 16px;
            text-decoration: none;
            width: 500px;
            margin: 20px 0 200px 0;
        }

        .button strong {
            color: #FFFFFF;
        }

        footer {
            background-color: #23811C;
            padding: 20px 30px;
            width: 100%;
            box-sizing: border-box;
        }

        footer table {
            width: 100%;
            border-collapse: collapse;
            max-width: none;
            margin: 0;
        }

        footer table td {
            vertical-align: middle;
            text-align: left;
        }

        footer table td:first-child {
            width: 70px;
        }

        footer table td:last-child {
            text-align: center;
            padding-left: 10px;
        }

        footer p {
            color: #FFFFFF;
            font-weight: 300;
            line-height: 1.5;
            font-size: 20px;
            margin: 0;
        }

        #logo-footer {
            width: 87px;
            display: block;
            margin: 0 auto;
        }
    </style>
</head>

<body>
    <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#D7EADD">
        <tr>
            <td background="https://imac-image.nyc3.digitaloceanspaces.com/public/logo-background.png" bgcolor="#D7EADD" style="background-image: url('https://imac-image.nyc3.digitaloceanspaces.com/public/logo-background.png'); background-repeat: no-repeat; background-position: center bottom; background-size: 599px;">
                <!--[if gte mso 9]>
                <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;">
                  <v:fill type="tile" src="https://imac-image.nyc3.digitaloceanspaces.com/public/logo-background.png" color="#D7EADD" />
                  <v:textbox inset="0,0,0,0">
                <![endif]-->
                <div>
                    <div class="container">
                        <div id="header">
                            <img id="logo-header" src="https://imac-image.nyc3.digitaloceanspaces.com/public/logo.png" alt="Logo programa PREM">
                            <h1>PREM</h1>
                        </div>
                        <div>
                            <img id="icon" src="https://imac-image.nyc3.digitaloceanspaces.com/public/check-circle.png" alt="icone de verificado">
                            <h3>Seu usuário foi criado com sucesso</h3>
                        </div>
                        <p id="p1">Clique no botão abaixo para cadastrar sua senha!</p>
                        <p id="p2">Acesso ao PREM liberado</p>
                        <a href="${gerarUrl(this.data.token)}" class="button"><strong>Cadastrar senha</strong></a>
                    </div>
                </div>
                <!--[if gte mso 9]>
                  </v:textbox>
                </v:rect>
                <![endif]-->
            </td>
        </tr>
        <tr>
            <td>
                <footer>
                    <table>
                        <tr>
                            <td>
                                <img id="logo-footer" src="https://imac-image.nyc3.digitaloceanspaces.com/public/logo-footer.png" alt="Logo programa PREM">
                            </td>
                            <td>
                                <p>Programa de Reinserção e Monitoramento</p>
                            </td>
                        </tr>
                    </table>
                </footer>
            </td>
        </tr>
    </table>
</body>
</html>
`
    }
}
