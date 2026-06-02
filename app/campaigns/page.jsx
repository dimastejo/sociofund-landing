import { Suspense } from 'react';
import CampaignsPage from '@/screens/CampaignsPage.jsx';

export const metadata = {
  title: 'Semua Kampanye',
  description:
    'Jelajahi semua kampanye pendidikan yang membutuhkan dukungan Anda. Temukan kampanye yang sesuai dengan minat dan nilai Anda.',
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CampaignsPage />
    </Suspense>
  );
}
