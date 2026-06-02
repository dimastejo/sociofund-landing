import { put } from '@vercel/blob';

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '-');
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return Response.json({ message: 'File tidak ditemukan' }, { status: 400 });
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return Response.json({ message: 'Format file tidak didukung' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ message: 'Ukuran file maksimal 20MB' }, { status: 400 });
    }

    const timestamp = Date.now();
    const pathname = `program-support/${timestamp}-${sanitizeFilename(file.name)}`;
    const blob = await put(pathname, file, {
      access: 'public',
    });

    return Response.json({ url: blob.url });
  } catch (error) {
    console.error('Upload image failed:', error);
    return Response.json({ message: 'Upload gagal' }, { status: 500 });
  }
}
