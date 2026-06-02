"use client";

import React, { useState } from "react";
import { Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { API_BASE_URL } from "@/lib/apiClient.js";

const SUPPORT_EMAIL = "support@sociofund.or.id";
const CONTACT_API_URL = `${API_BASE_URL}/v1/socio/kontak`;

function KontakPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    no_telp: "",
    pesan: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);

    try {
      const response = await fetch(CONTACT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || result?.valid === false) {
        throw new Error(
          result?.message || `Request failed with status ${response.status}`,
        );
      }

      toast.success("Pesan berhasil dikirim.");
      setFormData({ nama: "", email: "", no_telp: "", pesan: "" });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-background">
        <section className="bg-muted border-b border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <h1
              className="text-4xl md:text-5xl font-extrabold mb-4 text-foreground"
              style={{ letterSpacing: "-0.02em" }}
            >
              Kontak
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Ceritakan kebutuhan Anda, tim Sociofund akan membantu
              menghubungkan langkah berikutnya.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="shadow-sm border-border/50">
                <CardHeader>
                  <CardTitle>Kirim pesan</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="nama">Nama</Label>
                      <Input
                        id="nama"
                        name="nama"
                        value={formData.nama}
                        onChange={handleChange}
                        placeholder="Nama lengkap"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="nama@email.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="noHp">No HP</Label>
                        <Input
                          id="no_telp"
                          name="no_telp"
                          type="tel"
                          value={formData.no_telp}
                          onChange={handleChange}
                          placeholder="08123456789"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pesan">Pesan</Label>
                      <Textarea
                        id="pesan"
                        name="pesan"
                        value={formData.pesan}
                        onChange={handleChange}
                        placeholder="Tulis pesan Anda"
                        rows={6}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full md:w-auto font-semibold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {isSubmitting ? "Mengirim..." : "Kirim pesan"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="shadow-sm border-border/50">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Email
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {SUPPORT_EMAIL}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        No HP
                      </p>
                      <p className="text-sm text-muted-foreground">
                        +62 882 1115 5354
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Lokasi
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Yogyakarta, Indonesia
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default KontakPage;
