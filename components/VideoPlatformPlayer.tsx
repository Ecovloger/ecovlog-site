"use client";

import { useMemo, useState } from "react";

type Platform = "youtube" | "vk";

type VideoPlatformPlayerProps = {
  youtubeUrl?: string | null;
  vkVideoUrl?: string | null;
  title: string;
};

function getYoutubeEmbedUrl(url?: string | null): string | null {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");
    let id: string | null = null;

    if (hostname === "youtu.be") {
      id = parsedUrl.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      if (parsedUrl.pathname.startsWith("/shorts/")) {
        id = parsedUrl.pathname.split("/shorts/")[1]?.split("/")[0] ?? null;
      } else if (parsedUrl.pathname.startsWith("/embed/")) {
        id = parsedUrl.pathname.split("/embed/")[1]?.split("/")[0] ?? null;
      } else {
        id = parsedUrl.searchParams.get("v");
      }
    }

    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

function extractIframeSource(value: string): string | null {
  const match = value.match(/src=["']([^"']+)["']/i);
  return match?.[1]?.replaceAll("&amp;", "&") ?? null;
}

function getVkEmbedUrl(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();
  const iframeSource = extractIframeSource(trimmedValue);
  const candidate = iframeSource ?? trimmedValue;

  try {
    const parsedUrl = new URL(candidate);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    if (!["vk.com", "vk.ru", "vkvideo.ru"].includes(hostname)) {
      return null;
    }

    if (parsedUrl.pathname.includes("video_ext.php")) {
      return parsedUrl.toString();
    }

    const videoMatch = parsedUrl.pathname.match(/video(-?\d+)_(\d+)/);

    if (!videoMatch) {
      return null;
    }

    const [, ownerId, videoId] = videoMatch;
    const embedUrl = new URL(`https://${hostname}/video_ext.php`);
    embedUrl.searchParams.set("oid", ownerId);
    embedUrl.searchParams.set("id", videoId);
    embedUrl.searchParams.set("hd", "3");

    return embedUrl.toString();
  } catch {
    return null;
  }
}

export default function VideoPlatformPlayer({
  youtubeUrl,
  vkVideoUrl,
  title,
}: VideoPlatformPlayerProps) {
  const youtubeEmbedUrl = useMemo(
    () => getYoutubeEmbedUrl(youtubeUrl),
    [youtubeUrl],
  );
  const vkEmbedUrl = useMemo(() => getVkEmbedUrl(vkVideoUrl), [vkVideoUrl]);

  const availablePlatforms = useMemo<Platform[]>(() => {
    const platforms: Platform[] = [];

    if (youtubeEmbedUrl) {
      platforms.push("youtube");
    }

    if (vkEmbedUrl) {
      platforms.push("vk");
    }

    return platforms;
  }, [youtubeEmbedUrl, vkEmbedUrl]);

  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(
    youtubeEmbedUrl ? "youtube" : "vk",
  );

  const activePlatform = availablePlatforms.includes(selectedPlatform)
    ? selectedPlatform
    : availablePlatforms[0];

  const activeSrc =
    activePlatform === "youtube" ? youtubeEmbedUrl : vkEmbedUrl;

  if (!activeSrc) {
    return (
      <div className="flex aspect-[9/16] w-full items-center justify-center rounded-3xl border border-white/10 bg-black px-6 text-center text-white/55">
        Видео временно недоступно
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="aspect-[9/16] w-full overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_24px_70px_rgba(0,0,0,0.42)]">
        <iframe
          key={activeSrc}
          src={activeSrc}
          title={`${title} — ${activePlatform === "youtube" ? "YouTube" : "VK Видео"}`}
          className="h-full w-full"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock"
          allowFullScreen
          loading="eager"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      {availablePlatforms.length > 1 && (
        <div className="mt-4 flex justify-center">
          <div className="inline-flex rounded-full border border-white/15 bg-white/[0.07] p-1 shadow-[0_12px_35px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
            <button
              type="button"
              onClick={() => setSelectedPlatform("youtube")}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                activePlatform === "youtube"
                  ? "bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.18)]"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              YouTube
            </button>

            <button
              type="button"
              onClick={() => setSelectedPlatform("vk")}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                activePlatform === "vk"
                  ? "bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.18)]"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              VK Видео
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
