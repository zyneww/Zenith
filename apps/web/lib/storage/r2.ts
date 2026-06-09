// apps/web/lib/storage/r2.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

// R2 uses S3-compatible API
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET || 'zenith-storage';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || '',
  },
});

// Upload file to R2
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | ReadableStream,
  contentType: string,
  metadata?: Record<string, string>
) {
  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
    });

    await r2Client.send(command);
    
    return {
      success: true,
      key,
      url: `https://${R2_BUCKET}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`,
    };
  } catch (error) {
    console.error('Failed to upload to R2:', error);
    throw error;
  }
}

// Get file from R2
export async function getFile(key: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    });

    const response = await r2Client.send(command);
    return response.Body;
  } catch (error) {
    console.error('Failed to get from R2:', error);
    throw error;
  }
}

// Delete file from R2
export async function deleteFile(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    });

    await r2Client.send(command);
    return { success: true, key };
  } catch (error) {
    console.error('Failed to delete from R2:', error);
    throw error;
  }
}

// List files in R2
export async function listFiles(prefix?: string) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Prefix: prefix,
    });

    const response = await r2Client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error('Failed to list from R2:', error);
    throw error;
  }
}

// Upload avatar for user
export async function uploadUserAvatar(userId: string, file: Buffer, contentType: string) {
  const key = `avatars/${userId}/${Date.now()}`;
  return await uploadFile(key, file, contentType, {
    userId,
    type: 'avatar',
  });
}

// Upload chart image
export async function uploadChartImage(chartId: string, file: Buffer, contentType: string = 'image/png') {
  const key = `charts/${chartId}/${Date.now()}.png`;
  return await uploadFile(key, file, contentType, {
    chartId,
    type: 'chart',
  });
}

// Upload exported data
export async function uploadExport(userId: string, data: string, format: 'csv' | 'json' = 'json') {
  const key = `exports/${userId}/${Date.now()}.${format}`;
  return await uploadFile(
    key,
    Buffer.from(data),
    format === 'csv' ? 'text/csv' : 'application/json',
    {
      userId,
      type: 'export',
      format,
    }
  );
}

export default {
  uploadFile,
  getFile,
  deleteFile,
  listFiles,
  uploadUserAvatar,
  uploadChartImage,
  uploadExport,
};
