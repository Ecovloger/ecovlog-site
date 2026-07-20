const DEFAULT_MAX_DIMENSION = 1280;
const DEFAULT_TARGET_FILE_SIZE = 450 * 1024;
const DEFAULT_MIN_DIMENSION = 720;
const JPEG_QUALITIES = [0.6, 0.52, 0.45, 0.4] as const;

export type ImageOptimizationProgress = {
  current: number;
  total: number;
  fileName: string;
};

type OptimizeImageOptions = {
  maxDimension?: number;
  targetFileSize?: number;
  minDimension?: number;
};

type LoadedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
};

function replaceExtensionWithJpeg(fileName: string): string {
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  return `${baseName || "photo"}.jpg`;
}

function calculateDimensions(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } {
  const longestSide = Math.max(width, height);

  if (longestSide <= maxDimension) {
    return {
      width: Math.max(1, Math.round(width)),
      height: Math.max(1, Math.round(height)),
    };
  }

  const scale = maxDimension / longestSide;

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error(
              "Не удалось обработать фотографию. Попробуйте выбрать другой файл.",
            ),
          );
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

async function loadWithImageBitmap(file: File): Promise<LoadedImage> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });

  return {
    source: bitmap,
    width: bitmap.width,
    height: bitmap.height,
    close: () => bitmap.close(),
  };
}

function loadWithImageElement(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;

      if (!width || !height) {
        URL.revokeObjectURL(objectUrl);
        reject(
          new Error(
            `Не удалось определить размер фотографии «${file.name}».`,
          ),
        );
        return;
      }

      resolve({
        source: image,
        width,
        height,
        close: () => URL.revokeObjectURL(objectUrl),
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(
        new Error(
          `Не удалось открыть фотографию «${file.name}». Попробуйте сохранить её в формате JPEG и загрузить снова.`,
        ),
      );
    };

    image.src = objectUrl;
  });
}

async function loadImage(file: File): Promise<LoadedImage> {
  if (typeof createImageBitmap === "function") {
    try {
      return await loadWithImageBitmap(file);
    } catch {
      // Safari may decode some iPhone formats only through an HTMLImageElement.
    }
  }

  return loadWithImageElement(file);
}

export async function optimizeImageFile(
  file: File,
  options: OptimizeImageOptions = {},
): Promise<File> {
  const maxDimension =
    options.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const targetFileSize =
    options.targetFileSize ?? DEFAULT_TARGET_FILE_SIZE;
  const minDimension =
    options.minDimension ?? DEFAULT_MIN_DIMENSION;

  const loadedImage = await loadImage(file);

  try {
    let currentMaxDimension = Math.min(
      maxDimension,
      Math.max(loadedImage.width, loadedImage.height),
    );
    let smallestBlob: Blob | null = null;

    while (currentMaxDimension >= minDimension) {
      const dimensions = calculateDimensions(
        loadedImage.width,
        loadedImage.height,
        currentMaxDimension,
      );
      const canvas = document.createElement("canvas");
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      const context = canvas.getContext("2d", {
        alpha: false,
      });

      if (!context) {
        throw new Error(
          "Браузер не смог подготовить фотографию к отправке.",
        );
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(
        loadedImage.source,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      for (const quality of JPEG_QUALITIES) {
        const blob = await canvasToJpegBlob(canvas, quality);

        if (!smallestBlob || blob.size < smallestBlob.size) {
          smallestBlob = blob;
        }

        if (blob.size <= targetFileSize) {
          return new File(
            [blob],
            replaceExtensionWithJpeg(file.name),
            {
              type: "image/jpeg",
              lastModified: Date.now(),
            },
          );
        }
      }

      canvas.width = 1;
      canvas.height = 1;
      currentMaxDimension = Math.floor(currentMaxDimension * 0.82);
    }

    if (!smallestBlob) {
      throw new Error(
        `Не удалось оптимизировать фотографию «${file.name}».`,
      );
    }

    return new File(
      [smallestBlob],
      replaceExtensionWithJpeg(file.name),
      {
        type: "image/jpeg",
        lastModified: Date.now(),
      },
    );
  } finally {
    loadedImage.close();
  }
}

export async function optimizeImageFiles(
  files: File[],
  onProgress?: (progress: ImageOptimizationProgress) => void,
): Promise<File[]> {
  const optimizedFiles: File[] = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];

    onProgress?.({
      current: index + 1,
      total: files.length,
      fileName: file.name,
    });

    optimizedFiles.push(await optimizeImageFile(file));
  }

  return optimizedFiles;
}

export function getTotalFileSize(files: File[]): number {
  return files.reduce((total, file) => total + file.size, 0);
}
