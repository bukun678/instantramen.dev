'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { IconRefresh, IconUpload, IconX } from '@tabler/icons-react';
import { ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export type UploadStatus = 'idle' | 'uploading' | 'uploaded' | 'error';

export interface ImageUploaderValue {
  id: string;
  preview: string;
  url?: string;
  key?: string;
  status: UploadStatus;
  size?: number;
  error?: string;
}

export interface ImageUploaderProps {
  allowMultiple?: boolean;
  maxImages?: number;
  maxSizeMB?: number;
  uploadUrl?: string;
  acceptedMimeTypes?: readonly string[];
  disabled?: boolean;
  presentation?: 'tiles' | 'dropzone';
  title?: string;
  emptyHint?: string;
  className?: string;
  defaultPreviews?: string[];
  onChange?: (items: ImageUploaderValue[]) => void;
}

interface UploadItem extends ImageUploaderValue {
  file?: File;
  uploadKey?: string;
}

const formatBytes = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(2)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};

const MIME_TYPE_LABELS: Record<string, string> = {
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
};

type UploadedImage = {
  url: string;
  key?: string;
};

async function assertImageCanBeDecoded(file: File) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      const isValid = bitmap.width > 0 && bitmap.height > 0;
      bitmap.close();
      if (isValid) return;
    } catch {
      // Fall through to the broadly supported HTMLImageElement decoder.
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    await new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        if (image.naturalWidth > 0 && image.naturalHeight > 0) {
          resolve();
          return;
        }
        reject(new Error('Image dimensions are invalid.'));
      };
      image.onerror = () => reject(new Error('Image decoding failed.'));
      image.src = objectUrl;
    });
  } catch {
    throw new Error(
      'This file could not be decoded as a PNG, JPEG, or WebP image.'
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

const uploadImageFile = async (file: File, uploadUrl: string) => {
  await assertImageCanBeDecoded(file);

  const formData = new FormData();
  formData.append('files', file);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  let result: any;
  try {
    result = await response.json();
  } catch {
    throw new Error('The upload service returned an invalid response.');
  }

  if (!response.ok) {
    throw new Error(
      result?.error || result?.message || `Upload failed (${response.status}).`
    );
  }

  if (result.success && result.data?.url) {
    return {
      url: result.data.url as string,
      key: result.data.key as string | undefined,
    } satisfies UploadedImage;
  }

  if (result.code === 0 && result.data?.urls?.length) {
    return {
      url: result.data.urls[0] as string,
    } satisfies UploadedImage;
  }

  throw new Error(result.error || result.message || 'Upload failed.');
};

export function ImageUploader({
  allowMultiple = false,
  maxImages = 1,
  maxSizeMB = 10,
  uploadUrl = '/api/storage/upload-image',
  acceptedMimeTypes,
  disabled = false,
  presentation = 'tiles',
  title,
  emptyHint,
  className,
  defaultPreviews,
  onChange,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isInitializedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const isInternalChangeRef = useRef(false);
  const replaceTargetIdRef = useRef<string | null>(null);
  const dragCounterRef = useRef(0);
  const objectUrlsRef = useRef(new Set<string>());
  const [isDragActive, setIsDragActive] = useState(false);

  // 使用 defaultPreviews 初始化 items，只在组件挂载时执行一次
  const [items, setItems] = useState<UploadItem[]>(() => {
    if (defaultPreviews?.length) {
      return defaultPreviews.map((url, index) => ({
        id: `preset-${url}-${index}`,
        preview: url,
        url,
        status: 'uploaded' as UploadStatus,
      }));
    }
    return [];
  });

  const maxCount = allowMultiple ? maxImages : 1;
  const maxBytes = maxSizeMB * 1024 * 1024;
  const acceptedMimeTypeSet = useMemo(
    () => (acceptedMimeTypes ? new Set(acceptedMimeTypes) : null),
    [acceptedMimeTypes]
  );
  const accept = acceptedMimeTypes?.join(',') || 'image/*';
  const acceptedFormatLabel = useMemo(
    () =>
      acceptedMimeTypes?.map(
        (mimeType) =>
          MIME_TYPE_LABELS[mimeType] || mimeType.replace('image/', '')
      ) || ['Images'],
    [acceptedMimeTypes]
  ).join(', ');

  const createObjectPreview = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    objectUrlsRef.current.add(objectUrl);
    return objectUrl;
  };

  const releaseObjectPreview = (preview?: string) => {
    if (!preview || !objectUrlsRef.current.has(preview)) return;
    URL.revokeObjectURL(preview);
    objectUrlsRef.current.delete(preview);
  };

  const getFileValidationError = (file: File) => {
    const hasAllowedType = acceptedMimeTypeSet
      ? acceptedMimeTypeSet.has(file.type)
      : file.type?.startsWith('image/');

    if (!hasAllowedType) {
      return acceptedMimeTypes?.length
        ? `"${file.name}" must be ${acceptedMimeTypes
            .map((type) => type.replace('image/', '').toUpperCase())
            .join(', ')}.`
        : `"${file.name}" is not a supported image.`;
    }

    if (file.size > maxBytes) {
      return `"${file.name}" exceeds the ${maxSizeMB}MB limit.`;
    }

    return null;
  };

  // 更新 onChange ref
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // 同步 defaultPreviews 的变化（只在外部变化时同步，避免循环）
  useEffect(() => {
    // 跳过初始化
    if (!isInitializedRef.current) {
      return;
    }

    // 如果是内部变化触发的，跳过
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }

    const defaultUrls = defaultPreviews || [];

    // 使用函数式更新来访问最新的 items
    setItems((currentItems) => {
      const currentUrls = currentItems
        .filter((item) => item.status === 'uploaded' && item.url)
        .map((item) => item.url as string);

      // 比较当前 items 和 defaultPreviews 是否一致
      const isSame =
        defaultUrls.length === currentUrls.length &&
        defaultUrls.every((url, index) => url === currentUrls[index]);

      // 只有当不一致时才返回新的 items
      if (!isSame) {
        return defaultUrls.map((url, index) => ({
          id: `preset-${url}-${index}`,
          preview: url,
          url,
          status: 'uploaded' as UploadStatus,
        }));
      }

      return currentItems;
    });
  }, [defaultPreviews]);

  // Keep object URLs alive for as long as their preview is visible. Revoking
  // them in an effect that depends on `items` would invalidate active previews
  // every time an upload changes state.
  useEffect(() => {
    const objectUrls = objectUrlsRef.current;
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.clear();
    };
  }, []);

  // 当 items 变化时触发 onChange，但跳过初始化时的调用
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      return;
    }

    // 标记这是内部变化
    isInternalChangeRef.current = true;

    onChangeRef.current?.(
      items.map(({ id, preview, url, key, status, size, error }) => ({
        id,
        preview,
        url,
        key,
        status,
        size,
        error,
      }))
    );
  }, [items]);

  const replaceItems = (pairs: Array<{ id: string; file: File }>) => {
    pairs.forEach(({ id, file }) => {
      const uploadKey = `${Date.now()}-${Math.random()}`;
      const nextPreview = createObjectPreview(file);

      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          releaseObjectPreview(item.preview);
          return {
            ...item,
            preview: nextPreview,
            file,
            size: file.size,
            url: undefined,
            key: undefined,
            error: undefined,
            status: 'uploading' as UploadStatus,
            uploadKey,
          };
        })
      );

      uploadImageFile(file, uploadUrl)
        .then((uploaded) => {
          setItems((prev) =>
            prev.map((item) => {
              if (item.id !== id) return item;
              if (item.uploadKey !== uploadKey) return item; // stale upload
              releaseObjectPreview(item.preview);
              return {
                ...item,
                preview: uploaded.url,
                url: uploaded.url,
                key: uploaded.key,
                status: 'uploaded' as UploadStatus,
                file: undefined,
                error: undefined,
              };
            })
          );
        })
        .catch((caughtError: unknown) => {
          const message =
            caughtError instanceof Error
              ? caughtError.message
              : 'Upload failed.';
          toast.error(message);
          setItems((prev) =>
            prev.map((item) => {
              if (item.id !== id) return item;
              if (item.uploadKey !== uploadKey) return item; // stale upload
              return {
                ...item,
                status: 'error' as UploadStatus,
                error: message,
              };
            })
          );
        })
        .finally(() => {
          if (inputRef.current) inputRef.current.value = '';
        });
    });
  };

  const handleFiles = (selectedFiles: File[]) => {
    if (disabled) return;

    const replaceTargetId = replaceTargetIdRef.current;
    if (replaceTargetId) {
      // reset immediately to avoid sticky replace mode
      replaceTargetIdRef.current = null;

      const file = selectedFiles[0];
      if (!file) return;
      const validationError = getFileValidationError(file);
      if (validationError) {
        toast.error(validationError);
        if (inputRef.current) inputRef.current.value = '';
        return;
      }
      replaceItems([{ id: replaceTargetId, file }]);
      return;
    }

    const availableSlots = maxCount - items.length;
    const filesToAdd = selectedFiles
      .filter((file) => {
        const validationError = getFileValidationError(file);
        if (validationError) {
          toast.error(validationError);
          return false;
        }
        return true;
      })
      .slice(0, Math.max(availableSlots, 0));

    if (!filesToAdd.length) {
      // when full: replace from the end backwards
      if (items.length) {
        const normalized = selectedFiles.filter(
          (file) => !getFileValidationError(file)
        );
        if (!normalized.length) return;

        const k = Math.min(normalized.length, items.length);
        const tail = items.slice(-k);
        const pairs: Array<{ id: string; file: File }> = [];

        for (let i = 0; i < k; i += 1) {
          const targetId = tail[tail.length - 1 - i]?.id;
          const file = normalized[i];
          if (targetId && file) pairs.push({ id: targetId, file });
        }

        if (pairs.length) {
          replaceItems(pairs);
        }
      }

      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    if (availableSlots < selectedFiles.length) {
      toast.message(
        `Only the first ${filesToAdd.length} image(s) will be added`
      );
    }

    const newItems = filesToAdd.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      preview: createObjectPreview(file),
      file,
      size: file.size,
      status: 'uploading' as UploadStatus,
      uploadKey: `${Date.now()}-${Math.random()}`,
    }));

    setItems((prev) => [...prev, ...newItems]);

    // Upload in parallel
    Promise.all(
      newItems.map(async (item) => {
        try {
          const uploaded = await uploadImageFile(item.file as File, uploadUrl);
          setItems((prev) => {
            const next = prev.map((current) => {
              if (current.id === item.id) {
                if (current.uploadKey && item.uploadKey) {
                  if (current.uploadKey !== item.uploadKey) return current; // stale upload
                }
                // Revoke the blob URL since we have the uploaded URL now
                releaseObjectPreview(current.preview);
                return {
                  ...current,
                  preview: uploaded.url,
                  url: uploaded.url,
                  key: uploaded.key,
                  status: 'uploaded' as UploadStatus,
                  file: undefined,
                  error: undefined,
                };
              }
              return current;
            });
            return next;
          });
        } catch (caughtError: unknown) {
          const message =
            caughtError instanceof Error
              ? caughtError.message
              : 'Upload failed.';
          toast.error(message);
          setItems((prev) => {
            const next = prev.map((current) => {
              if (current.id !== item.id) return current;
              if (current.uploadKey && current.uploadKey !== item.uploadKey) {
                return current; // stale upload
              }
              return {
                ...current,
                status: 'error' as UploadStatus,
                error: message,
              };
            });
            return next;
          });
        }
      })
    );

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;
    handleFiles(selectedFiles);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const clipboardItems = Array.from(event.clipboardData?.items || []);
    const files = clipboardItems
      .filter((item) => item.kind === 'file')
      .map((item) => item.getAsFile())
      .filter(Boolean) as File[];

    if (!files.length) return;
    event.preventDefault();
    handleFiles(files);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current += 1;
    setIsDragActive(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    if (!isDragActive) setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragActive(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragActive(false);

    const files = Array.from(event.dataTransfer?.files || []);
    if (!files.length) return;
    handleFiles(files);
  };

  const handlePreviewError = (id: string) => {
    const message =
      'The uploaded image preview could not be loaded. Replace the image and try again.';
    toast.error(message);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.status !== 'error'
          ? {
              ...item,
              error: message,
              key: undefined,
              status: 'error' as UploadStatus,
              url: undefined,
            }
          : item
      )
    );
  };

  const handleRemove = (id: string) => {
    if (disabled) return;
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      const removed = prev.find((item) => item.id === id);
      releaseObjectPreview(removed?.preview);
      return next;
    });
  };

  const openFilePicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const openReplacePicker = (id: string) => {
    if (disabled) return;
    replaceTargetIdRef.current = id;
    openFilePicker();
  };

  const countLabel = useMemo(
    () => `${items.length}/${maxCount}`,
    [items.length, maxCount]
  );

  return (
    <div
      className={cn(
        'relative',
        presentation === 'dropzone' &&
          'border-border/40 bg-muted/35 hover:bg-muted/50 overflow-hidden rounded-2xl border transition-colors',
        disabled && 'cursor-not-allowed opacity-70',
        isDragActive &&
          'ring-primary/30 ring-offset-background ring-2 ring-offset-2',
        className
      )}
      aria-disabled={disabled}
      onPaste={handlePaste}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragActive && !disabled && (
        <div className="bg-primary/[0.06] pointer-events-none absolute inset-0 z-30 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-card/90 text-foreground rounded-full px-4 py-2 text-sm font-medium shadow-sm">
            Drop to upload
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={allowMultiple}
        onChange={handleSelect}
        disabled={disabled}
        className="hidden"
      />

      {title && presentation !== 'dropzone' && (
        <div className="text-foreground flex items-center justify-between text-sm font-medium">
          <div className="flex items-center gap-2">
            <ImageIcon className="text-primary h-4 w-4" />
            <span>{title}</span>
            <span className="text-primary text-xs">({countLabel})</span>
          </div>
        </div>
      )}

      {presentation === 'dropzone' ? (
        <div className="relative min-h-[190px] w-full sm:min-h-[220px]">
          {items.length === 0 ? (
            <button
              type="button"
              className="focus-visible:ring-ring flex min-h-[190px] w-full flex-col items-center justify-center gap-1.5 px-6 py-6 text-center transition focus-visible:ring-2 focus-visible:outline-none sm:min-h-[220px]"
              onClick={openFilePicker}
              disabled={disabled}
              aria-label={title || 'Upload reference image'}
            >
              <span className="bg-card grid h-11 w-11 place-items-center rounded-xl shadow-sm">
                <IconUpload className="text-primary h-5 w-5" />
              </span>
              <span className="text-foreground mt-1.5 text-base font-semibold">
                {title || 'Upload reference image'}
              </span>
              <span className="text-muted-foreground text-xs">
                {emptyHint || 'Click or drag one image here'}
              </span>
              <span className="text-muted-foreground text-xs">
                {acceptedFormatLabel} · Max {maxSizeMB}MB
              </span>
            </button>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex w-full flex-col">
                <div className="bg-background/35 relative flex min-h-[190px] items-center justify-center sm:min-h-[220px]">
                  <img
                    src={item.preview}
                    alt="Reference"
                    onError={() => handlePreviewError(item.id)}
                    className="h-[190px] w-full object-contain p-3 sm:h-[220px]"
                  />
                  {item.status === 'uploading' && (
                    <div className="bg-background/85 text-foreground absolute inset-0 z-10 flex items-center justify-center text-xs font-medium backdrop-blur-sm">
                      Uploading...
                    </div>
                  )}
                  {item.status === 'error' && (
                    <div className="bg-destructive/85 text-destructive-foreground pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-xs font-medium">
                      Failed
                    </div>
                  )}
                </div>
                <div
                  data-upload-actions
                  className="bg-card/70 flex min-h-11 items-center justify-between gap-3 px-3 py-2"
                >
                  <span className="text-muted-foreground truncate text-[11px] tabular-nums">
                    {item.size ? formatBytes(item.size) : 'Reference image'}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:bg-muted hover:text-foreground h-9 gap-1.5 px-2.5"
                      onClick={() => openReplacePicker(item.id)}
                      disabled={disabled || item.status === 'uploading'}
                      aria-label="Upload a new image to replace"
                    >
                      <IconRefresh className="h-4 w-4" />
                      <span>Replace</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-9 gap-1.5 px-2.5"
                      onClick={() => handleRemove(item.id)}
                      disabled={disabled || item.status === 'uploading'}
                      aria-label="Remove image"
                    >
                      <IconX className="h-4 w-4" />
                      <span>Remove</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div
          className={cn(
            'flex flex-wrap gap-4',
            allowMultiple ? 'flex-wrap' : 'flex-nowrap'
          )}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="group border-border bg-muted/50 hover:border-border hover:bg-muted relative overflow-hidden rounded-xl border p-1 shadow-sm transition"
            >
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={item.preview}
                  alt="Reference"
                  onError={() => handlePreviewError(item.id)}
                  className="h-32 w-32 rounded-lg object-cover"
                />
                {item.size && (
                  <span className="bg-background text-muted-foreground absolute bottom-2 left-2 rounded-md px-2 py-1 text-[10px] font-medium">
                    {formatBytes(item.size)}
                  </span>
                )}
                {item.status !== 'uploading' && (
                  <div className="bg-background/55 absolute inset-0 z-10 flex items-center justify-center opacity-0 backdrop-blur-[1px] transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="bg-background/80 text-foreground hover:bg-background/90 focus-visible:ring-ring h-10 w-10 rounded-full shadow-sm backdrop-blur focus-visible:ring-2"
                      onClick={() => openReplacePicker(item.id)}
                      disabled={disabled}
                      aria-label="Upload a new image to replace"
                    >
                      <IconRefresh className="h-5 w-5" />
                    </Button>
                  </div>
                )}
                {item.status === 'uploading' && (
                  <div className="bg-background/85 text-foreground absolute inset-0 z-10 flex items-center justify-center text-xs font-medium">
                    Uploading...
                  </div>
                )}
                {item.status === 'error' && (
                  <div className="bg-destructive/85 text-destructive-foreground pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-xs font-medium">
                    Failed
                  </div>
                )}
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 z-20 h-7 w-7"
                  onClick={() => handleRemove(item.id)}
                  disabled={disabled}
                  aria-label="Remove image"
                >
                  <IconX className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {items.length < maxCount && (
            <div className="group border-border bg-muted/50 hover:border-border hover:bg-muted relative overflow-hidden rounded-xl border border-dashed p-1 shadow-sm transition">
              <div className="relative overflow-hidden rounded-lg">
                <button
                  type="button"
                  className="flex h-32 w-32 flex-col items-center justify-center gap-2"
                  onClick={openFilePicker}
                  disabled={disabled}
                >
                  <div className="border-border flex h-10 w-10 items-center justify-center rounded-full border border-dashed">
                    <IconUpload className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">Upload</span>
                  <span className="text-primary text-xs">
                    Max {maxSizeMB}MB
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!title && presentation !== 'dropzone' && (
        <div className="text-muted-foreground text-xs">{emptyHint}</div>
      )}
    </div>
  );
}
