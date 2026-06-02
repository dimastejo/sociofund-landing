import { Suspense } from 'react';
import CampaignsPage from '@/screens/CampaignsPage.jsx';

const CAMPAIGNS_API_URL = 'https://sdvapp.cloud/api/v1/socio/campaigns?status=active';
const CATEGORIES_API_URL = 'https://sdvapp.cloud/api/v1/socio/kategori';

export const metadata = {
  title: 'Semua Kampanye',
  description:
    'Jelajahi semua kampanye pendidikan yang membutuhkan dukungan Anda. Temukan kampanye yang sesuai dengan minat dan nilai Anda.',
};

function normalizeCampaign(campaign) {
  const collectedAmount = Number(campaign.collected_amount) || 0;
  const targetAmount = Number(campaign.target_amount) || 0;
  const percentage =
    Number(campaign.collected_percentage) ||
    (targetAmount > 0 ? Math.round((collectedAmount / targetAmount) * 100) : 0);

  return {
    ...campaign,
    nama: campaign.title,
    image: campaign.image_url,
    dana_terkumpul: collectedAmount,
    target_dana: targetAmount,
    persentase: percentage,
    deskripsi: campaign.short_description || campaign.description,
  };
}

async function fetchCampaigns() {
  const response = await fetch(CAMPAIGNS_API_URL, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const result = await response.json();

  if (!result.valid || !Array.isArray(result.data)) {
    throw new Error(result.message || 'Format data kampanye tidak valid');
  }

  return result.data.map(normalizeCampaign);
}

async function fetchCategories() {
  const response = await fetch(CATEGORIES_API_URL, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const result = await response.json();

  if (!result.valid || !Array.isArray(result.data)) {
    throw new Error(result.message || 'Format data kategori tidak valid');
  }

  return result.data;
}

export default async function Page() {
  const [campaignsResult, categoriesResult] = await Promise.allSettled([
    fetchCampaigns(),
    fetchCategories(),
  ]);

  return (
    <Suspense fallback={null}>
      <CampaignsPage
        initialCampaigns={campaignsResult.status === 'fulfilled' ? campaignsResult.value : []}
        initialCategories={categoriesResult.status === 'fulfilled' ? categoriesResult.value : []}
        isCampaignsError={campaignsResult.status === 'rejected'}
      />
    </Suspense>
  );
}
