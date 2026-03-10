import { PdfTemplateInterface } from "src/pdf/interfaces/pdf-template.interface";
import { PdfBuilderInterface } from "../../../interfaces/pdf-builder.interface";
import { DcsPdfTemplate } from "../../../templates/dcs-pdf-template";
import * as PDFDocument from "pdfkit";
import { existsSync } from "fs";
import * as process from 'process';
import * as path from "node:path";
import * as QRCode from 'qrcode';
export class PdfKitActPdfBuilder implements PdfBuilderInterface{
  supports(template: PdfTemplateInterface): boolean {
    return template instanceof DcsPdfTemplate;
  }
  
   async build(template: DcsPdfTemplate): Promise<Buffer> {
    const { data } = template;
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 36, left: 36, right: 36, bottom: 36 },
    });

    const chunks: Buffer[] = [];

    // Paleta
    const greenDark = '#24801C';
    const greenSoft = '#DDEFE4';
    const greenSoft2 = '#E9F6EE';
    const grayText = '#263238';

    // Helpers
    function roundedRect(x: number, y: number, w: number, h: number, r: number, fill?: string, stroke?: string) {
      doc.save();
      doc.roundedRect(x, y, w, h, r);
      if (fill) doc.fill(fill);
      if (stroke) doc.stroke(stroke);
      doc.restore();
    }

    function headerCell(txt: string, x: number, y: number, w: number, h: number) {
      roundedRect(x, y, w, h, 6, greenSoft);
      doc.font('Helvetica-Bold').fillColor(grayText).fontSize(11).text(txt, x + 10, y + 8, { width: w - 20 });
    }
    function valueCell(txt: string, x: number, y: number, w: number, h: number, fontSize: number = 12) {
      roundedRect(x, y, w, h, 6, '#EEF6F0');
      doc.font('Helvetica-Bold').fillColor(grayText).fontSize(fontSize).text(txt, x + 10, y + 10, { width: w - 20 });
    }

    return new Promise<Buffer>(async (resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Barras laterais
      const pageW = doc.page.width;
      const pageH = doc.page.height;
      doc.save().rect(0, 0, 24, pageH).fill(greenDark).restore();
      doc.save().rect(pageW - 24, 0, 24, pageH).fill(greenDark).restore();

      doc.on('pageAdded', () => {
        doc.rect(0, 0, 24, pageH).fill(greenDark);
        doc.rect(pageW - 24, 0, 24, pageH).fill(greenDark);

        // volta para a cor do texto
        doc.fillColor(grayText);
      })

      const assetsPath = path.resolve(__dirname, '..', '..', '..', '..' , 'assets', 'pdf-images');
      const imacLogoPath = path.resolve(assetsPath, "imac.png");
      const premLogoPath = path.resolve(assetsPath, "prem.png");

     //the images need to stay on center of the page with a gap between then
      const imacLogoWidth = 140;
      const premLogoWidth = 140;
      const gapBetweenLogos = 40; 

      const totalLogosWidth = imacLogoWidth + premLogoWidth + gapBetweenLogos;
      const startX = (pageW - totalLogosWidth) / 2;

      if (existsSync(imacLogoPath)) {     
        doc.image(imacLogoPath, startX, 40, { width: imacLogoWidth });
      }
      if (existsSync(premLogoPath)) {
        doc.image(premLogoPath, startX + imacLogoWidth + gapBetweenLogos, 40, { width: premLogoWidth });
      }
      
      doc.font('Helvetica-Bold')
        .fillColor(grayText)
        .fontSize(18)
        .text('DOCUMENTO DE CONFORMIDADE SOCIOAMBIENTAL', 36, 140, { width: pageW - 72, align: 'center' });

      const qrBoxW = 280, qrBoxH = 280;
      const qrBoxX = (pageW - qrBoxW) / 2;
      const qrBoxY = 180;
      roundedRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 16, greenSoft2);

      const qrSize = 220;
      const qrX = qrBoxX + (qrBoxW - qrSize) / 2;
      const qrY = qrBoxY + (qrBoxH - qrSize) / 2;


      const qrCodeDataUrl = await QRCode.toDataURL(`${process.env.URL_BASE_FRONTEND}/getDcsStatus?idPropriedade=${data.idPropriedade}`);
      const qrCodeImageBuffer = Buffer.from(qrCodeDataUrl.replace(/^data:image\/\w+;base64,/, ""), 'base64');
      doc.image(qrCodeImageBuffer, qrX, qrY, { width: qrSize, height: qrSize });

      // Blocos informativos
      const tableTop = qrBoxY + qrBoxH + 22;
      const colGap = 16;
      const leftX = 36;
      const colW = (pageW - 72) - colGap;
      const colWCar = colW * (2/3);
      const colWProp = colW * (1/3);
      const rightXProp = leftX + colWCar + colGap;

      headerCell('Cadastro Ambiental Rural (CAR)', leftX, tableTop, colWCar, 30);
      headerCell('Nome da Propriedade', rightXProp, tableTop, colWProp, 30);
      
      valueCell(data.car, leftX, tableTop + 32, colWCar, 34, 10);
      valueCell(data.nomePropriedade, rightXProp, tableTop + 32, colWProp, 34, 10);

      const t2Y = tableTop + 32 + 34 + 8;
      const col3 = (pageW - 72 - colGap * 2) / 3;
      const x1 = 36, x2 = x1 + col3 + colGap, x3 = x2 + col3 + colGap;

      headerCell('CPF/CNPJ', x1, t2Y, col3, 30);
      headerCell('Data Adesão ao PREM', x2, t2Y, col3, 30);
      headerCell('Código DCS', x3, t2Y, col3, 30);

      valueCell(data.cpfCnpj, x1, t2Y + 32, col3, 34);
      valueCell(data.dataAdesaoPrem, x2, t2Y + 32, col3, 34);
      valueCell(data.idPropriedade.toString(), x3, t2Y + 32, col3, 34);

      const paragrafos = [
        'AUTORIZAÇÃO DE COMERCIALIZAÇÃO TEMPORÁRIA (ACT) NÃO IMPLICA NO RECONHECIMENTO DE LIMITES, POSSE OU PROPRIEDADE, POR SE TRATAR DE PROCEDIMENTO DECLARATÓRIO, DE TOTAL RESPONSABILIDADE DO REQUERENTE. O CUMPRIMENTO DAS OBRIGAÇÕES ACORDADAS E DA EFETIVA REGENERAÇÃO DA ÁREA DESFLORESTADA, NO INTERIOR DO IMÓVEL EM QUESTÃO, SÃO REQUISITOS ESSENCIAIS PARA O DESBLOQUEIO DE EVENTUAIS LIMITAÇÕES EXISTENTES, O QUE GARANTE A EMISSÃO DA ACT E A REINSERÇÃO DO PRODUTOR NO MERCADO NO ÂMBITO DO PROGRAMA DE REINSERÇÃO E MONITORAMENTO (PREM). ENTRE AS OBRIGAÇÕES A SEREM CUMPRIDAS DURANTE A PERMANÊNCIA NO PROJETO, ESTÃO:',
        'I. SEGUIR AS ORIENTAÇÕES DETERMINADAS NO PLANO DE ADEQUAÇÃO PARA COMPROVAR O RESTABELECIMENTO DO DESMATAMENTO ILEGAL;',
        'II. O DESMATAMENTO ILEGAL DESCRITO NO ITEM I. REFERE-SE AO PROJETO DE MONITORAMENTO DO DESMATAMENTO NA AMAZÔNIA LEGAL POR SATÉLITE (PRODES), UM PROJETO DO INSTITUTO NACIONAL DE PESQUISAS ESPACIAIS (INPE), QUE REALIZA O MONITORAMENTO DO DESMATAMENTO POR CORTE RASO NA AMAZÔNIA LEGAL, CONSIDERANDO UMA ÁREA MÍNIMA DE 6,25 HECTARES. ESTE DOCUMENTO REFERE-SE AS SEGUINTES DETECÇÕES DE DESMATAMENTO DO TERRITÓRIO EM QUESTÃO:'
      ];

      let cursorY = t2Y + 32 + 34 + 18;
      paragrafos.forEach((paragrafo) => {
        //add margin to text on both sides
        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor(grayText)
          .text(paragrafo, 32, cursorY, {
            width: pageW - 32 * 2, 
            align: 'justify',
          });

        cursorY = doc.y + 16;
      });
      
      cursorY = doc.y + 12;

      roundedRect(36, cursorY, pageW - 72, 22, 6, greenSoft2);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(grayText)
        .text('AS SEGUINTES DETECÇÕES DE DESMATAMENTO DO TERRITÓRIO EM QUESTÃO:', 44, cursorY + 6);
      cursorY += 30;

      (data.deteccoes || []).forEach((d) => {
        doc.font('Helvetica').fontSize(10).fillColor(grayText).text(`${d.tipo} — ${d.areaHa}`, 44, cursorY + 6);
        cursorY += 26;
      });

      const obr = [
        'II. ENVIO DE DOCUMENTOS, FOTOS E INFORMAÇÕES, SEMPRE QUE SOLICITADO, POR VIAS ESTABELECIDAS PELO PROGRAMA, DE FORMA A COMPROVAR A CONTINUIDADE DO PROCESSO DE REGENERAÇÃO DA ÁREA OBJETO DESTE TERMO.',
        'III. IMPLANTAR, SEMPRE QUE APLICÁVEL, EM PRAZO NÃO SUPERIOR A 30 (TRINTA) DIAS, CONTADOS A PARTIR DA ASSINATURA DO PRESENTE DOCUMENTO, O ISOLAMENTO DA ÁREA OBJETO DESTE TERMO;',
        'IV. PRESTAR TODAS AS INFORMAÇÕES SOLICITADAS PELO IMAC, BEM COMO EM EVENTUAIS AUDITORIAS REALIZADAS PELO INSTITUTO, PARA VERIFICAÇÃO DO CUMPRIMENTO DO PLANO DE ADEQUAÇÃO;',
        'V. COMUNICAR AO IMAC QUAISQUER ALTERAÇÕES OCORRIDAS NA ÁREA ONDE FOI CONSTATADO O DESMATAMENTO DETECTADO, INCLUINDO ALTERAÇÕES NA PROPRIEDADE OU ALTERAÇÃO DA METRAGEM DO IMÓVEL.',
        'VI. MANTER TODAS AS SUAS ATIVIDADES REALIZADAS DEVIDAMENTE LICENCIADAS PERANTE OS ÓRGÃOS E/OU ENTIDADES RESPONSÁVEIS, BEM COMO SE ABSTER DE REALIZAR O USO PRODUTIVO DA ÁREA ONDE HOUVE O DESMATAMENTO ILEGAL, EXCETO PARA FINALIDADES DE RECUPERAÇÃO AMBIENTAL.',
        'VII. REALIZAR OS PAGAMENTOS DEVIDOS, NOS TERMOS E CONDIÇÕES ESTABELECIDOS NA PLATAFORMA DO PROGRAMA DO PRODUTOR, SUJEITANDO-SE AS PENALIDADES APLICÁVEIS.',
        'VIII. A VALIDADE DO PRESENTE DOCUMENTO ESTÁ CONDICIONADA AO CUMPRIMENTO DOS PRAZOS, DAS OBRIGAÇÕES ANTERIORMENTE CITADAS E AO PAGAMENTO DOS VALORES ESTABELECIDOS PELO PROGRAMA.',
      ];
      doc.font('Helvetica').fontSize(9).fillColor(grayText);
      obr.forEach((t) => {
        cursorY = doc.text(t, 36, cursorY + 10, { width: pageW - 72, align: 'justify' }).y;
      });

      doc.end();
    });
  }
}