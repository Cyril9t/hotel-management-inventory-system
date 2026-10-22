import { env } from "../config/env";

export async function checkWorkerHealth(timeoutMs = 2000): Promise<boolean> {
  try {
    const res = await fetch(`${env.WORKER_HEALTH_URL}/health`, {
      signal: AbortSignal.timeout(timeoutMs),
    });
    return res.ok;
  } catch {
    return false; // unreachable = not healthy
  }
}
