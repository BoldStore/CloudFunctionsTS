class ExpressError extends Error {
  public message;
  public statusCode;
  public error;

  constructor(message: any, statusCode: any, error: any = null) {
    super();
    this.message = message;
    this.statusCode = statusCode;
    this.error = error;
  }
}

export = ExpressError;
