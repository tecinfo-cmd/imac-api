import AppError from './app-error';

class NegocioException extends AppError {

    status: string;
    message: string;

    constructor(status: any, message: string){
        super(message, status);
        this.status = status;
        this.message = message;
    }
}

export default NegocioException;
