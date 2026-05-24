import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { useEffect } from "react";

function DonationModal({ isOpen, onClose, campaign }) {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donorInfo, setDonorInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [message, setMessage] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const presetAmounts = [50000, 100000, 500000, 1000000];

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const getFinalAmount = () => {
    return selectedAmount || parseInt(customAmount) || 0;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (getFinalAmount() < 10000) {
      toast.error("Minimum donasi adalah Rp 10.000");
      return;
    }

    if (!donorInfo.name || !donorInfo.email || !donorInfo.phone) {
      toast.error("Mohon lengkapi semua informasi donatur");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Mohon setujui syarat dan ketentuan");
      return;
    }

    setIsSubmitting(true);

    try {
      await handleMidtrans();
    } catch (error) {
      console.error("Error processing donation:", error);
      toast.error("Gagal memproses donasi. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  };

  const handleMidtrans = async () => {
    const payload = {
      campaign_id: campaign.id,
      donor_name: donorInfo.name.trim(),
      donor_email: donorInfo.email.trim(),
      donor_phone: donorInfo.phone.trim(),
      amount: getFinalAmount(),
      is_anonymous: 0,
    };

    const r = await fetch(`https://sdvapp.cloud/api/v1/socio/donations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await r.json();
    const token = data.token || data.data?.token;
    onClose();

    if (!r.ok || !token) {
      throw new Error(data.message || "Token pembayaran tidak tersedia");
    }

    if (typeof window === "undefined" || !window.snap?.pay) {
      throw new Error("Midtrans Snap belum tersedia");
    }

    // @ts-ignore
    window.snap.pay(token, {
      onSuccess: () => {
        setIsSubmitting(false);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
          resetForm();
          toast.success("Terima kasih atas donasi Anda");
        }, 3000);
      },
      onPending: () => {
        setIsSubmitting(false);
        onClose();
        resetForm();
        toast.success("Instruksi pembayaran telah dibuat");
      },
      onError: () => {
        setIsSubmitting(false);
        toast.error("Pembayaran gagal diproses");
      },
      onClose: () => {
        setIsSubmitting(false);
      },
    });
  };

  const resetForm = () => {
    setSelectedAmount(null);
    setCustomAmount("");
    setDonorInfo({ name: "", email: "", phone: "" });
    setMessage("");
    setAgreedToTerms(false);
  };

  useEffect(() => {
    // You can also change below url value to any script url you wish to load,
    // for example this is snap.js for Sandbox Env (Note: remove `.sandbox` from url if you want to use production version)
    const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";

    let scriptTag = document.createElement("script");
    scriptTag.src = midtransScriptUrl;

    // Optional: set script attribute, for example snap.js have data-client-key attribute
    // (change the value according to your client-key)
    const myMidtransClientKey = "SB-Mid-client-0C4gPKQXqUx1FweT";
    scriptTag.setAttribute("data-client-key", myMidtransClientKey);

    document.body.appendChild(scriptTag);

    return () => {
      document.body.removeChild(scriptTag);
    };
  }, []);

  if (!campaign) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {!showSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {campaign.title}
              </DialogTitle>
              <DialogDescription>
                Pilih jumlah donasi dan lengkapi informasi Anda
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Pilih jumlah donasi
                </Label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {presetAmounts.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant={
                        selectedAmount === amount ? "default" : "outline"
                      }
                      className={`h-auto py-4 font-bold text-lg ${selectedAmount === amount ? "bg-primary text-primary-foreground" : ""}`}
                      onClick={() => handleAmountSelect(amount)}
                    >
                      {formatCurrency(amount)}
                    </Button>
                  ))}
                </div>
                <div>
                  <Label htmlFor="customAmount" className="text-sm mb-2 block">
                    Atau masukkan jumlah lain
                  </Label>
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
                <Label className="text-base font-semibold">
                  Informasi donatur
                </Label>
                <div>
                  <Label htmlFor="name">Nama lengkap</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={donorInfo.name}
                    onChange={(e) =>
                      setDonorInfo({ ...donorInfo, name: e.target.value })
                    }
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
                    onChange={(e) =>
                      setDonorInfo({ ...donorInfo, email: e.target.value })
                    }
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
                    onChange={(e) =>
                      setDonorInfo({ ...donorInfo, phone: e.target.value })
                    }
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

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={setAgreedToTerms}
                />
                <Label
                  htmlFor="terms"
                  className="text-sm cursor-pointer leading-relaxed"
                >
                  Saya setuju dengan syarat dan ketentuan donasi serta kebijakan
                  privasi Education Crowdfunding
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Memproses..."
                  : `Lanjutkan Donasi ${getFinalAmount() > 0 ? formatCurrency(getFinalAmount()) : ""}`}
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
              Terima kasih atas donasi Anda sebesar{" "}
              {formatCurrency(getFinalAmount())}
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
