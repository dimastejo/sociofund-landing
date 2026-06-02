import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ImageUploader from "@/components/ImageUploader.jsx";

const CAMPAIGN_API_URL = "https://sdvapp.cloud/api/v1/socio/campaign";

const formSchema = z.object({
  user_name: z.string().min(2, "Nama minimal 2 karakter"),
  user_email: z.string().email("Format email tidak valid"),
  user_phone: z
    .string()
    .regex(
      /^(^\+62|62|^08)(\d{3,4}-?){2}\d{3,4}$/,
      "Format nomor telepon Indonesia tidak valid (contoh: 08123456789)",
    ),
  title: z.string().min(3, "Nama Program minimal 3 karakter"),
  asal_sekolah: z.string().min(3, "Asal Sekolah minimal 3 karakter"),
  alamat_sekolah: z.string().min(10, "Alamat sekolah minimal 10 karakter"),
  target_amount: z
    .string()
    .min(1, "Nilai yang dibutuhkan wajib diisi")
    .transform((val) => Number(val.replace(/\D/g, "")))
    .refine((val) => val > 0, "Nilai harus lebih dari 0"),
  short_description: z.string().min(10, "Peruntukan dana minimal 10 karakter"),
  data_confirmation: z
    .boolean()
    .refine((val) => val === true, "Anda harus mengonfirmasi kebenaran data"),
});

function ProgramRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      data_confirmation: false,
    },
  });

  const formatRupiah = (value) => {
    if (!value) return "";
    const numberString = value.replace(/[^,\d]/g, "").toString();
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

  const handleAmountChange = (e) => {
    const formatted = formatRupiah(e.target.value);
    setValue("target_amount", formatted, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    if (!imageUrl) {
      setImageError("Foto wajib diunggah");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        user_name: data.user_name,
        user_email: data.user_email,
        user_phone: data.user_phone,
        title: data.title,
        asal_sekolah: data.asal_sekolah,
        alamat_sekolah: data.alamat_sekolah,
        target_amount: data.target_amount,
        short_description: data.short_description,
        data_confirmation: data.data_confirmation,
        status: "pending",
        image_url: imageUrl,
      };

      const response = await fetch(CAMPAIGN_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || result?.valid === false) {
        throw new Error(
          result?.message || `Request failed with status ${response.status}`,
        );
      }

      setIsSuccess(true);
      toast.success("Pendaftaran program berhasil dikirim!");
      reset();
      setImageUrl("");
      setImageError("");

      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Terjadi kesalahan saat mengirim data. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-card rounded-2xl shadow-lg p-8 text-center border border-border">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold mb-4">Pendaftaran Berhasil!</h3>
        <p className="text-muted-foreground mb-8">
          Terima kasih telah mendaftarkan program Anda. Tim kami akan meninjau
          pendaftaran Anda dan segera menghubungi PIC yang terdaftar.
        </p>
        <Button
          onClick={() => setIsSuccess(false)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Daftarkan Program Lain
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8 border border-border">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
        {/* PIC Name */}
        <div className="space-y-2">
          <label
            htmlFor="user_name"
            className="text-sm font-medium text-foreground"
          >
            Nama <span className="text-destructive">*</span>
          </label>
          <input
            id="user_name"
            type="text"
            className={`flex h-10 w-full rounded-md border ${errors.user_name ? "border-destructive" : "border-input"} bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            placeholder="Masukkan nama lengkap"
            {...register("user_name")}
          />
          {errors.user_name && (
            <p className="text-sm text-destructive">
              {errors.user_name.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="user_email"
              className="text-sm font-medium text-foreground"
            >
              Email <span className="text-destructive">*</span>
            </label>
            <input
              id="user_email"
              type="email"
              className={`flex h-10 w-full rounded-md border ${errors.user_email ? "border-destructive" : "border-input"} bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
              placeholder="nama@email.com"
              {...register("user_email")}
            />
            {errors.user_email && (
              <p className="text-sm text-destructive">
                {errors.user_email.message}
              </p>
            )}
          </div>

          {/* PIC Phone */}
          <div className="space-y-2">
            <label
              htmlFor="user_phone"
              className="text-sm font-medium text-foreground"
            >
              No Telp PIC <span className="text-destructive">*</span>
            </label>
            <input
              id="user_phone"
              type="tel"
              className={`flex h-10 w-full rounded-md border ${errors.user_phone ? "border-destructive" : "border-input"} bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
              placeholder="Contoh: 08123456789"
              {...register("user_phone")}
            />
            {errors.user_phone && (
              <p className="text-sm text-destructive">
                {errors.user_phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Program Name */}
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="text-sm font-medium text-foreground"
          >
            Nama Program <span className="text-destructive">*</span>
          </label>
          <input
            id="title"
            type="text"
            className={`flex h-10 w-full rounded-md border ${errors.title ? "border-destructive" : "border-input"} bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            placeholder="Masukkan nama program pendidikan"
            {...register("title")}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* School/Community Name */}
        <div className="space-y-2">
          <label
            htmlFor="asal_sekolah"
            className="text-sm font-medium text-foreground"
          >
            Asal Sekolah <span className="text-destructive">*</span>
          </label>
          <input
            id="asal_sekolah"
            type="text"
            className={`flex h-10 w-full rounded-md border ${errors.asal_sekolah ? "border-destructive" : "border-input"} bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            placeholder="Nama sekolah"
            {...register("asal_sekolah")}
          />
          {errors.asal_sekolah && (
            <p className="text-sm text-destructive">
              {errors.asal_sekolah.message}
            </p>
          )}
        </div>

        {/* School/Community Address */}
        <div className="space-y-2">
          <label
            htmlFor="alamat_sekolah"
            className="text-sm font-medium text-foreground"
          >
            Alamat Sekolah <span className="text-destructive">*</span>
          </label>
          <textarea
            id="alamat_sekolah"
            rows={3}
            className={`flex w-full rounded-md border ${errors.alamat_sekolah ? "border-destructive" : "border-input"} bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            placeholder="Alamat lengkap"
            {...register("alamat_sekolah")}
          />
          {errors.alamat_sekolah && (
            <p className="text-sm text-destructive">
              {errors.alamat_sekolah.message}
            </p>
          )}
        </div>

        {/* Funding Amount */}
        <div className="space-y-2">
          <label
            htmlFor="target_amount"
            className="text-sm font-medium text-foreground"
          >
            Nilai yang Dibutuhkan <span className="text-destructive">*</span>
          </label>
          <input
            id="target_amount"
            type="text"
            className={`flex h-10 w-full rounded-md border ${errors.target_amount ? "border-destructive" : "border-input"} bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            placeholder="Rp 0"
            {...register("target_amount")}
            onChange={handleAmountChange}
          />
          {errors.target_amount && (
            <p className="text-sm text-destructive">
              {errors.target_amount.message}
            </p>
          )}
        </div>

        {/* Funding Purpose */}
        <div className="space-y-2">
          <label
            htmlFor="short_description"
            className="text-sm font-medium text-foreground"
          >
            Peruntukan Dana <span className="text-destructive">*</span>
          </label>
          <textarea
            id="short_description"
            rows={4}
            className={`flex w-full rounded-md border ${errors.short_description ? "border-destructive" : "border-input"} bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            placeholder="Jelaskan secara detail untuk apa dana ini akan digunakan"
            {...register("short_description")}
          />
          {errors.short_description && (
            <p className="text-sm text-destructive">
              {errors.short_description.message}
            </p>
          )}
        </div>

        {/* Photo Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Foto Pendukung <span className="text-destructive">*</span>
          </label>
          <ImageUploader
            value={imageUrl}
            onFinish={(url) => {
              setImageUrl(url);
              setImageError("");
            }}
            onUploadingChange={setIsUploadingImage}
          />
          {imageError && (
            <p className="text-sm text-destructive">{imageError}</p>
          )}
        </div>

        {/* Data Confirmation */}
        <div className="flex items-start space-x-3 pt-4 border-t border-border w-full">
          <div className="flex items-center h-5 mt-0.5">
            <input
              id="data_confirmation"
              type="checkbox"
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              {...register("data_confirmation")}
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="data_confirmation"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Konfirmasi Data <span className="text-destructive">*</span>
            </label>
            <p className="text-sm text-muted-foreground">
              Saya menyatakan bahwa seluruh data yang diisi adalah benar dan
              dapat dipertanggungjawabkan.
            </p>
            {errors.data_confirmation && (
              <p className="text-sm text-destructive">
                {errors.data_confirmation.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={!isValid || !imageUrl || isUploadingImage || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Mengirim Data...
            </>
          ) : (
            "Daftarkan Program"
          )}
        </Button>
      </form>
    </div>
  );
}

export default ProgramRegistrationForm;
