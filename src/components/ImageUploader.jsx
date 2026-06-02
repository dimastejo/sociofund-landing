'use client';

import { useEffect, useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function ImageUploader({ value = '', onFinish, onUploadingChange }) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(value);
  const [error, setError] = useState('');

  useEffect(() => {
    setImageUrl(value);
  }, [value]);

  const setUploadState = (nextUploading) => {
    setUploading(nextUploading);
    onUploadingChange?.(nextUploading);
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setError('');

    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError('Format file harus JPG, JPEG, PNG, atau WEBP');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Ukuran file maksimal 20MB');
      return;
    }

    try {
      setUploadState(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result.url) {
        throw new Error(result.message || 'Upload gagal');
      }

      setImageUrl(result.url);
      onFinish(result.url);
      toast.success('Foto berhasil diunggah');
    } catch (uploadError) {
      console.error('Upload gagal:', uploadError);
      setError('Upload gagal. Silakan coba lagi.');
      toast.error('Upload foto gagal');
    } finally {
      setUploadState(false);
    }
  };

  return (
    <div>
      <Input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="cursor-pointer"
        disabled={uploading}
      />

      {uploading && (
        <Skeleton className="mt-2 h-10 w-full rounded-md flex justify-center items-center">
          <p className="text-sm text-muted-foreground">Uploading...</p>
        </Skeleton>
      )}

      {imageUrl && (
        <Card className="p-0 mt-2 rounded-md overflow-hidden">
          <CardContent className="flex justify-center p-2">
            <img
              src={imageUrl}
              alt="Uploaded"
              className="max-h-64 w-auto max-w-full rounded-sm object-contain"
            />
          </CardContent>
        </Card>
      )}

      {!imageUrl && !uploading && (
        <div className="mt-2 flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          Belum ada foto yang diunggah.
        </div>
      )}

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}

export default ImageUploader;
