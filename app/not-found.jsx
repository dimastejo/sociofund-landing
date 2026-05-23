import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Halaman tidak ditemukan</h1>
        <p className="text-muted-foreground mb-6">Halaman yang Anda cari tidak tersedia</p>
        <Link href="/" className="text-primary hover:underline">
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
