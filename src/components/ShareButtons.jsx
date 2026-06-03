import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

function ShareButtons({ campaignSlug, campaignName, targetDana }) {
  const baseUrl = 'https://sociofund.or.id/campaign';
  const shareUrl = `${baseUrl}/${campaignSlug}`;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleCopyLink = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleWhatsAppShare = (e) => {
    e.preventDefault();
    const message = `Halo! Saya ingin mengajak Anda untuk mendukung kampanye: ${campaignName}. Target dana: ${formatCurrency(targetDana)}. Mari bersama-sama membantu! 🤝 ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="flex flex-row gap-3 w-full">
      <Button
        variant="outline"
        className="flex-1 text-sm font-medium transition-all hover:bg-muted active:scale-[0.98] border-border/60 shadow-sm"
        onClick={handleCopyLink}
      >
        <Copy className="w-4 h-4 mr-2" />
        Copy Link
      </Button>
      <Button
        variant="outline"
        className="flex-1 text-sm font-medium transition-all hover:bg-[#25D366]/10 hover:text-[#25D366] hover:border-[#25D366]/30 active:scale-[0.98] border-border/60 shadow-sm"
        onClick={handleWhatsAppShare}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        WhatsApp
      </Button>
    </div>
  );
}

export default ShareButtons;
