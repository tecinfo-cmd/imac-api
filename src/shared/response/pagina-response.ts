export class PaginaResponse<data>{
    data: data[];
    total: number;
    page: number;
    size: number;
}