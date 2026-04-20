import { DeteccoesAgrotools } from "../../elegibilidade/entities/deteccoes-agrotools.entity";
import { BaseTemplate } from "./base-template";
import * as process from 'process';

interface EmailData {
    car: string;
    carEstadual?: string;
    deteccoes: DeteccoesAgrotools[];
    propriedadeApta: boolean;
    areaDesmatamentoTotal: string;
    numeroModulosFiscais: string;
    valorMulta: string;
}

const gerarUrl = () => `${process.env.URL_BASE_FRONTEND}/register`;

export class ResultadoEligibilidadeTemplate extends BaseTemplate<EmailData> {
    generate(): string {
        return `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resultado da análise de elegibilidade da sua propriedade</title>
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
            font-size: 16px;
            text-decoration: none;
            width: 250px;
            margin: 20px 0;
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

        .table-container{
            background-color: #f3f3f3;
            padding: 20px;
        }

        .rules-table {
            background-color: #FFFFFF;
            border-collapse: collapse;
            border-color: #0000001c;
            width: 100%;
            text-align: center;
            font-family: sans-serif;
        }

        .rules-table th{
            color: #FFFFFF;
            font-weight: 900;
        }

        .rules-table td{
            font-size: 12px;
            font-weight: 600;
            text-align: center;
            color: #787878;
        }

        .rules-table th,
        .rules-table td {
            padding: 10px;
        }

        .rules-table thead tr {
            background-color: #2e7d32;
            color: white;
        }

        .rules-table .th-area {
            background-color: #689f38;
        }

        .rules-table .th-discount {
            background-color: #afcc4c;
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
                    <h1>Resultado da análise de elegibilidade da sua propriedade</h1>
                    <p style="margin-bottom: 20px;">Olá, <strong>Produtor,</strong></p>
                    <p>Segue o resultado das análises solicitadas:</p>
                    <ul>
                        <li>CAR: <strong>${this.data.car}</strong></li>
                        <li>CAR Estadual: <strong>${this.data.carEstadual}</strong></li>
                        ${this.data.deteccoes.map(deteccao => '<li>' + deteccao.tipo + ': <strong>' + deteccao.area_ha + '</strong></li>').join('')}
                        <li>Sobreposição com área de RL ou APP: <strong>SIM</strong></li>
                        <li>Propriedade: <strong>${this.data.propriedadeApta ? "ELEGÍVEL" : "NÃO ELEGÍVEL"}</strong> ao PREM</li>
                        <li>Área de desmatamento total: <strong>${this.data.areaDesmatamentoTotal} ha</strong></li>
                        <li>Número de módulos fiscais: <strong>${this.data.numeroModulosFiscais}</strong></li>
                        <li ${!this.data.propriedadeApta ? 'class="hidden"' : ''}><strong>Valor da multa indenizatória: ${Number(this.data.valorMulta).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></li>
                    </ul>
                    <p id="observation" ${!this.data.propriedadeApta ? 'class="hidden"' : ''}><strong>*Observação:</strong></br>O valor da multa indenizatória pode receber desconto,
            conforme as regras do Programa:</p>
                    <div class="table-container" ${!this.data.propriedadeApta ? 'class="hidden"' : ''}>
                        <table border="1" class="rules-table">
                        <thead>
                            <tr>
                            <th>MÓDULOS FISCAIS</th>
                            <th class="th-area">ÁREA DESMATADA</th>
                            <th class="th-discount">DESCONTO</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Primeira Seção -->
                            <tr>
                            <td rowspan="2">Propriedades até 15 módulos fiscais</td>
                            <td>Menor ou igual a 20 hectares</td>
                            <td>Isenção total</td>
                            </tr>
                            <tr>
                            <td>Maior que 20 e menor ou igual a 50 hectares</td>
                            <td>50% de isenção</td>
                            </tr>

                            <!-- Segunda Seção -->
                            <tr>
                            <td rowspan="2">Propriedades maiores que 15 módulos fiscais</td>
                            <td>Menor ou igual a 50 hectares</td>
                            <td>50% de isenção</td>
                            </tr>
                            <tr>
                            <td>Maior que 50 hectares</td>
                            <td>Nenhum benefício</td>
                            </tr>
                        </tbody>
                        </table>
                    </div>
                    <p ${!this.data.propriedadeApta ? 'id="negative-text" style="text-align: center; margin: 20px 0;"' : 'style="text-align: center; margin: 20px 0;"'}>
                        <strong>${this.data.propriedadeApta ? "Cadastre-se no PREM e adquira seu voucher!" : "Caso tenha dúvidas, entre em contato com o IMAC"}</strong>
                    </p>
                    <a href="${gerarUrl()}" ${!this.data.propriedadeApta ? 'class="hidden"' : 'class="button" style="margin: 0 auto; display: block;"'}><strong>Cadastrar</strong></a>
                </div>
            </td>
        </tr>
        <tr>
            <td>
                <footer>
                    <p id="footer-text"><strong>Aguardamos a sua participação!</strong></p>
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
