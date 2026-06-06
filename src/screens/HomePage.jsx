"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import CampaignCard from "@/components/CampaignCard.jsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getPageSections } from "@/services/cmsService.js";
import {
  AlertCircle,
  BookOpen,
  GraduationCap,
  HeartHandshake as Handshake,
  Microscope,
  School,
  Search,
  Heart,
  Award,
  TrendingUp,
  Users,
} from "lucide-react";

const PILLAR_ICONS = [Handshake, GraduationCap, Microscope, School];
const CAMPAIGNS_API_URL = "https://sdvapp.cloud/api/v1/socio/campaigns?status=active";
const ICON_BY_NAME = {
  handshake: Handshake,
  graduation: GraduationCap,
  "graduation-cap": GraduationCap,
  microscope: Microscope,
  school: School,
  book: BookOpen,
};

function parseSectionContent(rawContent) {
  if (!rawContent) return {};
  if (typeof rawContent === "object") return rawContent;

  try {
    return JSON.parse(rawContent);
  } catch (error) {
    console.error("Gagal parse konten section CMS:", error);
    return {};
  }
}

function normalizeSections(items) {
  return items
    .map((section, index) => ({
      ...section,
      content: parseSectionContent(section.konten),
      sort_order: section.sort_order ?? index + 1,
    }))
    .sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
}

function getInitials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "SF"
  );
}

function getPillarIcon(iconName, index) {
  if (typeof iconName === "string" && iconName.trim()) {
    return (
      ICON_BY_NAME[iconName.trim().toLowerCase()] ||
      PILLAR_ICONS[index % PILLAR_ICONS.length]
    );
  }

  return PILLAR_ICONS[index % PILLAR_ICONS.length];
}

function normalizeCampaign(campaign) {
  const collectedAmount = Number(campaign.collected_amount) || 0;
  const targetAmount = Number(campaign.target_amount) || 0;
  const percentage =
    Number(campaign.collected_percentage) ||
    (targetAmount > 0 ? Math.round((collectedAmount / targetAmount) * 100) : 0);

  return {
    ...campaign,
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
    throw new Error(result.message || "Format data kampanye tidak valid");
  }

  return result.data.map(normalizeCampaign);
}

function SectionHeadingSkeleton({ muted = false }) {
  return (
    <div className="text-center mb-12">
      <Skeleton className="h-10 w-72 max-w-full mx-auto mb-4" />
      <Skeleton
        className={`h-5 w-[34rem] max-w-full mx-auto ${
          muted ? "bg-background/60" : ""
        }`}
      />
    </div>
  );
}

function CampaignCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
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
  );
}

function renderHeroSkeleton() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-muted">
      <div className="absolute inset-0">
        <Skeleton className="h-full w-full rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/35 to-black/20" />
      </div>
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Skeleton className="h-16 w-[42rem] max-w-full mx-auto mb-6 bg-white/25" />
        <Skeleton className="h-7 w-[38rem] max-w-full mx-auto mb-3 bg-white/20" />
        <Skeleton className="h-7 w-[30rem] max-w-full mx-auto mb-8 bg-white/20" />
        <Skeleton className="h-14 w-44 mx-auto rounded-md bg-white/25" />
      </div>
    </section>
  );
}

function renderCampaignSectionSkeleton() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeadingSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {[0, 1].map((index) => (
            <CampaignCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function renderPillarSectionSkeleton() {
  return (
    <section className="py-20 bg-[#F9FAFB]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeadingSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {[0, 1, 2, 3].map((index) => (
            <Card
              key={index}
              className="h-full border-none shadow-sm bg-white rounded-xl overflow-hidden"
            >
              <CardContent className="p-8">
                <Skeleton className="w-16 h-16 rounded-2xl mb-6" />
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function renderTestimonialSectionSkeleton() {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeadingSkeleton muted />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {[0, 1].map((index) => (
            <Card key={index} className="h-full border-none shadow-md">
              <CardContent className="p-8">
                <div className="flex items-start mb-6">
                  <Skeleton className="w-14 h-14 rounded-xl mr-4 flex-shrink-0" />
                  <div className="flex-1 pt-1">
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-11/12 mb-2" />
                <Skeleton className="h-4 w-4/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function renderDampak() {
  return (
    <section className="py-20 bg-background" key={999}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Dampak kami</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Kesempatan tumbuh dan berkembang bersama ekosistem
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="text-center p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-0">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <p
                      className="text-4xl font-bold text-primary mb-2"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-muted-foreground font-medium">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function renderPageSkeleton() {
  return (
    <>
      {renderHeroSkeleton()}
      {renderCampaignSectionSkeleton()}
      {renderPillarSectionSkeleton()}
      {renderTestimonialSectionSkeleton()}
    </>
  );
}

function renderEmptySections() {
  return (
    <section className="flex-1 py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16 flex flex-col items-center bg-muted rounded-2xl border border-border">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Konten belum tersedia</h1>
          <p className="text-muted-foreground">
            Section halaman Home belum tersedia dari CMS.
          </p>
        </div>
      </div>
    </section>
  );
}

const stats = [
  {
    label: "Total dana terkumpul",
    value: "Rp 46,5 juta",
    icon: TrendingUp,
  },
  {
    label: "Kampanye didanai",
    value: "6 kampanye",
    icon: BookOpen,
  },
  {
    label: "Total donatur",
    value: "359 orang",
    icon: Users,
  },
];

const steps = [
  {
    number: "01",
    title: "Pilih kampanye",
    description:
      "Jelajahi berbagai kampanye pendidikan yang membutuhkan dukungan Anda",
    icon: Search,
  },
  {
    number: "02",
    title: "Donasi",
    description:
      "Berikan kontribusi sesuai kemampuan Anda dengan proses yang mudah dan aman",
    icon: Heart,
  },
  {
    number: "03",
    title: "Dampak nyata",
    description:
      "Lihat langsung bagaimana donasi Anda membantu mewujudkan impian pendidikan",
    icon: Award,
  },
];

function HomePage() {
  const { data: sections = [], isLoading: isSectionsLoading } = useQuery({
    queryKey: ["cms", "page-sections", "Home"],
    queryFn: async () => {
      const result = await getPageSections("Home");
      return result.valid && Array.isArray(result.data)
        ? normalizeSections(result.data)
        : [];
    },
  });
  const {
    data: campaigns = [],
    isLoading: isCampaignsLoading,
    isError: isCampaignsError,
    refetch: refetchCampaigns,
  } = useQuery({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
  });

  const sortedCampaigns = useMemo(() => {
    return [...campaigns].sort((a, b) => {
      if (a.status === "Sedang berjalan" && b.status === "Selesai") return -1;
      if (a.status === "Selesai" && b.status === "Sedang berjalan") return 1;
      return 0;
    });
  }, [campaigns]);

  const renderHeroSection = (section) => {
    const content = section.content || {};

    return (
      <section
        key={section.id}
        className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0">
          {content.imageUrl ? (
            <img
              src={content.imageUrl}
              alt={content.heroText || "Sociofund hero"}
              className="w-full h-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6"
              style={{ letterSpacing: "-0.02em" }}
            >
              {content.heroText}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              {content.heroDescription}
            </p>
            {content.buttonText ? (
              <Link href={content.buttonUrl || "#"}>
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 font-semibold transition-transform active:scale-[0.98]"
                >
                  {content.buttonText}
                </Button>
              </Link>
            ) : null}
          </motion.div>
        </div>
      </section>
    );
  };

  const renderCampaignSection = (section) => {
    const content = section.content || {};
    const campaignLimit = 6; //Math.max(Number(content.jumlahGrid) || 2, 1);
    const displayedCampaigns = sortedCampaigns.slice(0, campaignLimit);
    const gridClass =
      campaignLimit >= 3
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl"
        : "grid-cols-1 md:grid-cols-2 max-w-5xl";

    return (
      <section key={section.id} className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {content.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {content.subtitle}
            </p>
          </div>

          {isCampaignsLoading ? (
            <div className={`grid ${gridClass} gap-8 mx-auto`}>
              {Array.from({ length: Math.min(campaignLimit, 3) }).map(
                (_, index) => (
                  <CampaignCardSkeleton key={index} />
                ),
              )}
            </div>
          ) : isCampaignsError ? (
            <div className="text-center py-16 flex flex-col items-center max-w-md mx-auto bg-muted rounded-2xl border border-border">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-foreground font-medium mb-2">Oops!</p>
              <p className="text-muted-foreground mb-6">
                Gagal memuat data kampanye. Silakan coba lagi.
              </p>
              <Button
                onClick={() => refetchCampaigns()}
                variant="outline"
                className="transition-all active:scale-[0.98]"
              >
                Coba Lagi
              </Button>
            </div>
          ) : displayedCampaigns.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center bg-muted rounded-2xl border border-border">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">Belum ada kampanye</h3>
              <p className="text-muted-foreground">
                Saat ini tidak ada kampanye aktif yang tersedia.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className={`grid ${gridClass} gap-8 w-full mx-auto mb-12`}>
                {displayedCampaigns.map((campaign, index) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    index={index}
                  />
                ))}
              </div>

              {content.buttonText ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={content.buttonUrl || "#"}
                    className="block w-full sm:w-auto"
                  >
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-black text-lg px-12 py-7 font-bold transition-all active:scale-[0.98] shadow-lg rounded-xl"
                    >
                      {content.buttonText}
                    </Button>
                  </Link>
                </motion.div>
              ) : null}
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderCaraKerja = () => {
    return (
      <section className="py-20 bg-muted" key={99}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Cara kerja</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tiga langkah mudah untuk membuat dampak nyata
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="text-center"
                >
                  <div className="relative mb-6">
                    <div className="text-8xl font-bold text-primary/10 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
                      {step.number}
                    </div>
                    <div className="relative z-10 w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
                      <Icon className="w-10 h-10 text-primary-foreground" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  const renderPillarSection = (section) => {
    const content = section.content || {};
    const programs = Array.isArray(content.program) ? content.program : [];

    return (
      <section key={section.id} className="py-20 bg-[#F9FAFB]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              {content.title}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {content.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {programs.map((program, index) => {
              const Icon = getPillarIcon(program.icon, index);

              return (
                <motion.div
                  key={`${program.title}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full border-none shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white rounded-xl overflow-hidden">
                    <CardContent className="p-8">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-slate-900">
                        {program.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {program.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  const renderTestimonialSection = (section) => {
    const content = section.content || {};
    const testimonials = Array.isArray(content.testimoni)
      ? content.testimoni
      : [];

    return (
      <section key={section.id} className="py-20 bg-muted">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {content.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {content.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={`${testimonial.name}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card className="h-full border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-start mb-4">
                      <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg mr-4 flex-shrink-0 shadow-sm shadow-primary/20">
                        {testimonial.image || getInitials(testimonial.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.subtitle}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed italic relative">
                      <span className="text-4xl text-primary/20 absolute -top-4 -left-2 leading-none font-serif">
                        "
                      </span>
                      {testimonial.description}
                      <span className="text-4xl text-primary/20 absolute -bottom-4 right-0 leading-none font-serif">
                        "
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderSection = (section) => {
    switch (section.komponen) {
      case "hero-section":
        return renderHeroSection(section);
      case "kampanye-aktif":
        return renderCampaignSection(section);
      case "pilar-program":
        return renderPillarSection(section);
      case "cara-kerja":
        return renderCaraKerja();
      case "dampak":
        return renderDampak();
      case "testimoni":
        return renderTestimonialSection(section);
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {isSectionsLoading
        ? renderPageSkeleton()
        : sections.length > 0
          ? sections.map(renderSection)
          : renderEmptySections()}
      <Footer />
    </div>
  );
}

export default HomePage;
