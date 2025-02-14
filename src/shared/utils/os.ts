import os from 'os';

/**
 * Gets all relevant OS information for the currently running process.
 * @returns {mixed} - TODO: add return description.
 */
export function getOsInfo(): {
  loadavg: number[];
  uptime: number;
} {
  return {
    loadavg: os.loadavg(),
    uptime: os.uptime(),
  };
}
