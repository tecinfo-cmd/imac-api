import { DocumentoOrientativo } from "src/documento-orientativo/entity/documento-orientativo.entity";

export class DocumentoOrientativoEnviado{
  constructor(
    readonly documentoOrientativo: DocumentoOrientativo
  ){}
}

