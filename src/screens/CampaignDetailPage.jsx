'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import CampaignCard from '@/components/CampaignCard.jsx';
import DonationModal from '@/components/DonationModal.jsx';
import ShareButtons from '@/components/ShareButtons.jsx';
import CampaignGallery from '@/components/CampaignGallery.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Calendar, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

const CAMPAIGNS_API_URL = 'https://sdvapp.cloud/api/v1/socio/campaigns';
const CAMPAIGN_DETAIL_API_URL = 'https://sdvapp.cloud/api/v1/socio/campaign';
const FALLBACK_IMAGE_URL = 'https://horizons-cdn.hostinger.com/13cfa1c3-d941-4ee5-a55f-474bf3bd73ff/b07ebb07df6a9ef671ed2ec1184247a6.jpg';

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
    deskripsi: campaign.description || campaign.short_description,
    created: campaign.created_at,
  };
}

async function fetchCampaignDetail(slug) {
  const response = await fetch(`${CAMPAIGN_DETAIL_API_URL}/${encodeURIComponent(slug)}`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const result = await response.json();
  const campaign = result?.data?.data;

  if (!result.valid || !result.data?.valid || !campaign) {
    throw new Error(result.message || 'Format data kampanye tidak valid');
  }

  return normalizeCampaign(campaign);
}

async function fetchRelatedCampaigns(currentCampaign) {
  const response = await fetch(CAMPAIGNS_API_URL);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const result = await response.json();

  if (!result.valid || !Array.isArray(result.data)) {
    throw new Error(result.message || 'Format data kampanye terkait tidak valid');
  }

  return result.data
    .filter(campaign => campaign.slug !== currentCampaign.slug && campaign.id !== currentCampaign.id)
    .slice(0, 2)
    .map(normalizeCampaign);
}

async function fetchCampaignData(slug) {
  const campaign = await fetchCampaignDetail(slug);
  let relatedCampaigns = [];

  try {
    relatedCampaigns = await fetchRelatedCampaigns(campaign);
  } catch (error) {
    console.error('Error fetching related campaigns:', error);
  }

  return { campaign, relatedCampaigns };
}

function CampaignDetailPage({ id }) {
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [selectedDonationAmount, setSelectedDonationAmount] = useState(null);
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['campaign-detail', id],
    queryFn: () => fetchCampaignData(id),
    enabled: Boolean(id),
  });
  const campaign = data?.campaign;
  const relatedCampaigns = data?.relatedCampaigns || [];

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col">
          <Skeleton className="h-[50vh] w-full rounded-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-20">
            <Card className="mb-8">
              <CardContent className="p-8 space-y-6">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (isError || !campaign) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
          <div className="text-center max-w-md mx-auto p-8 bg-background rounded-2xl shadow-sm border border-border">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Kampanye tidak ditemukan</h2>
            <p className="text-muted-foreground mb-6">Kampanye tidak ditemukan atau terjadi kesalahan.</p>
            <Link href="/campaigns">
              <Button className="transition-all active:scale-[0.98]">Kembali ke daftar kampanye</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const danaTerkumpul = campaign.dana_terkumpul || 0;
  const targetDana = campaign.target_dana || 1;
  const progressPercentage = campaign.persentase || ((danaTerkumpul / targetDana) * 100) || 0;
  const isFullyFunded =
    progressPercentage >= 100 ||
    danaTerkumpul >= targetDana ||
    campaign.status === 'Selesai';

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tanggal tidak tersedia';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Resolve header image URL
  const headerImageUrl =
    typeof campaign.image === 'string' && campaign.image
      ? campaign.image
      : FALLBACK_IMAGE_URL;

  // Mock data for fields not in the database schema to keep the UI rich
  const mockDonationTiers = [
    { amount: 50000},
    { amount: 150000},
    { amount: 500000 },
    { amount: 1000000 }
  ];

  const mockTimeline = [
    { event: "Kampanye Dimulai", date: campaign.created },
    { event: "Target Selesai", date: new Date(new Date(campaign.created).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() }
  ];

  const openDonationModal = (amount = null) => {
    if (isFullyFunded) return;

    setSelectedDonationAmount(amount);
    setIsDonationModalOpen(true);
  };

  const closeDonationModal = () => {
    setIsDonationModalOpen(false);
    setSelectedDonationAmount(null);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header />

        <div className="flex-1 bg-background">
          <div className="relative h-[50vh] md:h-[60vh] overflow-hidden bg-muted">
            <img
              src={headerImageUrl}
              alt={campaign.nama || 'Kampanye'}
              className="w-full h-full object-cover img-enhanced"
              onError={(e) => {
                e.target.src = FALLBACK_IMAGE_URL;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="mb-8 shadow-lg border-border/50">
                    <CardContent className="p-6 md:p-8">
                      <Link href="/campaigns" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        Kembali ke kampanye
                      </Link>

                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Badge className="bg-primary text-primary-foreground">Pendidikan</Badge>
                        {isFullyFunded ? (
                          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-sm border-none flex items-center gap-1.5 px-2.5 py-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Fully Support
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            {campaign.status || 'Sedang berjalan'}
                          </Badge>
                        )}
                      </div>

                      <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-foreground leading-tight" style={{ letterSpacing: '-0.02em' }}>
                        {campaign.nama || 'Tanpa Nama'}
                      </h1>

                      <div className="bg-muted/50 rounded-2xl p-6 mb-8 border border-border/50">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-5">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Terkumpul</p>
                            <p className="text-xl font-bold text-primary">{formatCurrency(danaTerkumpul)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Target</p>
                            <p className="text-xl font-bold text-foreground">{formatCurrency(targetDana)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Subscriber</p>
                            <p className="text-xl font-bold text-foreground flex items-center">
                              <Users className="w-5 h-5 mr-1.5 text-muted-foreground" />
                              {campaign.donor_count || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Progress</p>
                            <p className="text-xl font-bold text-foreground">{progressPercentage.toFixed(1)}%</p>
                          </div>
                        </div>
                        <Progress value={progressPercentage} className="h-3 bg-muted" indicatorClassName={progressPercentage >= 100 ? "bg-emerald-500" : "bg-primary"} />
                      </div>

                      <Button
                        size="lg"
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold mb-4 py-6 transition-transform active:scale-[0.98]"
                        onClick={() => openDonationModal()}
                        disabled={isFullyFunded}
                      >
                        {isFullyFunded ? 'Kampanye Terpenuhi' : 'Program Submission'}
                      </Button>

                      <div className="mb-8">
                        <ShareButtons 
                          campaignSlug={campaign.slug} 
                          campaignName={campaign.nama || 'Kampanye'} 
                          targetDana={targetDana} 
                        />
                      </div>

                      <Separator className="my-8" />
                      
                      {/* Swipeable Campaign Gallery added right before description */}
                      <div className="mb-8">
                        <CampaignGallery
                          imageUrl={headerImageUrl}
                          sliderContent={campaign.slider_content}
                          altText={campaign.nama || 'Kampanye image'}
                        />
                      </div>

                      <div>
                        <h2 className="text-2xl font-bold mb-4 text-foreground">Tentang kampanye</h2>
                        <div className="prose prose-lg max-w-none">
                          {campaign.deskripsi ? campaign.deskripsi.split('\n').map((paragraph, index) => (
                            paragraph.trim() && (
                              <p key={index} className="text-muted-foreground leading-relaxed mb-4">
                                {paragraph}
                              </p>
                            )
                          )) : (
                            <p className="text-muted-foreground leading-relaxed">Belum ada deskripsi detail untuk kampanye ini.</p>
                          )}
                        </div>
                      </div>

                      {!isFullyFunded && (
                        <>
                          <Separator className="my-8" />

                          <div>
                            <h2 className="text-2xl font-bold mb-6 text-foreground">Tingkat donasi</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {mockDonationTiers.map((tier, index) => (
                                <Card
                                  key={index}
                                  className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-border/50 cursor-pointer"
                                  onClick={() => openDonationModal(tier.amount)}
                                >
                                  <CardContent className="p-6">
                                    <p className="text-2xl font-bold text-primary mb-2">
                                      {formatCurrency(tier.amount)}
                                    </p>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="sticky top-24"
                >
                  <Card className="shadow-md border-border/50">
                    <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                      <CardTitle className="text-lg">Timeline kampanye</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        {mockTimeline.map((item, index) => (
                          <div key={index} className="flex items-start relative">
                            {index !== mockTimeline.length - 1 && (
                              <div className="absolute top-6 left-1.5 w-0.5 h-full bg-border -z-10"></div>
                            )}
                            <div className="w-3 h-3 bg-primary rounded-full mt-1.5 mr-4 flex-shrink-0 ring-4 ring-background"></div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{item.event}</p>
                              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(item.date)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>

            {relatedCampaigns.length > 0 && (
              <div className="mt-24">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-foreground">Kampanye lainnya</h2>
                  <Link href="/campaigns">
                    <Button variant="outline" className="hidden sm:flex">Lihat Semua</Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {relatedCampaigns.map((relatedCampaign, index) => (
                    <CampaignCard key={relatedCampaign.id} campaign={relatedCampaign} index={index} />
                  ))}
                </div>
                <div className="mt-8 sm:hidden">
                  <Link href="/campaigns" className="block w-full">
                    <Button variant="outline" className="w-full">Lihat Semua Kampanye</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>

      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={closeDonationModal}
        campaign={campaign}
        initialAmount={selectedDonationAmount}
      />
    </>
  );
}

export default CampaignDetailPage;
