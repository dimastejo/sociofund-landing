import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

function DonationModal({ isOpen, onClose, campaign }) {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const presetAmounts = [50000, 100000, 500000, 1000000];

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const getFinalAmount = () => {
    return selectedAmount || parseInt(customAmount) || 0;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (getFinalAmount() < 10000) {
      toast.error('Minimum donasi adalah Rp 10.000');
      return;
    }

    if (!donorInfo.name || !donorInfo.email || !donorInfo.phone) {
      toast.error('Mohon lengkapi semua informasi donatur');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Mohon setujui syarat dan ketentuan');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const donation = {
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        amount: getFinalAmount(),
        donorInfo,
        message,
        paymentMethod,
        timestamp: new Date().toISOString()
      };

      const existingDonations = JSON.parse(localStorage.getItem('donations') || '[]');
      existingDonations.push(donation);
      localStorage.setItem('donations', JSON.stringify(existingDonations));

      setIsSubmitting(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        resetForm();
        toast.success('Terima kasih atas donasi Anda');
      }, 3000);
    }, 1500);
  };

  const resetForm = () => {
    setSelectedAmount(null);
    setCustomAmount('');
    setDonorInfo({ name: '', email: '', phone: '' });
    setMessage('');
    setPaymentMethod('bank');
    setAgreedToTerms(false);
  };

  if (!campaign) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {!showSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{campaign.title}</DialogTitle>
              <DialogDescription>
                Pilih jumlah donasi dan lengkapi informasi Anda
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">Pilih jumlah donasi</Label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {presetAmounts.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant={selectedAmount === amount ? "default" : "outline"}
                      className={`h-auto py-4 font-bold text-lg ${selectedAmount === amount ? 'bg-primary text-primary-foreground' : ''}`}
                      onClick={() => handleAmountSelect(amount)}
                    >
                      {formatCurrency(amount)}
                    </Button>
                  ))}
                </div>
                <div>
                  <Label htmlFor="customAmount" className="text-sm mb-2 block">Atau masukkan jumlah lain</Label>
                  <Input
                    id="customAmount"
                    type="text"
                    placeholder="Masukkan jumlah (min. Rp 10.000)"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="text-gray-900 placeholder:text-gray-500"
                  />
                  {customAmount && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatCurrency(parseInt(customAmount) || 0)}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Informasi donatur</Label>
                <div>
                  <Label htmlFor="name">Nama lengkap</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={donorInfo.name}
                    onChange={(e) => setDonorInfo({ ...donorInfo, name: e.target.value })}
                    className="text-gray-900 placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={donorInfo.email}
                    onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
                    className="text-gray-900 placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Nomor telepon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={donorInfo.phone}
                    onChange={(e) => setDonorInfo({ ...donorInfo, phone: e.target.value })}
                    className="text-gray-900 placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message">Pesan dukungan (opsional)</Label>
                <Textarea
                  id="message"
                  placeholder="Tulis pesan dukungan Anda..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="text-gray-900 placeholder:text-gray-500"
                />
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Metode pembayaran</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex-1 cursor-pointer">Transfer Bank</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="ewallet" id="ewallet" />
                    <Label htmlFor="ewallet" className="flex-1 cursor-pointer">E-wallet (GoPay, OVO, Dana)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={setAgreedToTerms}
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                  Saya setuju dengan syarat dan ketentuan donasi serta kebijakan privasi Education Crowdfunding
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Memproses...' : `Lanjutkan Donasi ${getFinalAmount() > 0 ? formatCurrency(getFinalAmount()) : ''}`}
              </Button>
            </form>
          </>
        ) : (
          <div className="py-12 text-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Donasi berhasil</h3>
            <p className="text-muted-foreground mb-2">
              Terima kasih atas donasi Anda sebesar {formatCurrency(getFinalAmount())}
            </p>
            <p className="text-sm text-muted-foreground">
              Instruksi pembayaran telah dikirim ke email Anda
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default DonationModal;