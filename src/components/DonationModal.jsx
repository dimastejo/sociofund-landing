import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";
import ImageUploader from "@/components/ImageUploader.jsx";
import apiClient from "@/lib/apiClient.js";

const presetAmounts = [50000, 150000, 500000, 1000000];
const SUBSCRIBER_TYPES = {
  direct: "direct",
  external: "external",
};
const PAYMENT_METHODS = {
  midtrans: "midtrans",
  manual: "manual",
};

function encodeDonationCode(donationCode) {
  if (typeof window === "undefined") return donationCode;

  return window.btoa(donationCode);
}

function getDonationData(result) {
  return result?.data?.data || result?.data || result;
}

async function createDonation(payload) {
  const response = await apiClient.post("/v1/socio/donations", payload);
  const data = response.data;
  const donationCode = data.donation_code || data.data?.donation_code;

  if (!donationCode) {
    throw new Error(data.message || "Kode donasi tidak tersedia");
  }

  return { data, donationCode };
}

async function fetchDonationDetail(donationCode) {
  const response = await apiClient.get(
    `/v1/socio/donation/${encodeURIComponent(donationCode)}`,
  );
  const result = response.data;
  const donation = getDonationData(result);

  if (!donation) {
    throw new Error(result?.message || "Donation tidak valid");
  }

  return donation;
}

async function submitPaymentProof(payload) {
  const response = await apiClient.post("/v1/socio/donation/payment-proof", payload);
  const data = response.data;

  if (data?.valid === false) {
    throw new Error(data?.message || "Gagal mengirim bukti pembayaran");
  }

  return data;
}

async function fetchSocioSettings() {
  const response = await apiClient.get("/v1/socio/settings", {
    params: {
      setting_key: "bank,no_rekening,nama_pemilik_rekening",
    },
  });
  const result = response.data;
  const settings = result?.data;

  if (!Array.isArray(settings)) {
    throw new Error(result?.message || "Gagal memuat setting pembayaran");
  }

  return settings.reduce((acc, setting) => {
    acc[setting.setting_key] =
      setting.setting_value || setting.value || setting.settingValue || "";
    return acc;
  }, {});
}

function getDisplayDonationCode(donationCode, fallbackCode = "") {
  const code = String(fallbackCode || donationCode || "");

  if (code.includes("DNT-")) return code;
  if (typeof window === "undefined") return code;

  try {
    const decodedCode = window.atob(String(donationCode));

    if (decodedCode.includes("DNT-")) return decodedCode;
  } catch {
    // Keep the original value when it is not base64-encoded.
  }

  return code;
}

function getEncryptedDonationCode(manualPayment) {
  if (!manualPayment?.donationCode) return "";

  return (
    manualPayment.encryptedDonationCode ||
    encodeDonationCode(manualPayment.donationCode)
  );
}

function DonationModal({ isOpen, onClose, campaign, initialAmount }) {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [subscriberType, setSubscriberType] = useState(SUBSCRIBER_TYPES.direct);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.manual);
  const [donorInfo, setDonorInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [message, setMessage] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [manualPayment, setManualPayment] = useState(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [existingPaymentProofUrl, setExistingPaymentProofUrl] = useState("");
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [queryDonationCode, setQueryDonationCode] = useState("");
  const createDonationMutation = useMutation({
    mutationFn: createDonation,
  });
  const submitPaymentProofMutation = useMutation({
    mutationFn: submitPaymentProof,
  });
  const {
    data: queryDonation,
    isError: isQueryDonationError,
    error: queryDonationError,
  } = useQuery({
    queryKey: ["donation-detail", queryDonationCode],
    queryFn: () => fetchDonationDetail(queryDonationCode),
    enabled: Boolean(queryDonationCode),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
  const { data: socioSettings = {}, isLoading: isSocioSettingsLoading } = useQuery({
    queryKey: ["socio-settings", "manual-payment"],
    queryFn: fetchSocioSettings,
    staleTime: 1000 * 60 * 10,
  });
  const manualPaymentInfo = {
    bank: socioSettings.bank || "",
    accountNumber: socioSettings.no_rekening || "",
    accountHolder: socioSettings.nama_pemilik_rekening || "",
  };

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const formatRupiahInput = (value) => {
    if (!value) return "";

    const numberString = String(value).replace(/[^,\d]/g, "");
    const split = numberString.split(",");
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
      const separator = sisa ? "." : "";
      rupiah += separator + ribuan.join(".");
    }

    rupiah = split[1] !== undefined ? rupiah + "," + split[1] : rupiah;
    return rupiah ? `Rp ${rupiah}` : "";
  };

  const getNumericAmount = (value) => {
    return Number(String(value || "").replace(/\D/g, ""));
  };

  const handleCustomAmountChange = (e) => {
    const formatted = formatRupiahInput(e.target.value);

    setCustomAmount(formatted);
    setSelectedAmount(null);
  };

  const getFinalAmount = () => {
    return selectedAmount || getNumericAmount(customAmount) || 0;
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

    if (
      subscriberType === SUBSCRIBER_TYPES.direct &&
      (!donorInfo.name || !donorInfo.email || !donorInfo.phone)
    ) {
      toast.error("Mohon lengkapi semua informasi donatur");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Mohon setujui syarat dan ketentuan");
      return;
    }

    setIsSubmitting(true);

    try {
      if (paymentMethod === PAYMENT_METHODS.midtrans) {
        await handleMidtrans();
        return;
      }

      if (paymentMethod === PAYMENT_METHODS.manual) {
        await handleManualPayment();
        return;
      }

      toast.error("Metode pembayaran tidak valid");
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error processing donation:", error);
      toast.error("Gagal memproses donasi. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  };

  const buildDonationPayload = (method) => {
    return {
      campaign_id: campaign.id,
      donor_type: subscriberType,
      donor_name: donorInfo.name.trim(),
      donor_email: donorInfo.email.trim(),
      donor_phone: donorInfo.phone.trim(),
      amount: getFinalAmount(),
      message: message.trim(),
      payment_method: method,
    };
  };

  const handleMidtrans = async () => {
    const payload = buildDonationPayload(PAYMENT_METHODS.midtrans);
    const { donationCode } = await createDonationMutation.mutateAsync(payload);
    onClose();

    if (typeof window === "undefined" || !window.snap?.pay) {
      throw new Error("Midtrans Snap belum tersedia");
    }

    // @ts-ignore
    window.snap.pay(donationCode, {
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

  const handleManualPayment = async () => {
    const payload = buildDonationPayload(PAYMENT_METHODS.manual);
    payload.payment_url = window.location.href;
    const { donationCode } = await createDonationMutation.mutateAsync(payload);

    setManualPayment({
      donationCode,
      encryptedDonationCode: encodeDonationCode(donationCode),
      displayDonationCode: getDisplayDonationCode(donationCode),
      amount: getFinalAmount(),
      paymentStatus: "",
    });
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("donation_code", encodeDonationCode(donationCode));
    window.history.replaceState(null, "", nextUrl.toString());
    setIsSubmitting(false);
  };

  const handleCopyAccountNumber = async () => {
    try {
      if (!manualPaymentInfo.accountNumber) {
        toast.error("Nomor rekening belum tersedia");
        return;
      }

      await navigator.clipboard.writeText(manualPaymentInfo.accountNumber);
      toast.success("Nomor rekening disalin");
    } catch {
      toast.error("Gagal menyalin nomor rekening");
    }
  };

  const handleManualProofSubmit = async () => {
    if (!paymentProofUrl) {
      toast.error("Mohon unggah bukti pembayaran");
      return;
    }

    if (existingPaymentProofUrl) {
      toast.error("Bukti pembayaran sudah pernah dikirim");
      return;
    }

    if (!manualPayment?.donationCode) {
      toast.error("Kode donasi tidak tersedia");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitPaymentProofMutation.mutateAsync({
        donation_code: getEncryptedDonationCode(manualPayment),
        payment_proof: paymentProofUrl,
      });

      toast.success("Bukti pembayaran berhasil diunggah");
      onClose();
      resetForm();
      removeDonationCodeQuery();
    } catch (error) {
      console.error("Error submitting payment proof:", error);
      toast.error("Gagal mengirim bukti pembayaran. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedAmount(null);
    setCustomAmount("");
    setSubscriberType(SUBSCRIBER_TYPES.direct);
    setPaymentMethod(PAYMENT_METHODS.midtrans);
    setDonorInfo({ name: "", email: "", phone: "" });
    setMessage("");
    setAgreedToTerms(false);
    setManualPayment(null);
    setPaymentProofUrl("");
    setExistingPaymentProofUrl("");
    setIsUploadingProof(false);
    setQueryDonationCode("");
  };

  const removeDonationCodeQuery = () => {
    if (typeof window === "undefined") return;

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("donation_code");
    nextUrl.searchParams.delete("donationcode");
    window.history.replaceState(null, "", nextUrl.toString());
  };

  const handleDialogOpenChange = (open) => {
    if (open) return;

    onClose();
    resetForm();
    removeDonationCodeQuery();
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

  useEffect(() => {
    if (!isOpen) return;

    if (!initialAmount) {
      setSelectedAmount(null);
      setCustomAmount("");
      return;
    }

    if (presetAmounts.includes(initialAmount)) {
      setSelectedAmount(initialAmount);
      setCustomAmount("");
      return;
    }

    setSelectedAmount(null);
    setCustomAmount(formatRupiahInput(initialAmount));
  }, [initialAmount, isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const encodedDonationCode = new URLSearchParams(window.location.search).get(
      "donation_code",
    ) || new URLSearchParams(window.location.search).get("donationcode");
    if (!encodedDonationCode) return;

    setQueryDonationCode(encodedDonationCode);
  }, []);

  useEffect(() => {
    if (!queryDonation || !queryDonationCode) return;

    const proofUrl = queryDonation.bukti_pembayaran_manual || "";
    const displayDonationCode = getDisplayDonationCode(
      queryDonationCode,
      queryDonation.donation_code || queryDonation.donationCode,
    );

    setManualPayment({
      donationCode: queryDonationCode,
      encryptedDonationCode: queryDonationCode,
      displayDonationCode,
      amount: Number(queryDonation.amount) || Number(queryDonation.nominal) || 0,
      paymentStatus: queryDonation.payment_status || "",
    });
    setPaymentProofUrl(proofUrl);
    setExistingPaymentProofUrl(proofUrl);
    setPaymentMethod(PAYMENT_METHODS.manual);
  }, [queryDonation, queryDonationCode]);

  useEffect(() => {
    if (!isQueryDonationError) return;

    console.error("Error fetching donation:", queryDonationError);
    toast.error("Kode donasi tidak valid");
    removeDonationCodeQuery();
    setQueryDonationCode("");
  }, [isQueryDonationError, queryDonationError]);

  if (!campaign) return null;

  const isDirectParticipant = subscriberType === SUBSCRIBER_TYPES.direct;

  return (
    <Dialog
      open={isOpen || Boolean(manualPayment)}
      onOpenChange={handleDialogOpenChange}
    >
      <DialogContent className="max-w-2xl max-h-[70vh] md:max-h-[90vh] overflow-y-auto">
        {manualPayment ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Pembayaran manual
              </DialogTitle>
              <DialogDescription>
                Selesaikan transfer dan unggah bukti pembayaran untuk
                verifikasi.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Kode donasi</p>
                    <p className="text-base font-semibold text-foreground">
                      {manualPayment.displayDonationCode || manualPayment.donationCode}
                    </p>
                  </div>
                  {manualPayment.amount > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Nominal</p>
                      <p className="text-base font-semibold text-foreground">
                        {formatCurrency(manualPayment.amount)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Bank</p>
                    <p className="text-base font-semibold text-foreground">
                      {manualPaymentInfo.bank ||
                        (isSocioSettingsLoading ? "Memuat..." : "-")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Pemilik rekening
                    </p>
                    <p className="text-base font-semibold text-foreground">
                      {manualPaymentInfo.accountHolder ||
                        (isSocioSettingsLoading ? "Memuat..." : "-")}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">No rekening</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-xl font-bold text-foreground">
                      {manualPaymentInfo.accountNumber ||
                        (isSocioSettingsLoading ? "Memuat..." : "-")}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyAccountNumber}
                      disabled={!manualPaymentInfo.accountNumber}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Salin
                    </Button>
                  </div>
                </div>

                {manualPayment.paymentStatus === "settlement" && (
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-sm font-semibold text-emerald-800">
                      Status pembayaran
                    </p>
                    <p className="mt-1 text-sm text-emerald-700">
                      Pembayaran sudah terkonfirmasi.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Upload bukti pembayaran
                </Label>
                {existingPaymentProofUrl ? (
                  <div className="rounded-md border border-border p-3">
                    <p className="mb-3 text-sm font-medium text-muted-foreground">
                      Bukti pembayaran sudah dikirim.
                    </p>
                    <img
                      src={existingPaymentProofUrl}
                      alt="Bukti pembayaran manual"
                      className="max-h-64 w-auto max-w-full rounded-md object-contain"
                    />
                  </div>
                ) : (
                  <ImageUploader
                    value={paymentProofUrl}
                    onFinish={setPaymentProofUrl}
                    onUploadingChange={setIsUploadingProof}
                  />
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  className="w-full sm:flex-1"
                  onClick={handleManualProofSubmit}
                  disabled={
                    manualPayment.paymentStatus === "settlement" ||
                    Boolean(existingPaymentProofUrl) ||
                    !paymentProofUrl ||
                    isUploadingProof ||
                    isSubmitting
                  }
                >
                  {manualPayment.paymentStatus === "settlement"
                    ? "Pembayaran terkonfirmasi"
                    : existingPaymentProofUrl
                      ? "Bukti sudah dikirim"
                      : isUploadingProof || isSubmitting
                        ? "Mengirim..."
                      : "Kirim bukti pembayaran"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:flex-1"
                  onClick={() => {
                    onClose();
                    resetForm();
                    removeDonationCodeQuery();
                  }}
                >
                  Tutup
                </Button>
              </div>
            </div>
          </>
        ) : !showSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {campaign.title}
              </DialogTitle>
              <DialogDescription>
                Pilih jumlah donasi dan lengkapi informasi Anda
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 mt-4"
              autoComplete="off"
            >
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Pilih jumlah program submission
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
                    inputMode="numeric"
                    placeholder="Rp 0"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="text-gray-900 placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  Informasi subscriber
                </Label>

                <RadioGroup
                  value={subscriberType}
                  onValueChange={setSubscriberType}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                >
                  <Label
                    htmlFor="subscriber-direct"
                    className="flex items-center gap-3 rounded-lg border border-border p-4 cursor-pointer transition-colors hover:bg-muted/50"
                  >
                    <RadioGroupItem
                      id="subscriber-direct"
                      value={SUBSCRIBER_TYPES.direct}
                    />
                    <span className="font-medium">Partisipan Langsung</span>
                  </Label>
                  <Label
                    htmlFor="subscriber-external"
                    className="flex items-center gap-3 rounded-lg border border-border p-4 cursor-pointer transition-colors hover:bg-muted/50"
                  >
                    <RadioGroupItem
                      id="subscriber-external"
                      value={SUBSCRIBER_TYPES.external}
                    />
                    <span className="font-medium">Kontributor External</span>
                  </Label>
                </RadioGroup>

                <div>
                  <Label htmlFor="name">
                    Nama lengkap
                    {isDirectParticipant && (
                      <span className="ml-1 text-xs font-medium text-destructive">
                        *harus diisi
                      </span>
                    )}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    required={isDirectParticipant}
                    value={donorInfo.name}
                    onChange={(e) =>
                      setDonorInfo({ ...donorInfo, name: e.target.value })
                    }
                    className="text-gray-900 placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <Label htmlFor="email">
                    Email
                    {isDirectParticipant && (
                      <span className="ml-1 text-xs font-medium text-destructive">
                        *harus diisi
                      </span>
                    )}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required={isDirectParticipant}
                    value={donorInfo.email}
                    onChange={(e) =>
                      setDonorInfo({ ...donorInfo, email: e.target.value })
                    }
                    className="text-gray-900 placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">
                    Nomor telepon
                    {isDirectParticipant && (
                      <span className="ml-1 text-xs font-medium text-destructive">
                        *harus diisi
                      </span>
                    )}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    required={isDirectParticipant}
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
                  : `Lanjutkan ke Pembayaran ${getFinalAmount() > 0 ? formatCurrency(getFinalAmount()) : ""}`}
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
