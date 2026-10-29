/**
 * Media service — video playback info and promotional download requests.
 *
 * Milestone 1 has no video provider connected: `getPlayback` always returns
 * mode "mock" and the player UI renders a simulated stream. Download requests
 * return a fake job reference and never touch real files or watermarking.
 */
import type { Episode } from "@/types/domain";
import { mockDelay } from "./mock";

export interface PlaybackInfo {
  mode: "mock";
  videoUrl: string | null;
  aspectRatio: "portrait" | "landscape";
  message: string;
}

export interface DownloadRequest {
  ok: boolean;
  jobReference: string;
  message: string;
}

export interface MediaService {
  getPlayback(episode: Episode): Promise<PlaybackInfo>;
  requestDownload(episodeId: string): Promise<DownloadRequest>;
}

export const mediaService: MediaService = {
  async getPlayback(episode) {
    return mockDelay(
      {
        mode: "mock",
        videoUrl: episode.videoUrl,
        aspectRatio: episode.aspectRatio,
        message:
          "Demo player — episode video streams from a real provider once Milestone 2 connects one.",
      },
      120,
    );
  },

  async requestDownload(episodeId) {
    await mockDelay(null, 500);
    return {
      ok: true,
      jobReference: `PM-DL-${episodeId.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-6)}`,
      message:
        "Download queued as a demo. Real files with an embedded moving watermark are produced once the processing pipeline exists.",
    };
  },
};
