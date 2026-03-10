import { Module } from "@nestjs/common";
import { D4Sign } from "./providers/d4sign";
import { PdfModule } from "../pdf/pdf.module";
import { AssinaturaService } from "./assinatura.service";
import { ConfigModule, ConfigService } from "@nestjs/config";


@Module({
  controllers: [],
  imports: [PdfModule, ConfigModule],
  providers: [
    AssinaturaService,
    {
      provide: 'I_SERVICO_ASSINATURA',
      useFactory: (configService: ConfigService) => new D4Sign(configService),
      inject: [ConfigService]
    }
    ],
  exports: [AssinaturaService],
})
export class AssinaturaModule{}