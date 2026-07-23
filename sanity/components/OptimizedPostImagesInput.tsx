'use client'

import {useCallback, useRef, useState} from 'react'
import {
  ArrayOfObjectsInputProps,
  insert,
  setIfMissing,
  useClient,
} from 'sanity'

import {apiVersion} from '../env'

const MAX_IMAGES = 20
const MAX_LONG_EDGE = 2000
const WEBP_QUALITY = 0.82

const wrapperStyle = {
  display: 'grid',
  gap: '12px',
} as const

const panelStyle = {
  display: 'grid',
  gap: '10px',
  padding: '14px',
  border: '1px solid rgba(128, 128, 128, 0.35)',
  borderRadius: '8px',
  background: 'rgba(128, 128, 128, 0.08)',
} as const

const buttonStyle = {
  width: 'fit-content',
  minHeight: '36px',
  padding: '8px 14px',
  border: 0,
  borderRadius: '6px',
  font: 'inherit',
  fontWeight: 600,
  cursor: 'pointer',
  color: 'white',
  background: '#2276fc',
} as const

const textStyle = {
  margin: 0,
  fontSize: '13px',
  lineHeight: 1.45,
  opacity: 0.75,
} as const

const statusStyle = {
  margin: 0,
  fontSize: '13px',
  lineHeight: 1.45,
  fontWeight: 600,
} as const

type ImageAssetDocument = {
  _id: string
}

type OptimizedImageItem = {
  _key: string
  _type: 'image'
  asset: {
    _type: 'reference'
    _ref: string
  }
}

function createArrayKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replaceAll('-', '').slice(0, 12)
  }

  return `${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

function getOutputFileName(fileName: string): string {
  const nameWithoutExtension = fileName.replace(/\.[^.]+$/, '') || 'image'
  return `${nameWithoutExtension}.webp`
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error(`Не удалось прочитать файл «${file.name}».`))
    }

    image.src = objectUrl
  })
}

function canvasToWebpBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Браузер не смог создать оптимизированный WebP.'))
          return
        }

        resolve(blob)
      },
      'image/webp',
      WEBP_QUALITY,
    )
  })
}

async function optimizeImage(file: File): Promise<File> {
  const image = await loadImage(file)
  const longestEdge = Math.max(image.naturalWidth, image.naturalHeight)
  const scale = longestEdge > MAX_LONG_EDGE ? MAX_LONG_EDGE / longestEdge : 1
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Не удалось подготовить изображение к сжатию.')
  }

  canvas.width = width
  canvas.height = height
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, width, height)

  const blob = await canvasToWebpBlob(canvas)

  return new File([blob], getOutputFileName(file.name), {
    type: 'image/webp',
    lastModified: Date.now(),
  })
}

export function OptimizedPostImagesInput(
  props: ArrayOfObjectsInputProps,
) {
  const {onChange, value} = props
  const client = useClient({apiVersion})
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const currentCount = Array.isArray(value) ? value.length : 0

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) {
        return
      }

      const remainingSlots = MAX_IMAGES - currentCount

      if (remainingSlots <= 0) {
        setStatus(`Уже добавлено максимальное количество: ${MAX_IMAGES}.`)
        return
      }

      const selectedFiles = files.slice(0, remainingSlots)

      setIsUploading(true)
      setStatus(`Подготовка изображений: 0 из ${selectedFiles.length}`)

      try {
        const uploadedItems: OptimizedImageItem[] = []

        for (let index = 0; index < selectedFiles.length; index += 1) {
          const sourceFile = selectedFiles[index]

          setStatus(
            `Сжатие и загрузка: ${index + 1} из ${selectedFiles.length}`,
          )

          const optimizedFile = await optimizeImage(sourceFile)
          const asset = await client.assets.upload<ImageAssetDocument>(
            'image',
            optimizedFile,
            {
              filename: optimizedFile.name,
              contentType: optimizedFile.type,
            },
          )

          uploadedItems.push({
            _key: createArrayKey(),
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: asset._id,
            },
          })
        }

        const patches = uploadedItems.map((item) =>
          insert([item], 'after', [-1]),
        )

        onChange([setIfMissing([]), ...patches])

        const ignoredCount = files.length - selectedFiles.length
        setStatus(
          ignoredCount > 0
            ? `Загружено ${uploadedItems.length}. Ещё ${ignoredCount} не добавлено из-за лимита в ${MAX_IMAGES} изображений.`
            : `Готово: загружено ${uploadedItems.length} оптимизированных изображений.`,
        )
      } catch (error) {
        setStatus(
          error instanceof Error
            ? `Ошибка: ${error.message}`
            : 'Не удалось загрузить изображения.',
        )
      } finally {
        setIsUploading(false)

        if (inputRef.current) {
          inputRef.current.value = ''
        }
      }
    },
    [client, currentCount, onChange],
  )

  return (
    <div style={wrapperStyle}>
      <div style={panelStyle}>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={isUploading || currentCount >= MAX_IMAGES}
          onChange={(event) => {
            void handleFiles(Array.from(event.currentTarget.files ?? []))
          }}
          style={{display: 'none'}}
        />

        <button
          type="button"
          disabled={isUploading || currentCount >= MAX_IMAGES}
          onClick={() => inputRef.current?.click()}
          style={{
            ...buttonStyle,
            opacity:
              isUploading || currentCount >= MAX_IMAGES ? 0.55 : 1,
            cursor:
              isUploading || currentCount >= MAX_IMAGES
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          {isUploading
            ? 'Изображения загружаются…'
            : 'Загрузить и автоматически сжать'}
        </button>

        <p style={textStyle}>
          Перед отправкой в Sanity фотография уменьшается максимум до{' '}
          {MAX_LONG_EDGE} px по длинной стороне и сохраняется в WebP. Можно
          выбрать сразу несколько файлов. Добавлено: {currentCount} из{' '}
          {MAX_IMAGES}.
        </p>

        {status ? <p style={statusStyle}>{status}</p> : null}
      </div>

      {props.renderDefault(props)}
    </div>
  )
}
