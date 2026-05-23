import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, X, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const formSchema = z.object({
  pic_name: z.string().min(2, "Nama PIC minimal 2 karakter"),
  pic_phone: z.string().regex(/^(^\+62|62|^08)(\d{3,4}-?){2}\d{3,4}$/, "Format nomor telepon Indonesia tidak valid (contoh: 08123456789)"),
  program_name: z.string().min(3, "Nama Program minimal 3 karakter"),
  school_community_name: z.string().min(3, "Asal Sekolah/Komunitas minimal 3 karakter"),
  school_community_address: z.string().min(10, "Alamat minimal 10 karakter"),
  funding_amount: z.string().min(1, "Nilai yang dibutuhkan wajib diisi").transform((val) => Number(val.replace(/\D/g, ''))).refine((val) => val > 0, "Nilai harus lebih dari 0"),
  funding_purpose: z.string().min(10, "Peruntukan dana minimal 10 karakter"),
  data_confirmation: z.boolean().refine((val) => val === true, "Anda harus mengonfirmasi kebenaran data"),
});

function ProgramRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      data_confirmation: false
    }
  });

  const fundingAmountValue = watch("funding_amount");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPhotoError("");

    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setPhotoError("Format file harus JPG, JPEG, atau PNG");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setPhotoError("Ukuran file maksimal 20MB");
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatRupiah = (value) => {
    if (!value) return "";
    const numberString = value.replace(/[^,\d]/g, '').toString();
    const split = numberString.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
      const separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }

    rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
    return rupiah ? `Rp ${rupiah}` : '';
  };

  const handleAmountChange = (e) => {
    const formatted = formatRupiah(e.target.value);
    setValue("funding_amount", formatted, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    if (!photoFile) {
      setPhotoError("Foto wajib diunggah");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('pic_name', data.pic_name);
      formData.append('pic_phone', data.pic_phone);
      formData.append('program_name', data.program_name);
      formData.append('school_community_name', data.school_community_name);
      formData.append('school_community_address', data.school_community_address);
      formData.append('funding_amount', data.funding_amount);
      formData.append('funding_purpose', data.funding_purpose);
      formData.append('data_confirmation', data.data_confirmation);
      formData.append('status', 'pending');
      formData.append('photo', photoFile);

      await pb.collection('program_registrations').create(formData, { $autoCancel: false });
      
      setIsSuccess(true);
      toast.success("Pendaftaran program berhasil dikirim!");
      reset();
      removePhoto();
      
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
          Terima kasih telah mendaftarkan program Anda. Tim kami akan meninjau pendaftaran Anda dan segera menghubungi PIC yang terdaftar.
        </p>
        <Button onClick={() => setIsSuccess(false)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          Daftarkan Program Lain
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8 border border-border">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PIC Name */}
          <div className="space-y-2">
            <label htmlFor="pic_name" className="text-sm font-medium text-foreground">Nama PIC <span className="text-destructive">*</span></label>
            <input
              id="pic_name"
              type="text"
              className={`flex h-10 w-full rounded-md border ${errors.pic_name ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
              placeholder="Masukkan nama lengkap PIC"
              {...register("pic_name")}
            />
            {errors.pic_name && <p className="text-sm text-destructive">{errors.pic_name.message}</p>}
          </div>

          {/* PIC Phone */}
          <div className="space-y-2">
            <label htmlFor="pic_phone" className="text-sm font-medium text-foreground">No Telp PIC <span className="text-destructive">*</span></label>
            <input
              id="pic_phone"
              type="tel"
              className={`flex h-10 w-full rounded-md border ${errors.pic_phone ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
              placeholder="Contoh: 08123456789"
              {...register("pic_phone")}
            />
            {errors.pic_phone && <p className="text-sm text-destructive">{errors.pic_phone.message}</p>}
          </div>
        </div>

        {/* Program Name */}
        <div className="space-y-2">
          <label htmlFor="program_name" className="text-sm font-medium text-foreground">Nama Program <span className="text-destructive">*</span></label>
          <input
            id="program_name"
            type="text"
            className={`flex h-10 w-full rounded-md border ${errors.program_name ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            placeholder="Masukkan nama program pendidikan"
            {...register("program_name")}
          />
          {errors.program_name && <p className="text-sm text-destructive">{errors.program_name.message}</p>}
        </div>

        {/* School/Community Name */}
        <div className="space-y-2">
          <label htmlFor="school_community_name" className="text-sm font-medium text-foreground">Asal Sekolah/Komunitas <span className="text-destructive">*</span></label>
          <input
            id="school_community_name"
            type="text"
            className={`flex h-10 w-full rounded-md border ${errors.school_community_name ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            placeholder="Nama sekolah atau komunitas"
            {...register("school_community_name")}
          />
          {errors.school_community_name && <p className="text-sm text-destructive">{errors.school_community_name.message}</p>}
        </div>

        {/* School/Community Address */}
        <div className="space-y-2">
          <label htmlFor="school_community_address" className="text-sm font-medium text-foreground">Alamat Sekolah/Komunitas <span className="text-destructive">*</span></label>
          <textarea
            id="school_community_address"
            rows={3}
            className={`flex w-full rounded-md border ${errors.school_community_address ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            placeholder="Alamat lengkap"
            {...register("school_community_address")}
          />
          {errors.school_community_address && <p className="text-sm text-destructive">{errors.school_community_address.message}</p>}
        </div>

        {/* Funding Amount */}
        <div className="space-y-2">
          <label htmlFor="funding_amount" className="text-sm font-medium text-foreground">Nilai yang Dibutuhkan <span className="text-destructive">*</span></label>
          <input
            id="funding_amount"
            type="text"
            className={`flex h-10 w-full rounded-md border ${errors.funding_amount ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            placeholder="Rp 0"
            {...register("funding_amount")}
            onChange={handleAmountChange}
          />
          {errors.funding_amount && <p className="text-sm text-destructive">{errors.funding_amount.message}</p>}
        </div>

        {/* Funding Purpose */}
        <div className="space-y-2">
          <label htmlFor="funding_purpose" className="text-sm font-medium text-foreground">Peruntukan Dana <span className="text-destructive">*</span></label>
          <textarea
            id="funding_purpose"
            rows={4}
            className={`flex w-full rounded-md border ${errors.funding_purpose ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            placeholder="Jelaskan secara detail untuk apa dana ini akan digunakan"
            {...register("funding_purpose")}
          />
          {errors.funding_purpose && <p className="text-sm text-destructive">{errors.funding_purpose.message}</p>}
        </div>

        {/* Photo Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Foto Pendukung <span className="text-destructive">*</span></label>
          
          {!photoPreview ? (
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:bg-muted/50 ${photoError ? 'border-destructive' : 'border-border'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Klik untuk mengunggah foto</p>
              <p className="text-xs text-muted-foreground">JPG, JPEG, PNG (Maks. 20MB)</p>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden border border-border inline-block">
              <img src={photoPreview} alt="Preview" className="h-48 w-auto object-cover" />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 bg-background/80 backdrop-blur p-1 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png"
            className="hidden"
          />
          {photoError && <p className="text-sm text-destructive">{photoError}</p>}
        </div>

        {/* Data Confirmation */}
        <div className="flex items-start space-x-3 pt-4 border-t border-border">
          <div className="flex items-center h-5 mt-0.5">
            <input
              id="data_confirmation"
              type="checkbox"
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              {...register("data_confirmation")}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="data_confirmation" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Konfirmasi Data <span className="text-destructive">*</span>
            </label>
            <p className="text-sm text-muted-foreground">
              Saya menyatakan bahwa seluruh data yang diisi adalah benar dan dapat dipertanggungjawabkan.
            </p>
            {errors.data_confirmation && <p className="text-sm text-destructive">{errors.data_confirmation.message}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={!isValid || !photoFile || isSubmitting}
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