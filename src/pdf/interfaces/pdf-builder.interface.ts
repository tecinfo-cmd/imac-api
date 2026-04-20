import { PdfTemplateInterface } from "./pdf-template.interface";

export interface PdfBuilderInterface {
  supports(template: PdfTemplateInterface): boolean;
  build(template: PdfTemplateInterface): Promise<Buffer>;
}