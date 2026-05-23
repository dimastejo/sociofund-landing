import CampaignDetailPage from '@/screens/CampaignDetailPage.jsx';

export async function generateMetadata({ params }) {
  const { id } = await params;

  return {
    title: 'Detail Kampanye',
    description: `Dukung kampanye pendidikan ${id} melalui Sociofund.`,
  };
}

export default async function Page({ params }) {
  const { id } = await params;

  return <CampaignDetailPage id={id} />;
}
