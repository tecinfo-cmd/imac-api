export abstract class BaseTemplate<T>{
    data: T;
    abstract generate(): string

    constructor(data: T){
        this.data = data;
    }
}
