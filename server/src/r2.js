import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

// Cloudflare R2 is S3-compatible. Endpoint: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
let _r2 = null;

const getR2 = () => {
  if (!_r2) {
    const accountId  = process.env.R2_ACCOUNT_ID;
    const accessKey  = process.env.R2_ACCESS_KEY_ID;
    const secretKey  = process.env.R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKey || !secretKey) {
      throw new Error('R2 credentials not configured (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)');
    }

    _r2 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    });
  }
  return _r2;
};

const BUCKET = process.env.R2_BUCKET_NAME || 'clique-photos';
const PUBLIC_URL = process.env.R2_PUBLIC_URL; // e.g. https://pub-xxxx.r2.dev

/**
 * Upload a buffer to Cloudflare R2 and return the public URL.
 * @param {Buffer} buffer
 * @param {string} mimeType   e.g. 'image/jpeg'
 * @param {string} folder     e.g. 'profiles'
 * @returns {Promise<string>} public URL of the uploaded file
 */
export const uploadToR2 = async (buffer, mimeType, folder = 'profiles') => {
  const ext  = mimeType.split('/')[1] || 'jpg';
  const key  = `${folder}/${crypto.randomUUID()}.${ext}`;

  await getR2().send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    // Make publicly readable (requires the bucket to have public access enabled)
    ACL: 'public-read',
  }));

  // Build the public URL
  const base = PUBLIC_URL
    ? PUBLIC_URL.replace(/\/$/, '')
    : `https://${BUCKET}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

  return `${base}/${key}`;
};
