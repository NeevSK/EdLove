export interface EncodedMeshQrFrame {
  batchId: string;
  frameIndex: number;
  totalFrames: number;
  rawPayload: string;
}

export interface DecodedMeshBatch<T = any> {
  batchId: string;
  data: T;
  totalFrames: number;
}

/**
 * Encodes an object payload into chunked QR frames for cyclic animated scanning.
 */
export function encodePayloadToMeshQrFrames<T = any>(
  batchId: string,
  payload: T,
  chunkSize: number = 300,
): string[] {
  const serialized = JSON.stringify(payload);
  const base64Data =
    typeof btoa !== 'undefined'
      ? btoa(unescape(encodeURIComponent(serialized)))
      : Buffer.from(serialized, 'utf-8').toString('base64');

  const totalFrames = Math.max(1, Math.ceil(base64Data.length / chunkSize));
  const frames: string[] = [];

  for (let i = 0; i < totalFrames; i++) {
    const chunk = base64Data.slice(i * chunkSize, (i + 1) * chunkSize);
    // Format: MESH:batchId:index/total:chunk
    frames.push(`MESH:${batchId}:${i + 1}/${totalFrames}:${chunk}`);
  }

  return frames;
}

/**
 * Stateful decoder that collects frames from a camera stream until the full batch is assembled.
 */
export class AnimatedMeshQrDecoder {
  private batches: Map<string, { total: number; frames: Map<number, string> }> = new Map();

  /**
   * Parses an incoming raw QR string. Returns DecodedMeshBatch if complete, null otherwise.
   */
  public receiveFrame<T = any>(rawFrame: string): DecodedMeshBatch<T> | null {
    if (!rawFrame || !rawFrame.startsWith('MESH:')) {
      return null;
    }

    const firstColon = rawFrame.indexOf(':');
    const secondColon = rawFrame.indexOf(':', firstColon + 1);
    const thirdColon = rawFrame.indexOf(':', secondColon + 1);

    if (firstColon === -1 || secondColon === -1 || thirdColon === -1) {
      return null;
    }

    const batchId = rawFrame.slice(firstColon + 1, secondColon);
    const frameFraction = rawFrame.slice(secondColon + 1, thirdColon);
    const chunk = rawFrame.slice(thirdColon + 1);

    const [indexStr, totalStr] = frameFraction.split('/');
    const index = parseInt(indexStr ?? '1', 10);
    const total = parseInt(totalStr ?? '1', 10);

    if (isNaN(index) || isNaN(total) || total <= 0) {
      return null;
    }

    let batch = this.batches.get(batchId);
    if (!batch) {
      batch = { total, frames: new Map() };
      this.batches.set(batchId, batch);
    }

    batch.frames.set(index, chunk);

    // Check if all frames received
    if (batch.frames.size === total) {
      // Reassemble in order 1..total
      let fullBase64 = '';
      for (let i = 1; i <= total; i++) {
        const part = batch.frames.get(i);
        if (!part) return null; // Missing frame
        fullBase64 += part;
      }

      try {
        const decodedStr =
          typeof atob !== 'undefined'
            ? decodeURIComponent(escape(atob(fullBase64)))
            : Buffer.from(fullBase64, 'base64').toString('utf-8');

        const parsedData = JSON.parse(decodedStr);
        this.batches.delete(batchId); // Clean up memory
        return {
          batchId,
          data: parsedData as T,
          totalFrames: total,
        };
      } catch {
        return null;
      }
    }

    return null;
  }

  public getProgress(batchId: string): { received: number; total: number; percent: number } | null {
    const batch = this.batches.get(batchId);
    if (!batch) return null;
    const received = batch.frames.size;
    const total = batch.total;
    return {
      received,
      total,
      percent: Math.round((received / total) * 100),
    };
  }
}

export interface MeshStreamRateConfig {
  fps: number;
  intervalMs: number;
}

/**
 * Computes optimal animated QR display rate based on frame density and battery level.
 */
export function computeAdaptiveStreamRate(
  totalFrames: number,
  deviceBatteryLevel?: number,
): MeshStreamRateConfig {
  if (deviceBatteryLevel !== undefined && deviceBatteryLevel < 0.2) {
    return { fps: 10, intervalMs: 100 };
  }
  if (totalFrames > 20) {
    return { fps: 15, intervalMs: 66 };
  }
  return { fps: 20, intervalMs: 50 };
}
