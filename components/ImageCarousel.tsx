"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { urlFor } from "@/sanity/lib/image";

type SanityImage = {
  _key?: string;
  asset?: {
    _ref?: string;
    _id?: string;
  };
};

type ImageCarouselProps = {
  images?: SanityImage[] | null;
  title?: string | null;
};

function hasValidImageAsset(
  image: SanityImage | null | undefined,
): image is SanityImage {
  if (!image?.asset) {
    return false;
  }

  return Boolean(image.asset._ref || image.asset._id);
}

function getImageUrl(
  image: SanityImage,
  isActive: boolean,
): string | null {
  try {
    const width = isActive ? 900 : 420;
    const height = isActive ? 1200 : 560;
    const quality = isActive ? 78 : 60;

    return urlFor(image)
      .width(width)
      .height(height)
      .fit("max")
      .quality(quality)
      .auto("format")
      .url();
  } catch {
    return null;
  }
}

export default function ImageCarousel({
  images,
  title,
}: ImageCarouselProps) {
  const validImages = useMemo(() => {
    if (!Array.isArray(images)) {
      return [];
    }

    return images.filter(hasValidImageAsset);
  }, [images]);

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (validImages.length === 0) {
      setActive(0);
      return;
    }

    if (active >= validImages.length) {
      setActive(0);
    }
  }, [active, validImages.length]);

  if (validImages.length === 0) {
    return null;
  }

  const next = () => {
    setActive((current) => (current + 1) % validImages.length);
  };

  const previous = () => {
    setActive(
      (current) =>
        (current - 1 + validImages.length) % validImages.length,
    );
  };

  const getPosition = (index: number) => {
    const length = validImages.length;

    let position = (index - active + length) % length;

    if (position > length / 2) {
      position -= length;
    }

    return position;
  };

  return (
    <div
      className="
        relative
        flex
        h-[560px]
        w-full
        items-center
        justify-center
        md:h-[650px]
      "
    >
      <div
        className="
          relative
          h-[470px]
          w-[300px]
          md:h-[580px]
          md:w-[400px]
        "
      >
        <AnimatePresence>
          {validImages.map((image, index) => {
            const position = getPosition(index);

            if (Math.abs(position) > 3) {
              return null;
            }

            const isActive = position === 0;
            const imageUrl = getImageUrl(image, isActive);

            if (!imageUrl) {
              return null;
            }

            return (
              <motion.div
                key={image._key ?? `${imageUrl}-${index}`}
                onClick={() => {
                  if (isActive) {
                    next();
                  } else {
                    setActive(index);
                  }
                }}
                drag={isActive ? "x" : false}
                dragConstraints={{
                  left: 0,
                  right: 0,
                }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) {
                    next();
                  }

                  if (info.offset.x > 80) {
                    previous();
                  }
                }}
                animate={{
                  x: position * 100,
                  scale:
                    position === 0
                      ? 1
                      : 0.88 - Math.abs(position) * 0.05,
                  rotate:
                    position === 0
                      ? 0
                      : position > 0
                        ? 8
                        : -8,
                  opacity:
                    position === 0
                      ? 1
                      : Math.max(
                          0.3,
                          1 - Math.abs(position) * 0.25,
                        ),
                  zIndex: 100 - Math.abs(position),
                }}
                transition={{
                  type: "spring",
                  stiffness: 170,
                  damping: 24,
                }}
                className="
                  absolute
                  inset-0
                  flex
                  items-center
                  justify-center
                "
              >
                <div
                  className="
                    relative
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-[32px]
                    border
                    border-white/20
                    bg-white/10
                    p-4
                    shadow-[0_30px_80px_rgba(0,0,0,0.5)]
                    backdrop-blur-2xl
                  "
                >
                  <div className="relative h-full w-full">
                    <Image
                      src={imageUrl}
                      alt={title?.trim() || "Изображение публикации"}
                      fill
                      sizes="(max-width: 768px) 300px, 400px"
                      priority={isActive && index === 0}
                      unoptimized
                      className="rounded-2xl object-contain"
                    />
                  </div>

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      rounded-[32px]
                      bg-gradient-to-br
                      from-white/20
                      via-transparent
                      to-transparent
                    "
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {validImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={previous}
            aria-label="Предыдущее изображение"
            className="
              absolute
              left-3
              top-1/2
              h-12
              w-12
              -translate-y-1/2
              rounded-full
              border
              border-white/20
              bg-white/10
              text-2xl
              backdrop-blur-xl
              transition
              hover:bg-white/20
              md:left-5
            "
          >
            ‹
          </button>

          <button
            type="button"
            onClick={next}
            aria-label="Следующее изображение"
            className="
              absolute
              right-3
              top-1/2
              h-12
              w-12
              -translate-y-1/2
              rounded-full
              border
              border-white/20
              bg-white/10
              text-2xl
              backdrop-blur-xl
              transition
              hover:bg-white/20
              md:right-5
            "
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
