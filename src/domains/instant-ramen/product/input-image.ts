import type { StorageManager } from '@/extensions/storage';
import { getStorageService } from '@/shared/services/storage';

export const INSTANT_RAMEN_INPUT_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

export const INSTANT_RAMEN_INPUT_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const;

export type InstantRamenInputImageMimeType =
  (typeof INSTANT_RAMEN_INPUT_IMAGE_MIME_TYPES)[number];

export type InstantRamenInputImageErrorCode =
  | 'empty_input_image'
  | 'input_image_too_large'
  | 'unsupported_input_image_type'
  | 'input_image_type_mismatch'
  | 'invalid_input_image'
  | 'input_image_not_found'
  | 'input_image_upload_failed'
  | 'public_storage_url_unavailable'
  | 'storage_unavailable';

export class InstantRamenInputImageError extends Error {
  constructor(
    public readonly code: InstantRamenInputImageErrorCode,
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'InstantRamenInputImageError';
  }
}

type DetectedInputImage = {
  extension: 'jpg' | 'png' | 'webp';
  mimeType: InstantRamenInputImageMimeType;
};

type InputImageStorage = Pick<
  StorageManager,
  'exists' | 'getPublicUrl' | 'uploadFile'
>;

const MIME_TYPE_DETAILS: Record<
  InstantRamenInputImageMimeType,
  DetectedInputImage
> = {
  'image/jpeg': { extension: 'jpg', mimeType: 'image/jpeg' },
  'image/png': { extension: 'png', mimeType: 'image/png' },
  'image/webp': { extension: 'webp', mimeType: 'image/webp' },
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function hasBytes(bytes: Uint8Array, expected: readonly number[], offset = 0) {
  if (bytes.length < offset + expected.length) {
    return false;
  }

  return expected.every((value, index) => bytes[offset + index] === value);
}

function isAcceptedMimeType(
  value: string
): value is InstantRamenInputImageMimeType {
  return (INSTANT_RAMEN_INPUT_IMAGE_MIME_TYPES as readonly string[]).includes(
    value
  );
}

function assertSafeUserId(userId: string) {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(userId)) {
    throw new InstantRamenInputImageError(
      'invalid_input_image',
      'The input image reference is invalid.',
      400
    );
  }
}

export function detectInstantRamenInputImageType(
  bytes: Uint8Array
): DetectedInputImage | null {
  if (hasBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return MIME_TYPE_DETAILS['image/png'];
  }

  if (hasBytes(bytes, [0xff, 0xd8, 0xff])) {
    return MIME_TYPE_DETAILS['image/jpeg'];
  }

  if (
    hasBytes(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    hasBytes(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return MIME_TYPE_DETAILS['image/webp'];
  }

  return null;
}

export function isSupportedInstantRamenImageBytes(bytes: Uint8Array) {
  return detectInstantRamenInputImageType(bytes) !== null;
}

export function validateInstantRamenInputImage({
  bytes,
  claimedMimeType,
}: {
  bytes: Uint8Array;
  claimedMimeType: string;
}): DetectedInputImage {
  if (bytes.byteLength === 0) {
    throw new InstantRamenInputImageError(
      'empty_input_image',
      'The selected image is empty.',
      400
    );
  }

  if (bytes.byteLength > INSTANT_RAMEN_INPUT_IMAGE_MAX_BYTES) {
    throw new InstantRamenInputImageError(
      'input_image_too_large',
      'The selected image exceeds the 10 MB limit.',
      413
    );
  }

  const normalizedMimeType = claimedMimeType.trim().toLowerCase();
  if (!isAcceptedMimeType(normalizedMimeType)) {
    throw new InstantRamenInputImageError(
      'unsupported_input_image_type',
      'Upload a PNG, JPEG, or WebP image.',
      415
    );
  }

  const detected = detectInstantRamenInputImageType(bytes);
  if (!detected) {
    throw new InstantRamenInputImageError(
      'invalid_input_image',
      'The selected file is not a valid PNG, JPEG, or WebP image.',
      415
    );
  }

  if (detected.mimeType !== normalizedMimeType) {
    throw new InstantRamenInputImageError(
      'input_image_type_mismatch',
      'The image contents do not match its declared file type.',
      415
    );
  }

  return detected;
}

export function getInstantRamenInputImagePrefix(userId: string) {
  assertSafeUserId(userId);
  return `instant-ramen/input-images/${userId}/`;
}

export function createInstantRamenInputImageKey({
  extension,
  randomId = crypto.randomUUID(),
  userId,
}: {
  extension: DetectedInputImage['extension'];
  randomId?: string;
  userId: string;
}) {
  if (!UUID_PATTERN.test(randomId)) {
    throw new InstantRamenInputImageError(
      'invalid_input_image',
      'The input image reference is invalid.',
      400
    );
  }

  return `${getInstantRamenInputImagePrefix(userId)}${randomId}.${extension}`;
}

export function validateOwnedInstantRamenInputImageKey({
  key,
  userId,
}: {
  key: string;
  userId: string;
}) {
  const prefix = getInstantRamenInputImagePrefix(userId);
  if (!key.startsWith(prefix)) {
    throw new InstantRamenInputImageError(
      'invalid_input_image',
      'The input image reference is invalid.',
      400
    );
  }

  const objectName = key.slice(prefix.length);
  const match = objectName.match(
    /^([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\.(jpg|png|webp)$/i
  );

  if (!match || !UUID_PATTERN.test(match[1])) {
    throw new InstantRamenInputImageError(
      'invalid_input_image',
      'The input image reference is invalid.',
      400
    );
  }

  return key;
}

function isPublicHttpUrl(value: string) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }
    if (url.username || url.password || !url.hostname) {
      return false;
    }

    const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname === '::1' ||
      hostname === '0:0:0:0:0:0:0:1'
    ) {
      return false;
    }

    const ipv4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4) {
      const octets = ipv4.slice(1).map(Number);
      if (octets.some((octet) => octet > 255)) {
        return false;
      }

      const [a, b] = octets;
      if (
        a === 0 ||
        a === 10 ||
        a === 127 ||
        (a === 100 && b >= 64 && b <= 127) ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        (a === 198 && (b === 18 || b === 19)) ||
        a >= 224
      ) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

export async function uploadInstantRamenInputImage({
  bytes,
  claimedMimeType,
  randomId,
  storage,
  userId,
}: {
  bytes: Uint8Array;
  claimedMimeType: string;
  randomId?: string;
  storage: InputImageStorage;
  userId: string;
}) {
  const detected = validateInstantRamenInputImage({
    bytes,
    claimedMimeType,
  });
  const key = createInstantRamenInputImageKey({
    extension: detected.extension,
    randomId,
    userId,
  });

  let result;
  try {
    result = await storage.uploadFile({
      body: bytes,
      contentType: detected.mimeType,
      disposition: 'inline',
      key,
    });
  } catch {
    throw new InstantRamenInputImageError(
      'storage_unavailable',
      'Image storage is temporarily unavailable.',
      503
    );
  }

  if (!result.success) {
    throw new InstantRamenInputImageError(
      'input_image_upload_failed',
      'The image could not be uploaded. Please try again.',
      502
    );
  }

  const publicUrl = result.url || storage.getPublicUrl({ key });
  if (!publicUrl || !isPublicHttpUrl(publicUrl)) {
    throw new InstantRamenInputImageError(
      'public_storage_url_unavailable',
      'Image storage does not provide a public URL for generation.',
      503
    );
  }

  return {
    key,
    mimeType: detected.mimeType,
    size: bytes.byteLength,
    url: publicUrl,
  };
}

export async function resolveInstantRamenInputImageUrl({
  key,
  storage,
  userId,
}: {
  key: string;
  storage: Pick<InputImageStorage, 'exists' | 'getPublicUrl'>;
  userId: string;
}) {
  const ownedKey = validateOwnedInstantRamenInputImageKey({ key, userId });

  let exists = false;
  try {
    exists = await storage.exists({ key: ownedKey });
  } catch {
    throw new InstantRamenInputImageError(
      'storage_unavailable',
      'Image storage is temporarily unavailable.',
      503
    );
  }

  if (!exists) {
    throw new InstantRamenInputImageError(
      'input_image_not_found',
      'The uploaded input image could not be found.',
      404
    );
  }

  let publicUrl: string | undefined;
  try {
    publicUrl = storage.getPublicUrl({ key: ownedKey });
  } catch {
    throw new InstantRamenInputImageError(
      'storage_unavailable',
      'Image storage is temporarily unavailable.',
      503
    );
  }

  if (!publicUrl || !isPublicHttpUrl(publicUrl)) {
    throw new InstantRamenInputImageError(
      'public_storage_url_unavailable',
      'Image storage does not provide a public URL for generation.',
      503
    );
  }

  return publicUrl;
}

export async function resolveInstantRamenOwnedInputImage({
  key,
  userId,
}: {
  key: string;
  userId: string;
}): Promise<string> {
  let storage: StorageManager;
  try {
    storage = await getStorageService();
  } catch {
    throw new InstantRamenInputImageError(
      'storage_unavailable',
      'Image storage is temporarily unavailable.',
      503
    );
  }

  return resolveInstantRamenInputImageUrl({ key, storage, userId });
}
