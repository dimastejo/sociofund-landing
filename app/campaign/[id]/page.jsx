import CampaignDetailPage from '@/screens/CampaignDetailPage.jsx';

const CAMPAIGN_DETAIL_API_URL = 'https://sdvapp.cloud/api/v1/socio/campaign';
const META_DESCRIPTION_MAX_LENGTH = 160;

function getMetaDescription(description) {
  const normalizedDescription = (description || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return normalizedDescription.length > META_DESCRIPTION_MAX_LENGTH
    ? normalizedDescription.substring(0, META_DESCRIPTION_MAX_LENGTH).trimEnd()
    : normalizedDescription;
}

async function fetchCampaignMetadata(id) {
  const response = await fetch(`${CAMPAIGN_DETAIL_API_URL}/${encodeURIComponent(id)}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const result = await response.json();
  const campaign = result?.data?.data;

  if (!result.valid || !result.data?.valid || !campaign) {
    throw new Error(result.message || 'Format data kampanye tidak valid');
  }

  return campaign;
}

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const campaign = await fetchCampaignMetadata(id);
    const title = campaign.title;
    const description = getMetaDescription(campaign.description) || campaign.title;
    const imageUrl = campaign.image_url;
    const imageMetadata = imageUrl
      ? {
          images: [
            {
              url: imageUrl,
              alt: title,
            },
          ],
        }
      : {};

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        ...imageMetadata,
      },
      twitter: {
        card: imageUrl ? 'summary_large_image' : 'summary',
        title,
        description,
        ...(imageUrl ? { images: [imageUrl] } : {}),
      },
    };
  } catch (error) {
    console.error('Error generating campaign metadata:', error);

    return {
      title: 'Detail Kampanye',
      description: 'Dukung kampanye pendidikan melalui Sociofund.',
    };
  }
}

export default async function Page({ params }) {
  const { id } = await params;

  return <CampaignDetailPage id={id} />;
}
