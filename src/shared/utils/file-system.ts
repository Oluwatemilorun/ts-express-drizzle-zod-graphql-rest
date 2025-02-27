import fs from 'node:fs';
import asyncFs from 'node:fs/promises';
import path from 'node:path';

export async function outputFile(
  filePath: string,
  fileContent:
    | string
    | NodeJS.ArrayBufferView
    | Iterable<string | NodeJS.ArrayBufferView>
    | AsyncIterable<string | NodeJS.ArrayBufferView>,
): Promise<void> {
  try {
    await asyncFs.writeFile(filePath, fileContent);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw err;
    }
    await asyncFs.mkdir(path.dirname(filePath), { recursive: true });
    await asyncFs.writeFile(filePath, fileContent);
  }
}

export function outputFileSync(
  filePath: string,
  fileContent: string | NodeJS.ArrayBufferView,
): void {
  try {
    fs.writeFileSync(filePath, fileContent);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw err;
    }
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, fileContent);
  }
}
