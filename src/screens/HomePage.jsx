'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import CampaignCard from '@/components/CampaignCard.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import pb from '@/lib/pocketbaseClient.js';
import { Search, Heart, TrendingUp, Users, BookOpen, Award, AlertCircle, HeartHandshake as Handshake, GraduationCap, Microscope, School } from 'lucide-react';

function HomePage() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await pb.collection('campaigns').getList(1, 10, { 
        $autoCancel: false,
        sort: '-created'
      });
      
      // We no longer map resolvedImageUrl here, CampaignCard handles it directly
      setCampaigns(result.items);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError("Gagal memuat data kampanye. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Sort campaigns: 'Sedang berjalan' first, then 'Selesai'
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    if (a.status === 'Sedang berjalan' && b.status === 'Selesai') return -1;
    if (a.status === 'Selesai' && b.status === 'Sedang berjalan') return 1;
    return 0;
  });

  // Display only the first 2 campaigns as requested
  const displayedCampaigns = sortedCampaigns.slice(0, 2);

  const pillars = [
    {
      title: 'Program Pendidikan Ekosistem',
      description: 'Kolaborasi lintas institusi untuk menciptakan program pembelajaran berkualitas bersama komunitas dan mitra strategis.',
      icon: Handshake
    },
    {
      title: 'Beasiswa Berprestasi',
      description: 'Dukungan finansial bagi siswa berprestasi dari keluarga berpenghasilan rendah agar dapat terus mengembangkan potensinya.',
      icon: GraduationCap
    },
    {
      title: 'Hibah RnD Guru',
      description: 'Dana hibah untuk guru yang ingin melakukan riset dan inovasi pembelajaran demi meningkatkan kualitas pendidikan di Indonesia.',
      icon: Microscope
    },
    {
      title: 'Renovasi Sekolah',
      description: 'Membantu sekolah yang rusak mendapatkan fasilitas belajar yang layak sehingga proses pendidikan tidak terganggu.',
      icon: School
    }
  ];

  const stats = [{
    label: 'Total dana terkumpul',
    value: 'Rp 46,5 juta',
    icon: TrendingUp
  }, {
    label: 'Kampanye didanai',
    value: '6 kampanye',
    icon: BookOpen
  }, {
    label: 'Total donatur',
    value: '359 orang',
    icon: Users
  }];

  const steps = [{
    number: '01',
    title: 'Pilih kampanye',
    description: 'Jelajahi berbagai kampanye pendidikan yang membutuhkan dukungan Anda',
    icon: Search
  }, {
    number: '02',
    title: 'Donasi',
    description: 'Berikan kontribusi sesuai kemampuan Anda dengan proses yang mudah dan aman',
    icon: Heart
  }, {
    number: '03',
    title: 'Dampak nyata',
    description: 'Lihat langsung bagaimana donasi Anda membantu mewujudkan impian pendidikan',
    icon: Award
  }];

  const testimonials = [{
    name: 'Siti Nurhaliza',
    role: 'Mahasiswa Keperawatan',
    content: 'Berkat dukungan dari platform ini, saya bisa mengikuti kelas bahasa Jepang dan sekarang siap bekerja di Jepang. Terima kasih kepada semua donatur yang telah mendukung impian saya.',
    image: 'SN'
  }, {
    name: 'Dr. Ahmad Fauzi',
    role: 'Dosen STIKES Perkasa',
    content: 'Platform ini sangat membantu mahasiswa kami untuk mendapatkan pelatihan bahasa yang berkualitas. Transparansi dan kemudahan dalam proses donasi membuat banyak pihak tertarik untuk berkontribusi.',
    image: 'AF'
  }];

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header />

        <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://horizons-cdn.hostinger.com/13cfa1c3-d941-4ee5-a55f-474bf3bd73ff/b07ebb07df6a9ef671ed2ec1184247a6.jpg" alt="Siswa di ruang kelas sedang mengangkat tangan" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6" style={{ letterSpacing: '-0.02em' }}>
                Education Crowdfunding
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
                Menciptakan ekosistem pembelajaran yang mudah diakses dan terjangkau di mana setiap individu di Indonesia memiliki kesempatan untuk berkembang.
              </p>
              <Link href="/campaigns">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 font-semibold transition-transform active:scale-[0.98]">
                  Lihat kampanye
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Kampanye Aktif
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Dukung program pendidikan yang sedang membutuhkan bantuan Anda
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {[1, 2].map((n) => (
                  <Card key={n} className="overflow-hidden flex flex-col h-full">
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
            ) : error ? (
              <div className="text-center py-16 flex flex-col items-center max-w-md mx-auto bg-muted rounded-2xl border border-border">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg text-foreground font-medium mb-2">Oops!</p>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button onClick={fetchCampaigns} variant="outline" className="transition-all active:scale-[0.98]">
                  Coba Lagi
                </Button>
              </div>
            ) : displayedCampaigns.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center bg-muted rounded-2xl border border-border">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">Belum ada kampanye</h3>
                <p className="text-muted-foreground">Saat ini tidak ada kampanye aktif yang tersedia.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto mb-12">
                  {displayedCampaigns.map((campaign, index) => (
                    <CampaignCard key={campaign.id} campaign={campaign} index={index} />
                  ))}
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Link href="/campaigns" className="block w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-black text-lg px-12 py-7 font-bold transition-all active:scale-[0.98] shadow-lg rounded-xl"
                    >
                      Lihat Kampanye Lainnya
                    </Button>
                  </Link>
                </motion.div>
              </div>
            )}
          </div>
        </section>

        {/* New 4 Pilar Program Kami Section */}
        <section className="py-20 bg-[#F9FAFB]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Pilar Program Kami</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                SocioFund hadir untuk mendukung ekosistem pendidikan Indonesia melalui empat program utama
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {pillars.map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                  <motion.div
                    key={index}
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
                        <h3 className="text-xl font-bold mb-3 text-slate-900">{pillar.title}</h3>
                        <p className="text-slate-600 leading-relaxed">
                          {pillar.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted">
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
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
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
                        <p className="text-4xl font-bold text-primary mb-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {stat.value}
                        </p>
                        <p className="text-muted-foreground font-medium">{stat.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Testimoni</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Cerita dari mereka yang telah merasakan manfaatnya
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Card className="h-full border-none shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-8">
                      <div className="flex items-start mb-4">
                        <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg mr-4 flex-shrink-0 shadow-sm shadow-primary/20">
                          {testimonial.image}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed italic relative">
                        <span className="text-4xl text-primary/20 absolute -top-4 -left-2 leading-none font-serif">"</span>
                        {testimonial.content}
                        <span className="text-4xl text-primary/20 absolute -bottom-4 right-0 leading-none font-serif">"</span>
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

export default HomePage;
