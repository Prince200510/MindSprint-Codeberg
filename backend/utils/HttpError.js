class HttpError extends Error {
  constructor(message, errorCode) {
    super(message); // This adds a `message` property to this class i.e HttpError
    this.code = errorCode; // This adds a `code` property to this class i.e HttpError
  }
}

export { HttpError };
