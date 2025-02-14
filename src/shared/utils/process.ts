/**
 * Gets all relevant process information for the currently running process.
 */
export function getProcessInfo(): {
  pid: number;
  uid: number | null;
  gid: number | null;
  cwd: string;
  execPath: string;
  version: string;
  argv: string[];
  memoryUsage: NodeJS.MemoryUsage;
} {
  return {
    pid: process.pid,
    uid: process.getuid ? process.getuid() : null,
    gid: process.getgid ? process.getgid() : null,
    cwd: process.cwd(),
    execPath: process.execPath,
    version: process.version,
    argv: process.argv,
    memoryUsage: process.memoryUsage(),
  };
}
