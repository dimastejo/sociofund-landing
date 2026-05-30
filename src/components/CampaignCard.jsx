'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import pb from '@/lib/pocketbaseClient.js';
import ShareButtons from '@/components/ShareButtons.jsx';

const FALLBACK_IMAGE_URL = "https://horizons-cdn.hostinger.com/13cfa1c3-d941-4ee5-a55f-474bf3bd73ff/b07ebb07df6a9ef671ed2ec1184247a6.jpg";

function appendQueryParam(url, key, value) {
  if (!url || !value || !url.startsWith('http')) return url;

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${key}=${encodeURIComponent(value)}`;
}

function getLowResImageUrl(imageUrl) {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('data:')) return imageUrl;

  return `/_next/image?url=${encodeURIComponent(imageUrl)}&w=32&q=20`;
}

function CampaignCard({ campaign, index = 0 }) {
  const [imageLoadFailed, setImageLoadFailed] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const danaTerkumpul = campaign.dana_terkumpul || campaign.currentAmount || 0;
  const targetDana = campaign.target_dana || campaign.targetAmount || 1; // Prevent division by zero
  const persentase = campaign.persentase || Math.round((danaTerkumpul / targetDana) * 100) || 0;
  
  const isFullyFunded = persentase >= 100 || campaign.status === 'Selesai';

  React.useEffect(() => {
    setImageLoadFailed(false);
  }, [campaign.id, campaign.image]);

  // Safely resolve the dynamic image URL from PocketBase
  // Fallback to placeholder if no image exists
  let imageUrl = FALLBACK_IMAGE_URL;
  
  if (campaign.image) {
    if (typeof campaign.image === 'string' && (campaign.image.startsWith('http') || campaign.image.startsWith('data:'))) {
      // If it's already a full URL, use it directly
      imageUrl = campaign.image;
    } else if (campaign.collectionId && campaign.id) {
      // If it's a filename from PocketBase, resolve it
      imageUrl = pb.files.getUrl(campaign, campaign.image);
    }
  } else if (campaign.images && campaign.images.length > 0) {
    // Fallback for local mock data if still used anywhere
    imageUrl = campaign.images[0];
  }

  imageUrl = appendQueryParam(imageUrl, 't', campaign.updated_at || campaign.updatedAt || campaign.created_at || campaign.created);

  const displayImageUrl = imageLoadFailed ? FALLBACK_IMAGE_URL : imageUrl;
  const lowResImageUrl = getLowResImageUrl(displayImageUrl);

  React.useEffect(() => {
    setImageLoaded(false);
  }, [displayImageUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-muted/60">
        <Link href={`/campaign/${campaign.slug}`} className="relative block aspect-[16/10] overflow-hidden group bg-muted">
          <div
            className={`absolute inset-0 scale-110 bg-cover bg-center blur-xl transition-opacity duration-500 ${
              imageLoaded ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ backgroundImage: lowResImageUrl ? `url("${lowResImageUrl}")` : undefined }}
            aria-hidden="true"
          />
          <Image
            src={displayImageUrl}
            alt={campaign.nama || campaign.title || 'Campaign Image'}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className={`object-cover img-enhanced transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoadFailed(true)}
          />
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            {isFullyFunded ? (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-sm border-none flex items-center gap-1.5 px-2.5 py-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Fully Support
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-white/90 text-slate-800 hover:bg-white font-medium shadow-sm border-none flex items-center gap-1.5 px-2.5 py-1 backdrop-blur-sm">
                <Clock className="w-3.5 h-3.5 text-primary" />
                {campaign.status || 'Sedang berjalan'}
              </Badge>
            )}
          </div>
        </Link>
        
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="mb-5">
            <Link href={`/campaign/${campaign.slug}`}>
              <h3 className="text-xl font-bold mb-3 hover:text-primary transition-colors line-clamp-2 leading-tight">
                {campaign.nama || campaign.title || 'Tanpa Nama'}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {campaign.deskripsi || campaign.description || 'Belum ada deskripsi.'}
            </p>
          </div>

          <div className="mt-auto space-y-4">
            <div>
              <div className="flex justify-between items-end mb-2.5">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Terkumpul</p>
                  <p className="text-lg font-bold text-primary leading-none">{formatCurrency(danaTerkumpul)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Target</p>
                  <p className="text-sm font-semibold text-foreground leading-none">{formatCurrency(targetDana)}</p>
                </div>
              </div>
              <Progress 
                value={persentase} 
                className="h-2.5 bg-muted" 
                indicatorClassName={isFullyFunded ? "bg-emerald-500" : "bg-primary"}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm font-medium text-muted-foreground">
                  <span className={isFullyFunded ? "text-emerald-600 font-bold" : "text-foreground font-bold"}>
                    {persentase}%
                  </span> tercapai
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-6 pt-0 flex-col gap-4">
          <Link href={`/campaign/${campaign.slug}`} className="w-full">
            <Button 
              className={`w-full font-semibold transition-all ${
                isFullyFunded 
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200" 
                  : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md"
              }`}
              variant={isFullyFunded ? "outline" : "default"}
            >
              {isFullyFunded ? "Lihat Detail" : "Program Submission"}
            </Button>
          </Link>
          
          <ShareButtons 
            campaignId={campaign.id} 
            campaignName={campaign.nama || campaign.title || 'Kampanye'} 
            targetDana={targetDana} 
          />
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default CampaignCard;
