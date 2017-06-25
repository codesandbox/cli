declare module 'detect-port' {
  interface DetectPort {
    (port?: number): Promise<number>;
    (port: number | undefined, callback: (
      err: Error,
      _port: number,
    ) => void): void;
  }
  const detectPort: DetectPort;
  export = detectPort;
}
