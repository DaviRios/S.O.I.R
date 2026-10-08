import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { ValidationError } from '../../core/errors';
import type { MediaStorage } from './media-storage';

export class LocalMediaStorage implements MediaStorage {
  private readonly root: string;

  constructor(root: string) {
    this.root = resolve(root);
  }

  async put(path: string, contents: Buffer): Promise<void> {
    const target = this.absolute(path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, contents);
  }

  get(path: string): Promise<Buffer> {
    return readFile(this.absolute(path));
  }

  private absolute(path: string): string {
    const target = resolve(this.root, path);
    const relativePath = relative(this.root, target);
    if (
      !relativePath ||
      relativePath.startsWith('..') ||
      relativePath.includes(':')
    ) {
      throw new ValidationError('Caminho de mídia inválido');
    }
    return target;
  }
}
