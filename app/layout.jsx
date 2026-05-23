import '@/index.css';
import Providers from './providers.jsx';

export const metadata = {
  title: {
    default: 'Education Crowdfunding - Wujudkan Impian Pendidikan Bersama',
    template: '%s - Education Crowdfunding',
  },
  description:
    'Platform crowdfunding untuk mendukung pendidikan berkualitas di Indonesia. Bantu mahasiswa mencapai impian mereka melalui program pelatihan bahasa dan pendidikan.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
