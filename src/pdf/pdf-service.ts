import { Inject, Injectable } from "@nestjs/common";
import { PdfGeneratorInterface } from "./interfaces/pdf-generator.interface";
import { PdfTemplateInterface } from "./interfaces/pdf-template.interface";

@Injectable()
export class PdfService {
  constructor(
    @Inject('PDF_GENERATOR')
    private readonly generator: PdfGeneratorInterface,
  ){}

  async generate(template: PdfTemplateInterface): Promise<Buffer>{
    return await this.generator.generate(template);
  }
}