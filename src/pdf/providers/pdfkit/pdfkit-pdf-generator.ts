import { Injectable } from "@nestjs/common";
import { PdfTemplateInterface } from "../../../pdf/interfaces/pdf-template.interface";
import { PdfGeneratorInterface } from "../../../pdf/interfaces/pdf-generator.interface";
import { PdfBuilderInterface } from "../../../pdf/interfaces/pdf-builder.interface";

@Injectable()
export class PdfKitPdfGenerator implements PdfGeneratorInterface{
  constructor(private readonly builders: PdfBuilderInterface[]){}

  async generate(template: PdfTemplateInterface): Promise<Buffer> {
    const builder = this.builders.find(b => b.supports(template));
    if(!builder){
      throw new Error(`Nenhum builder encontrado para o template ${template.name}`);
    }
    return await builder.build(template);
  }
}