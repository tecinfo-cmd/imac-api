import { Module } from "@nestjs/common";
import { PdfService } from "./pdf-service";
import { PdfKitActPdfBuilder } from "./providers/pdfkit/builders/pdfkit-dcs-pdf-builder";
import { PdfKitPdfGenerator } from "./providers/pdfkit/pdfkit-pdf-generator";
import { PdfKitTermoCompromissoPdfBuilder } from "./providers/pdfkit/builders/pdfkit-termo-compromisso-pdf-builder";

@Module({
  controllers: [],
  providers: [
    PdfService,
    PdfKitActPdfBuilder,
    PdfKitTermoCompromissoPdfBuilder,
    {
      provide: 'PDF_GENERATOR',
      useFactory: (
        actPdfBuilder: PdfKitActPdfBuilder,
        termoCompromissoBuilder: PdfKitTermoCompromissoPdfBuilder
      ) => new PdfKitPdfGenerator([actPdfBuilder, termoCompromissoBuilder]),
      inject: [PdfKitActPdfBuilder, PdfKitTermoCompromissoPdfBuilder]
    },
  ],
  exports: [PdfService],
})
export class PdfModule{}