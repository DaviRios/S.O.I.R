export interface MediaStorage {
  put(path: string, contents: Buffer, contentType: string): Promise<void>;
  get(path: string): Promise<Buffer>;
}
