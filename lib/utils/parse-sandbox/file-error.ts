export default class FileError extends Error {
  public path: string;

  constructor(message: string, path: string) {
    super(message);

    this.path = path;
  }
}
