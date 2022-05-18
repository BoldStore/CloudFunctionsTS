/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable require-jsdoc */
class ExpressError extends Error {
  public message: string;
  public statusCode: number;
  public error: any;

  constructor(message: string, statusCode: number, error: any = null) {
    super();
    this.message = message;
    this.statusCode = statusCode;
    this.error = error;
  }
}

export = ExpressError;
