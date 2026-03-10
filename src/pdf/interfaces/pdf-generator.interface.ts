import { PdfTemplateInterface } from "./pdf-template.interface";

export interface PdfGeneratorInterface{
  generate(template: PdfTemplateInterface): Promise<Buffer>
}