export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = CustomError.name;
    this.statusCode = statusCode;
  }
}
