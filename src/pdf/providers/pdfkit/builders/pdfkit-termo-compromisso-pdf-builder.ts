import { PdfTemplateInterface } from "src/pdf/interfaces/pdf-template.interface";
import { PdfBuilderInterface } from "../../../interfaces/pdf-builder.interface";
import * as PDFDocument from "pdfkit";
import { existsSync } from "fs";
import * as path from "node:path";
import { TermoCompromissoPdfTemplate } from "../../../templates/termo-compromisso-pdf-template";
// Está assim por o type da lib está com problema para usar com import
const extenso = require("extenso");

export class PdfKitTermoCompromissoPdfBuilder implements PdfBuilderInterface {
  supports(template: PdfTemplateInterface): boolean {
    return template instanceof TermoCompromissoPdfTemplate;
  }

  async build(template: TermoCompromissoPdfTemplate): Promise<Buffer> {
    const { data } = template;
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 36, left: 36, right: 36, bottom: 36 },
    });

    const chunks: Buffer[] = [];

    // Paleta
    const titleColor = '#1B4660';
    const lineColor = '#302547';
    const textColor = '#000000';
    const headerTableColor = '#C7D9EE';

    const assetsPath = path.resolve(__dirname, '..', '..', '..', '..' , 'assets', 'pdf-images');
    const imacLogoPath = path.resolve(assetsPath, "imac.png");
    const footerImagePath = path.resolve(assetsPath, "footer.png");
    const watermarksImagePath = path.resolve(assetsPath, "watermarks.png");
    const imacLogoWidth = 140;
    const imacLogoHeigth = 60;
    const leftMargin = 60;
    let actualY = 90 + imacLogoHeigth;
    const pagePermittedWidth = doc.page.width - 140;

    function drawHeader() {
      doc.save();
      doc.roundedRect(0, 40, doc.page.width, 15);
      doc.fill(lineColor)
      if (existsSync(imacLogoPath)) {
        doc.image(imacLogoPath, (doc.page.width - imacLogoWidth) / 2, 70, { width: imacLogoWidth, height: imacLogoHeigth });
      }
      doc.restore();
    }

    function drawFooter() {
      if (existsSync(footerImagePath)) {
        doc.image(footerImagePath, -4, doc.page.height - 32, { width: doc.page.width + 7 });
      }
      if (existsSync(watermarksImagePath)) {
        doc.image(watermarksImagePath, doc.page.width - 73, doc.page.height - 162, { width: 70, height: 128 });
      }
      doc.save();
    }

    function checkPageBreakAndAddHeight(neededHeight: number) {
      if (doc.y + neededHeight > doc.page.height - doc.page.margins.bottom - 40) { // 40 for footer margin
        doc.addPage();
      } else {
        actualY += neededHeight;
      }
    };

    return new Promise<Buffer>(async (resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.on('pageAdded', () => {
        doc.save();
        actualY = 90 + imacLogoHeigth;
        drawHeader();
        drawFooter();
        doc.restore();
      })

      drawHeader();
      drawFooter();

      //text
      doc
        .font('Helvetica-Bold')
        .fillColor(titleColor)
        .text("TERMO DE COMPROMISSO DO PROGRAMA DE REINSERÇÃO EMONITORAMENTO DO IMAC - PREM", leftMargin, actualY, { align: 'center', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(50);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Pelo presente instrumento, o Produtor Rural compromissário ao Programa de Reinserção e Monitoramento (“PRODUTOR”) e o Instituto Mato-grossense da Carne (“IMAC”) devidamente identificados e qualificados conforme dados abaixo:", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(50);

      doc.font('Helvetica-Bold');
      doc.table({
        data: [
          [
            { text: "DADOS DO PRODUTOR COMPROMISSÁRIO AO PROGRAMA DE REINSERÇÃO E MONITORAMENTO (“PRODUTOR”)", colSpan: 6, backgroundColor: headerTableColor }
          ],
          [
            { text: "Razão Social/Nome:" },
            { text: `${data.produtor.nome}`, colSpan: 5, font: { fontSize: 20 } }
          ],
          [
            //Formatar cpf ou cnpj (pode vir um ou outro) para formato com pontuação
            { text: "CNPJ/CPF:" },
            { text: `${data.produtor.cpfCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5').replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')}`, colSpan: 5 }
          ],
          [
            { text: "Telefone:" },
            { text: `${data.produtor.telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}`, colSpan: 2 },
            { text: "E-mail:" },
            { text: `${data.produtor.email}`, colSpan: 2 }
          ],
          [
            { text: "Endereço:" },
            { text: `${data.produtor.endereco}`, colSpan: 5 }
          ],
          [
            { text: "Complemento:" },
            { text: `${data.produtor.complemento}` },
            { text: "Cidade:" },
            { text: `${data.produtor.cidade}` },
            { text: "Estado:" },
            { text: `${data.produtor.estado}` }
          ],
          [
            { text: "Representante:" },
            { text: `${data.produtor.representante}` },
            { text: "CPF:" },
            { text: `${data.produtor.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')}` },
            { text: "Cargo:" },
            { text: `${data.produtor.cargo}` }
          ],
        ],
        position: { x: leftMargin, y: actualY + 10 },
        maxWidth: pagePermittedWidth
      });

      actualY += 260

      doc.table({
        data: [
          [
            { text: "DADOS DO INSTITUTO MATO-GROSSENSE DA CARNE – IMAC", colSpan: 6, backgroundColor: headerTableColor }
          ],
          [
            { text: "Razão Social/Nome:" },
            { text: "Instituto Mato-grossense da Carne – IMAC", colSpan: 5, font: { fontSize: 20 } }
          ],
          [
            { text: "CNPJ/CPF:" },
            { text: "25.264.440/0001-87", colSpan: 5 }
          ],
          [
            { text: "Telefone:" },
            { text: "(65) 3057-9291", colSpan: 2 },
            { text: "E-mail:" },
            { text: "", colSpan: 2 }
          ],
          [
            { text: "Endereço:" },
            { text: "Avenida Doutor Hélio Ribeiro, 525, Alvorada, 78048-250 – Edifício Helbor Dual Business", colSpan: 5 }
          ],
          [
            { text: "Complemento:" },
            { text: "Sala 701" },
            { text: "Cidade:" },
            { text: "Cuiabá" },
            { text: "Estado:" },
            { text: "Mato Grosso" }
          ],
          [
            { text: "Representante:" },
            { text: "Caio Penido Dalla Vecchia" },
            { text: "CPF:" },
            { text: "152.971.408-70" },
            { text: "Cargo:" },
            { text: "Presidente" }
          ],
        ],
        position: { x: leftMargin, y: actualY + 10 },
        maxWidth: pagePermittedWidth
      });

      checkPageBreakAndAddHeight(220);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Considerando que:", leftMargin, actualY, { align: 'justify', width: pagePermittedWidth });;

      checkPageBreakAndAddHeight(10);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("É objetivo e direito de todos manterem e usufruírem um Meio Ambiente equilibrado para uso comum da sociedade com intuito de se obter uma vida digna, saudável e de qualidade, propiciando um desenvolvimento sustentável das atividades executadas, sendo de competência do Poder Público defender e preservar o Meio Ambiente, nos termos do artigo 225 da Constituição Federal;", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(80);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("O Código Florestal brasileiro, instituído pela Lei 12.651/2012, define, em seu artigo 12, o percentual mínimo de vegetação nativa a ser mantido por imóveis rurais em áreas de Reserva Legal, definindo o artigo 66 da referida norma as condições legais para o restabelecimento em caso de descumprimento da legislação;", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(65);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("O artigo 17, §3º, da Lei 12.561/2012, determina a suspensão imediata das atividades realizadas em área de Reserva Legal desmatada irregularmente após 22 de julho de 2008 (“Desmatamento Ilegal”), definindo, com as finalidades do artigo 51 da referida lei, o embargo realizado pelas autoridades competentes como medida administrativa adequada para impedir a continuidade das irregularidades encontradas, sendo os infratores sujeitos às penalidades legais aplicáveis, independentemente de condições especiais de minoração destas penalidades;", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(105);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Diversos representantes do setor privado envolvidos na cadeia produtiva do setor firmaram um Termo de Ajustamento de Conduta – TAC com o Ministério Público Federal – MPF, comprometendo-se a não adquirir produtos oriundos de imóveis com inconformidades socioambientais, em especial o desmatamento ilegal , o trabalho análogo a escravidão e as áreas de especial proteção;", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(75);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("O IMAC, o Ministério Público Federal e a Secretaria de Estado de Meio Ambiente - SEMA firmaram Acordo de Cooperação nº 0360/2024/SEMA/MT cujo objeto estabelece açõesdos signatários visando promover a regularização ambiental dos imóveis rurais provenientes do Passaporte Verde e/ou do Programa de Reinserção e Monitoramento – PREM;", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(75);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("O Programa de Reinserção do IMAC permite a reintegração da propriedade com desmatamento ilegal e/ou embargada por desmatamento ilegal no comércio regular e sustentável de produtos, mediante o compromisso de regeneração de vegetação observando os critérios validados pela SEMA e no Protocolo de Monitoramento de Fornecedores de Gado do Ministério Público Federal e o monitoramento pelo IMAC e a SEMA;", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(90);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("O PRODUTOR se compromete a adotar as medidas estabelecidas neste instrumento (definidas conforme os critérios validados pela SEMA e no Protocolo de Monitoramento de Fornecedores de Gado do Ministério Público Federal) para regularizar as inconformidades identificadas em diagnóstico prévio realizado pela tecnologia/Plataforma (validada pelo IMAC e licenciada onerosamente ao PRODUTOR pela empresa AGROTOOLS GESTÃO E MONITORAMENTO GEO-ESPACIAL DE RISCOS - CNPJ/ME sob n° 08.808.179/0001-10) e as informações fornecidas pela SEMA; e", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(105);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Ao concordar em submeter-se às condições estabelecidas no considerando “iv” acima, e após validação prévia da Plataforma, o PRODUTOR terá direito à obtenção do Demonstrativo de Conformidade Socioambiental – DCS, para comercialização e negociação de seus produtos com os entes citados no Considerando “(v)”;", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(65);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("O processo de restabelecimento pelo Produtor e cumprimento das condições estabelecidas neste Termo, é requisito essencial para o desbloqueio das eventuais limitações existentes e emissão de autorização temporária para a comercialização, além de eventual suspensão administrativa dos embargos expedidos pela SEMA.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(65);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("O PRODUTOR e o IMAC, em conjunto denominados “Partes” e individualmentedenominado “Parte, com a anuência da SEMA, firmam o presente Termo de Compromisso`(“Termo”), que vigorará com as seguintes condições e disposições:", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(60);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Objetivo. O PRODUTOR concorda em aderir ao Programa de Reinserção e Monitoramento, cuja adesão se dará por meio da utilização da Plataforma, possuindo o Programa o intuito de, mediante o cumprimento do Plano de Adequação previsto neste instrumento: (i) reinserir e monitorar a propriedade com inconformidade socioambiental para o restabelecimento do PRODUTOR ao mercado; e (ii) promover os meios visando a regularização ambiental junto à SEMA.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(90);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Em decorrência da adesão ao Programa de Reinserção e Monitoramento, o PRODUTOR obriga-se a adotar as medidas previstas neste Termo (incluindo o Plano de Adequação) e na própria Plataforma que lhe será disponibilizado, além de cumprir com as demais orientações cabíveis do IMAC e/ou da SEMA.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(65);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("O PRODUTOR está ciente de que deverá realizar o pagamento no valor de R$ 250,00(duzentos e cinquenta reais) por hectare desmatado, calculado de acordo com asinformações inseridas na Plataforma e pagos de acordo com as orientações estabelecidasneste documento, ficando sujeito, sem prejuízo ao disposto na cláusula 4, em caso de atrasos, à suspensão temporária da Autorização de Comercialização Temporária.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(90);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("O pagamento estabelecido na cláusula 1.2. acima é classificado como indenização pelo danoambiental cometido, podendo ser parcelado nos termos previstos na Plataforma.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(45);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Ficam estabelecidos os seguintes descontos ao valor disto no item 1.2 acima: Propriedades rurais até 15 módulos fiscais e com desmatamento ilegal identificado pela Plataforma menor ou igual a 20 hectares – isenção total sobre o valor de R$ 250,00 por hectare desmatado;", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(65);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Propriedades rurais até 15 módulos fiscais e com desmatamento ilegal identificado pela Plataforma maior que 20 hectares e menor ou igual a 50 hectares – 50% de desconto sobre o valor de R$ 250,00 por hectare desmatado;", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(50);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Propriedades maiores que 15 módulos fiscais e com desmatamento ilegal identificado pela Plataforma menor ou igual a 50 hectares – 50% de desconto sobre o valor de R$ 250,00 por hectare desmatado.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(50);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Sem prejuízo da obrigação estabelecida no item 1.2 acima, o PRODUTOR deve adimplir, no prazo máximo de 10 (dez) dias a partir da assinatura deste instrumento, mediante transferência e/ou depósito no Banco ____, Agência ____, Conta Corrente n____ (titularidade do IMAC), a quantia de:", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(65);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("R$ 1.420,00 (um mil reais) para a finalidade do PREM – Regenera, cuja finalidade é o acompanhamento da regeneração da vegetação desmatada ilegalmente/embargos;", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(45);

      // doc
      //   .font('Helvetica')
      //   .fillColor(textColor)
      //   .text("R$ xxx (xxxxxx), para a finalidade do PREM – Monitora, para o monitoramento dos critérios estabelecidos no protocolo de monitoramento de fornecedores de gado de acordo com os critérios lá estabelecidos;", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      // checkPageBreakAndAddHeight(50);

      // doc
      //   .font('Helvetica')
      //   .fillColor(textColor)
      //   .text("R$ xxx (xxxxxx), para a finalidade de elaboração de parecer de revisão do Cadastro Ambiental Rural – CAR e consequente encaminhamento para análise prioritária por equipe dedicada no órgão ambiental, visando evitar geração de pendências junto ao órgão ambiental.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      // checkPageBreakAndAddHeight(65);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Realizado o pagamento, o PRODUTOR deve apresentar ao IMAC o comprovante de pagamento para emissão do voucher para a realização do diagnóstico e a liberação da licença de uso da plataforma e o monitoramento pelo prazo de 05 (cinco) anos.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(50);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Plano de Adequação. Na hipótese de identificadas de desmatamento ilegal e/ou embargos pela SEMA, o PRODUTOR se compromete a executar o Plano de Adequação nos termos previstos nesta cláusula.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(50);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("O PRODUTOR, conforme as informações apresentadas na Plataforma, baseado em indicadores emitidos por autoridades competentes e/ou tecnologias dedicadas, acrescido daqueles validadas pelo PRODUTOR, se compromete a isolar e regenerar a(s) áreas(s) descritas nos incisos abaixo, ora denominada “Área(s) em Regeneração”:", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(75);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text(`Preservação Permanente Degrada e/ou de Reposição Florestal): ${data.areaArenegerar} (${extenso(data.areaArenegerar, { number: { decimalSeparator: 'dot' }})}) hectares;` , leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      //e Coordenada(s) da(s) Área(s) em Regeneração:

      checkPageBreakAndAddHeight(40);
      
      // doc
      //   .font('Helvetica-Bold')
      //   .text(`Longitude                                 Latitude`, 150, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      // checkPageBreakAndAddHeight(15);
      
      // for (let i = 0; i <= 20; i++) {
      //   doc
      //     .font('Helvetica-Bold')
      //     .text(`-15.6081661                                 -56.0807557`, 150, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      //   checkPageBreakAndAddHeight(15);
      // }

      // checkPageBreakAndAddHeight(20);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Na execução do presente Plano de Adequação, constituem obrigações do PRODUTOR: Seguir as orientações determinadas pelo IMAC na(s) Área(s) em Regeneração; Enviar documentos, fotos e informações, sempre que solicitado, de forma a comprovar a continuidade do processo de regeneração da Área objeto deste Termo.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(75);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Implantar, em prazo não superior a 60 (sessenta) dias, contados a partir da assinatura do presente documento, o isolamento da(s) Área(s) em Regeneração descritas neste Termo;", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(50);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Isolar e não utilizar na(s) Área(s) em Regeneração, devendo se abster de realizar qualquer atividade e/ou exploração da área citada;", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(35);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Prestar todas as informações solicitadas pelo IMAC no âmbito de utilização da Plataforma, bem como em eventuais auditorias realizadas pelo IMAC para verificação do cumprimento do Plano de Adequação;", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(50);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Comunicar ao IMAC quaisquer alterações ocorridas na(s) Área(s) em Regeneração, incluindo, mas se limitando, a alteração de propriedade, incêndio, invasões ou alteração da metragem do imóvel;", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(50);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Manter todas as suas atividades realizadas devidamente licenciadas e regulares perante os órgãos e/ou entidades responsáveis, bem como se abster de realizar o uso produtivo na(s) Área(s) em Regeneração, exceto para finalidades de recuperação ambiental;", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(60);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Qualquer alteração na propriedade, o PRODUTOR deverá realizar a retificação do CAR; Realizar os pagamentos devidos, nos termos e condições estabelecidos na Plataforma, sujeitando-se as penalidades aplicáveis caso não o faça;", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(50);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("No caso de embargos em qualquer Área em Regeneração, iniciar, imediatamente, a recuperação das Áreas de Preservação Permanente Degradadas (APPD) e Reserva Legal (RL), objeto do termo de embargos;", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(50);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("No caso de embargos em qualquer Área em Regeneração, adimplir os valores alusivos a reposição florestal das áreas desmatadas fora de reserva legal, em cumprimento ao PRADA apresentado no SIMCAR.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(50);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Em propriedade com o percentual mínimo ou com excedente de vegetação nativa em reserva legal constatado pelo órgão ambiental, o PRODUTOR deverá manter o monitoramento dos critérios nos termos do protocolo de monitoramento dos produtores de gado, e, neste caso, pode realizar o uso produtivo da área, desde que observada a legislação vigente, incluindo sem limitar de resguardar a reserva legal e a área de preservação permanente.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(95);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("O PRODUTOR deve adotar todas as medidas previstas neste Plano de Adequação para o restabelecimento do comercio regular de produtos com o setor privado vinculados ao Protocolo de Monitoramento de Fornecedores de Gado do Ministério Público Federal e/ou suspensão dos embargos, obrigando-se a cumpri-las pelo período de 5 (cinco) anos contados a partir da assinatura deste Termo ou em tempo inferior, caso seja comprovadamente constatado que as irregularidades foram sanadas.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(105);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("O IMAC, por si e/ou por terceiros, a qualquer tempo poderá monitorar e auditar as atividades do PRODUTOR na Área em Regeneração para verificar o adimplemento das obrigações estipuladas neste Termo, podendo, para tanto, solicitar relatórios técnicos a serem apresentados pelo PRODUTOR.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(65);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Autorização de Comercialização ao celebrar o presente Termo, concordando com as condições impostas, o PRODUTOR terá direito ao recebimento de uma Autorização de Comercialização Ativa, para atestar que o PRODUTOR está em processo de restabelecimento e, desde que se mantenha cumprindo as obrigações definidas no Plano de Adequação e neste Termo, apto a celebrar negócios com empresas e pessoas interessadas em adquirir seus produtos.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(90);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("A Autorização de Comercialização será concedida após a primeira autovistoria a ser realizada de acordo com as orientações da Plataforma, ressalvada a necessidade do levantamento das informações necessárias e assinatura do presente Termo, permanecendo ativa durante todo o período de restabelecimento do PRODUTOR na Plataforma, ressalvadas as hipóteses de cancelamento previstas neste documento.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(80);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Caso o PRODUTOR descumpra o prazo para envio de documentos, conforme disposto no Plano de Adequação ou orientações emitidas pela Plataforma ou IMAC, e não regularize o envio em até 10 (dez) dias contados da data de envio original do documento, estará sujeito a suspensão da Autorização de Comercialização até o restabelecimento da situação.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(80);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Penalidades. Caso seja constatado o descumprimento de quaisquer das obrigações estabelecidas neste Termo, em especial aquelas contidas nas cláusulas “1.”,”2.”, “3.2.” acima, o IMAC comunicará o PRODUTOR para esclarecimentos e saneamento da pendência (quando for o caso) no prazo de até 10 (dez) dias contados do recebimento da comunicação.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(80);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("A ausência de esclarecimentos ou o não restabelecimento no prazo estipulado na cláusula “4.” acima sujeitará o PRODUTOR de forma alternativa, à critério exclusivo do IMAC: (i) na suspensão do PRODUTOR no Programa de Reinserção; (ii) na suspensão oucancelamento da Autorização de Comercialização Provisória estabelecida no item 4 deste Termo; (iii) na exclusão do Programa de Reinserção ou (iv) na inelegibilidade para adesão ao Programa de Reinserção pelo prazo de 2 (dois) anos contados da data da ocorrência do descumprimento.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(105);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Não obstante o disposto na cláusula “4.1.”, à critério exclusivo do SEMA, revigorar os embargos incidentes na Área em Regeneração.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(40);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Constitui hipótese de exclusão do Programa de Reinserção, independentemente das demais penalidades previstas neste Termo, e a critério exclusivo do IMAC, a constatação de atos de má-fé do PRODUTOR que possam vir a prejudicar o bom andamento do Programa de Reinserção, como por exemplo, mas não se limitando a prestação de informações falsas ou inverídicas de forma deliberada ou a reiteração de desmatamento nas propriedades em Área em Regeneração, exceto aquelas previamente autorizadas pelo órgão ambiental estadual sem prejuízo as penalidades legais aplicáveis.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(120);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Limitação de responsabilidade. A celebração do presente Termo e o cumprimento das cláusulas aqui previstas não diminui ou desobriga, de qualquer modo, o cumprimento e a estrita observância, pelo PRODUTOR, às demais obrigações e compromissos previstos na legislação ambiental pertinente, tampouco à adoção de todas as medidas cabíveis em face dos responsáveis pelas ilegalidades.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(80);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("O cumprimento deste Termo e do seu Plano de Adequação, não exime o PRODUTOR de suas responsabilidades perante o órgão ambiental estadual/federal aplicável, devendo Programa de Reinserção ser interpretado como uma forma de restabelecer o PRODUTOR, não podendo ser utilizado em hipótese alguma com finalidades distintas e/ou contrárias ao estabelecido pelo IMAC.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(80);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("O IMAC não se responsabiliza por quaisquer garantias ou isenções quanto a eventuais sanções dos entes públicos responsáveis, que continuarão, nos limites de suas atribuições legais, executando as fiscalizações que lhes são cabíveis, devendo quaisquer contestações em relação a estas atuações ser direcionadas, pelo PRODUTOR, exclusivamente ao ente público responsável.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(80);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("O uso da Plataforma não garante ao PRODUTOR quaisquer isenções quanto a sanções anteriores em relação à Área objeto do presente Termo, devendo as infrações ser resolvidas nos termos dispostos pelo ente público responsável conforme da legislação aplicável.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(65);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("As áreas de desmatamento e/ou embargos detectadas no âmbito da análise efetuada pela Plataforma por meio do relatório representam os números extraídos de indicadores emitidos por autoridades competentes e/ou tecnologias dedicadas e podem, por fatores externos inerentes à própria natureza da operação, não refletirem a situação atualizada do imóvel ou da localidade apontada, restringindo-se o processo de restabelecimento à área efetivamente detectada e de ciência do PRODUTOR no momento da concordância deste Termo.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(105);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Dúvidas. O PRODUTOR poderá solucionar e esclarecer dúvidas através dos canais disponibilizados na Plataforma, incluindo, mas não se limitando, a lista de perguntas frequentes, vídeos orientativos e demais meios de contato disponíveis, sendo o principal canal de contato pelo e-mail: ajuda@agrotools.com.br.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(70);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Priorização na análise do CAR. Nos termos do Acordo de Cooperação nº 0360/2024/SEMA/MT, a Secretaria de Estado de Meio Ambiente do Estado de Mato Grosso (SEMA/MT), compromete-se a priorizar a análise dos Cadastros Ambientais Rurais (CARs) que ingressarem por meio do Programa de Reinserção e Monitoramento até sua validação.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(70);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("A SEMA/MT criará dentro do âmbito da Coordenadoria de Cadastro e Regularização Ambiental (CCAR) fila específica de análise dos Cadastros Ambientais Rurais (CARs) inseridos no Programa de Reinserção e Monitoramento do IMAC que deverão ser analisados por equipe dedicada ao PREM.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth })

      checkPageBreakAndAddHeight(70);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Vigência e validade. O presente Termo permanecerá vigente durante todo o período de utilização da Plataforma e manutenção do PRODUTOR no Programa de Reinserção.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(45);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Aditivo. O presente Termo representa o entendimento das Partes e somente poderá ser alterado mediante aditivo expressamente formalizado entre estas.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(35);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Foro e resolução de conflitos. Eventuais resoluções de conflito ou dúvidas referentes a este Termo e que não possam ser resolvidas amigavelmente entre as Partes serão dirimidas no foro de Cuiabá, Estado do Mato Grosso.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(60);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Por estarem justas e acordadas com as disposições aqui estabelecidas, celebram as Partes o presente Termo em 2 (duas) vias de igual teor e forma e na presença de duas testemunhas abaixo qualificadas:", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(60);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Cuiabá, _____ de __________ de _______.", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(50);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text(`____________________________        ____________________________
Instituto Mato-grossense da Carne -        PRODUTOR
IMAC`, 75, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(60);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text("Testemunhas:", leftMargin, actualY + 10, { align: 'justify', width: pagePermittedWidth });

      checkPageBreakAndAddHeight(30);

      doc
        .font('Helvetica')
        .fillColor(textColor)
        .text(`____________________________        ____________________________
Nome:                                                      Nome:
CPF:                                                        CPF:`,
          75, actualY + 10, { align: 'justify', width: pagePermittedWidth });
      doc.end();
    });
  }
}