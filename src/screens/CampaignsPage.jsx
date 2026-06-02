'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import CampaignCard from '@/components/CampaignCard.jsx';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, SlidersHorizontal, AlertCircle } from 'lucide-react';

const CAMPAIGNS_API_URL = 'https://sdvapp.cloud/api/v1/socio/campaigns?status=active';
const CATEGORIES_API_URL = 'https://sdvapp.cloud/api/v1/socio/kategori';
const CAMPAIGNS_STALE_TIME = 1000 * 60 * 10;

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
  const response = await fetch(CAMPAIGNS_API_URL);

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
  const response = await fetch(CATEGORIES_API_URL);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const result = await response.json();

  if (!result.valid || !Array.isArray(result.data)) {
    throw new Error(result.message || 'Format data kategori tidak valid');
  }

  return result.data;
}

function CampaignsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const getCategoryParams = () =>
    searchParams
      .get('kategori')
      ?.split(',')
      .map(category => category.trim())
      .filter(Boolean) || [];

  const [searchQuery, setSearchQuery] = useState(searchParams.get('keyword') || '');
  const [selectedCategories, setSelectedCategories] = useState(getCategoryParams);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [showFilters, setShowFilters] = useState(false);
  const {
    data: campaigns = [],
    isLoading: isCampaignsLoading,
    isError: isCampaignsError,
    refetch: refetchCampaigns,
  } = useQuery({
    queryKey: ['campaigns', 'active'],
    queryFn: fetchCampaigns,
    staleTime: CAMPAIGNS_STALE_TIME,
  });
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
  } = useQuery({
    queryKey: ['campaign-categories'],
    queryFn: fetchCategories,
    staleTime: CAMPAIGNS_STALE_TIME,
  });

  const statuses = ['active', 'pending', 'rejected'];

  useEffect(() => {
    setSearchQuery(searchParams.get('keyword') || '');
    setSelectedCategories(getCategoryParams());
    setSortBy(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  const handleCategoryToggle = (categoryId) => {
    const normalizedCategoryId = String(categoryId);

    setSelectedCategories(prev =>
      prev.includes(normalizedCategoryId)
        ? prev.filter(id => id !== normalizedCategoryId)
        : [...prev, normalizedCategoryId]
    );
  };

  const handleStatusToggle = (status) => {
    setSelectedStatus(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = campaigns.filter(campaign => {
      // Defensive checks: default to empty strings if fields are missing or undefined
      const searchLower = (searchQuery || '').toLowerCase();
      const nama = (campaign?.nama || campaign?.title || '').toLowerCase();
      const deskripsi = (
        campaign?.deskripsi ||
        campaign?.short_description ||
        campaign?.description ||
        ''
      ).toLowerCase();
      const status = campaign?.status || '';

      const matchesSearch = nama.includes(searchLower) || deskripsi.includes(searchLower);

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(String(campaign?.category_id || campaign?.category?.id || ''));

      const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(status);

      return matchesSearch && matchesCategory && matchesStatus;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return String(b?.id || '').localeCompare(String(a?.id || ''));
        case 'target-high':
          return (b?.target_dana || 0) - (a?.target_dana || 0);
        case 'donors':
          return (b?.dana_terkumpul || 0) - (a?.dana_terkumpul || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [campaigns, searchQuery, selectedCategories, selectedStatus, sortBy]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    const trimmedSearchQuery = searchQuery.trim();

    if (trimmedSearchQuery) {
      params.set('keyword', trimmedSearchQuery);
    }

    if (selectedCategories.length > 0) {
      params.set('kategori', selectedCategories.join(','));
    }

    if (sortBy !== 'newest') {
      params.set('sort', sortBy);
    }

    const queryString = params.toString();
    router.push(queryString ? `/campaigns?${queryString}` : '/campaigns');
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedStatus([]);
    setSortBy('newest');
    router.push('/campaigns');
    setShowFilters(false);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header />

        <div className="flex-1 bg-background">
          <div className="bg-muted py-12 border-b border-border/40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-foreground" style={{ letterSpacing: '-0.02em' }}>
                Semua kampanye
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Temukan kampanye pendidikan yang ingin Anda dukung
              </p>
            </div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24">
                  <div className="flex items-center justify-between mb-4 lg:hidden">
                    <h2 className="text-xl font-bold">Filter</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="active:scale-[0.98] transition-transform"
                    >
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      {showFilters ? 'Sembunyikan' : 'Tampilkan'}
                    </Button>
                  </div>

                  <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                    <Card className="shadow-sm border-border/50">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold">Pencarian</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="Cari kampanye..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 text-foreground placeholder:text-muted-foreground transition-all focus-visible:ring-primary"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border-border/50">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold">Kategori</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {isCategoriesLoading ? (
                            [1, 2, 3].map((item) => (
                              <div key={item} className="flex items-center space-x-3">
                                <Skeleton className="h-4 w-4 rounded-sm" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                            ))
                          ) : categories.length > 0 ? (
                            categories.map(category => (
                              <div key={category.id} className="flex items-center space-x-3">
                                <Checkbox
                                  id={`category-${category.id}`}
                                  checked={selectedCategories.includes(String(category.id))}
                                  onCheckedChange={() => handleCategoryToggle(category.id)}
                                  className="transition-all"
                                />
                                <Label
                                  htmlFor={`category-${category.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground"
                                >
                                  {category.name}
                                </Label>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Tidak ada kategori.
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* <Card className="shadow-sm border-border/50">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold">Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {statuses.map(status => (
                            <div key={status} className="flex items-center space-x-3">
                              <Checkbox
                                id={`status-${status}`}
                                checked={selectedStatus.includes(status)}
                                onCheckedChange={() => handleStatusToggle(status)}
                                className="transition-all"
                              />
                              <Label
                                htmlFor={`status-${status}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground"
                              >
                                {status}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card> */}

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        className="w-full font-medium transition-all active:scale-[0.98]"
                        onClick={applyFilters}
                      >
                        Filter
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full font-medium transition-all active:scale-[0.98]"
                        onClick={clearFilters}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-muted/50 p-4 rounded-xl border border-border/50">
                  <p className="text-sm font-medium text-muted-foreground">
                    Menampilkan <span className="text-foreground font-bold">{filteredAndSortedCampaigns.length}</span> kampanye
                  </p>
                  <div className="w-full sm:w-auto">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full sm:w-[220px] bg-background">
                        <SelectValue placeholder="Urutkan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Terbaru</SelectItem>
                        <SelectItem value="target-high">Target tertinggi</SelectItem>
                        <SelectItem value="donors">Terkumpul terbanyak</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isCampaignsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <Card key={item} className="overflow-hidden flex flex-col h-full">
                        <Skeleton className="aspect-[16/10] w-full rounded-none" />
                        <CardContent className="p-6 flex-1 flex flex-col gap-4">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                          <div className="mt-auto space-y-3">
                            <div className="flex justify-between">
                              <Skeleton className="h-4 w-1/3" />
                              <Skeleton className="h-4 w-1/4" />
                            </div>
                            <Skeleton className="h-2.5 w-full" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : isCampaignsError ? (
                  <Card className="p-16 text-center border-dashed border-2 shadow-none bg-transparent">
                    <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <AlertCircle className="w-10 h-10 text-destructive" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">Gagal memuat kampanye</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      Gagal memuat data kampanye. Silakan coba lagi.
                    </p>
                    <Button onClick={() => refetchCampaigns()} className="transition-all active:scale-[0.98]">
                      Coba Lagi
                    </Button>
                  </Card>
                ) : filteredAndSortedCampaigns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredAndSortedCampaigns.map((campaign, index) => (
                      <CampaignCard key={campaign.id} campaign={campaign} index={index} />
                    ))}
                  </div>
                ) : (
                  <Card className="p-16 text-center border-dashed border-2 shadow-none bg-transparent">
                    <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">Tidak ada kampanye ditemukan</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      Coba ubah filter atau gunakan kata kunci pencarian lain untuk menemukan kampanye yang Anda cari.
                    </p>
                    <Button onClick={clearFilters} variant="secondary" className="transition-all active:scale-[0.98]">
                      Reset filter
                    </Button>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

export default CampaignsPage;
