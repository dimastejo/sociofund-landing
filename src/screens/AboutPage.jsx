'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Users, Lightbulb, Star, ArrowRight } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
function AboutPage() {
  const coreValues = [{
    title: 'Aksesibilitas',
    icon: Heart,
    description: 'Membuat pendidikan berkualitas tersedia untuk semua orang melalui model crowdfunding kami.'
  }, {
    title: 'Komunitas',
    icon: Users,
    description: 'Membangun ekosistem di mana pelajar dan pendidik saling mendukung.'
  }, {
    title: 'Inovasi',
    icon: Lightbulb,
    description: 'Menjadi pelopor dalam pendekatan baru pendidikan bahasa dan pendanaan.'
  }, {
    title: 'Keunggulan',
    icon: Star,
    description: 'Mempertahankan standar tinggi dalam desain kurikulum dan kualitas pengajaran.'
  }];
  return <>
      <div className="min-h-screen flex flex-col">
        <Header />

        {/* 1. HERO SECTION */}
        <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden bg-secondary">
          <div className="absolute inset-0">
            <img src="https://horizons-cdn.hostinger.com/13cfa1c3-d941-4ee5-a55f-474bf3bd73ff/dae07c0896c7afd00373bc89a41f4eba.jpg" alt="Komunitas pembelajaran dengan peserta di outdoor tent" className="w-full h-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/80 to-secondary/30"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-12">
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8
          }} className="max-w-4xl mx-auto">
              <h1 className="text-secondary-foreground mb-8">
                Tentang Sociofund
              </h1>
              <p className="text-xl md:text-2xl text-secondary-foreground/90 font-medium max-w-3xl mx-auto leading-relaxed">
                Sociofund.labs menciptakan ekosistem pembelajaran yang mudah diakses dan terjangkau di mana setiap individu di Indonesia memiliki kesempatan untuk berkembang.
              </p>
            </motion.div>
          </div>
        </section>

        {/* 2. INTRO SECTION */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }} className="max-w-4xl mx-auto">
              <h2 className="text-foreground font-medium leading-relaxed">
                Kami percaya bahwa pendidikan berkualitas harus dapat diakses oleh semua orang. Model crowdfunding kami mewujudkan visi tersebut menjadi kenyataan.
              </h2>
            </motion.div>
          </div>
        </section>

        {/* 3. OUR MISSION SECTION */}
        <section className="py-24 bg-muted/50 border-y">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6
            }}>
                <span className="text-sm font-bold tracking-widest text-primary uppercase mb-6 block">Misi Kami</span>
                <h2 className="mb-10">
                  Mendemokratisasi akses ke pendidikan khusus melalui dukungan komunitas.
                </h2>
                <div className="text-muted-foreground space-y-8 text-lg">
                  <p>
                    Sociofund.labs didirikan atas prinsip bahwa hambatan finansial tidak boleh mencegah siapa pun dari mengakses pendidikan bahasa berkualitas. Melalui model crowdfunding inovatif kami, kami menciptakan ekosistem di mana siswa dapat belajar dengan biaya jauh lebih rendah dari biaya tradisional.
                  </p>
                  <p>
                    Pendekatan kami melampaui pendanaan pendidikan tradisional. Kami membangun komunitas di mana pelajar saling mendukung, instruktur dibayar dengan adil, dan semua orang mendapat manfaat dari kesuksesan bersama.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 4. CORE VALUES SECTION */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="mb-6">Nilai-Nilai Inti Kami</h2>
              <p className="text-muted-foreground text-lg">
                Prinsip-prinsip ini memandu semua yang kami lakukan di Sociofund.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-7xl mx-auto">
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {coreValues.map((value, index) => {
                const Icon = value.icon;
                return <motion.div key={index} initial={{
                  opacity: 0,
                  y: 20
                }} whileInView={{
                  opacity: 1,
                  y: 0
                }} viewport={{
                  once: true
                }} transition={{
                  duration: 0.5,
                  delay: index * 0.1
                }}>
                      <Card className="h-full border-none bg-muted/30 hover:bg-muted/80 transition-colors duration-300">
                        <CardContent className="p-8">
                          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                            <Icon className="w-7 h-7 text-primary" />
                          </div>
                          <h3 className="mb-4">{value.title}</h3>
                          <p className="text-muted-foreground">
                            {value.description}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>;
              })}
              </div>
              
              <motion.div initial={{
              opacity: 0,
              x: 30
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6,
              delay: 0.2
            }} className="lg:col-span-5 relative mt-10 lg:mt-0">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-image-card bg-muted">
                  <img src="https://horizons-cdn.hostinger.com/13cfa1c3-d941-4ee5-a55f-474bf3bd73ff/605136465f152867829f21f0586a7940.jpg" alt="Peserta pembelajaran di dalam kelas dengan background orange dan navy" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-2xl -z-10"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 5. ECOSYSTEM MODEL SECTION */}
        <section className="py-24 bg-secondary text-secondary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div initial={{
              opacity: 0,
              x: -30
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6
            }}>
                <h2 className="mb-8">Model Ekosistem Kami</h2>
                <div className="space-y-8 text-secondary-foreground/80 mb-12 text-lg">
                  <p>
                    Pendekatan berbasis ekosistem kami menciptakan lingkungan pembelajaran yang berkelanjutan di mana biaya dibagikan di seluruh komunitas. Siswa berkontribusi sesuai kemampuan mereka, dan dukungan kolektif memastikan semua orang memiliki akses ke instruksi dan materi berkualitas.
                  </p>
                  <p>
                    Model ini telah memungkinkan kami melayani lebih dari 500 siswa di beberapa kampus Yogyakarta kami, dengan 87% melaporkan peningkatan signifikan dalam kemampuan bahasa mereka dalam periode pertama pembelajaran.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-10 border-t border-secondary-foreground/20">
                  <div>
                    <p className="text-[2.5rem] md:text-[3rem] font-bold text-primary mb-2 font-variant-numeric: tabular-nums leading-none">500+</p>
                    <p className="text-sm font-medium text-secondary-foreground/80 uppercase tracking-wider">Siswa</p>
                  </div>
                  <div>
                    <p className="text-[2.5rem] md:text-[3rem] font-bold text-primary mb-2 font-variant-numeric: tabular-nums leading-none">87%</p>
                    <p className="text-sm font-medium text-secondary-foreground/80 uppercase tracking-wider">Peningkatan</p>
                  </div>
                  <div>
                    <p className="text-[2.5rem] md:text-[3rem] font-bold text-primary mb-2 font-variant-numeric: tabular-nums leading-none">6</p>
                    <p className="text-sm font-medium text-secondary-foreground/80 uppercase tracking-wider">Kampus</p>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{
              opacity: 0,
              x: 30
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6
            }} className="relative mt-10 lg:mt-0">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-image-card bg-muted">
                  <img src="https://horizons-cdn.hostinger.com/13cfa1c3-d941-4ee5-a55f-474bf3bd73ff/dae07c0896c7afd00373bc89a41f4eba.jpg" alt="Komunitas pembelajaran dengan peserta di outdoor tent" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary rounded-2xl -z-10"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 6. OUR JOURNEY SECTION */}
        <section className="py-32 bg-background overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] md:text-[20rem] font-black text-muted/30 pointer-events-none select-none z-0">
            2026
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div initial={{
              opacity: 0,
              x: -30
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6
            }} className="order-2 lg:order-1 relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-image-card bg-muted">
                  <img src="https://horizons-cdn.hostinger.com/13cfa1c3-d941-4ee5-a55f-474bf3bd73ff/605136465f152867829f21f0586a7940.jpg" alt="Ruang kelas dalam ruangan dengan siswa perempuan berhijab yang antusias belajar" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-2xl -z-10"></div>
              </motion.div>

              <motion.div initial={{
              opacity: 0,
              x: 30
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6
            }} className="order-1 lg:order-2">
                <h2 className="mb-8">Perjalanan Kami</h2>
                <div className="text-muted-foreground space-y-8 text-lg">
                  <p>
                    Sociofund dimulai pada awal 2026 dengan satu ruang kelas di Giwangan Yogyakarta dan visi untuk mendemokratisasi pendidikan bahasa. Apa yang dimulai sebagai eksperimen dalam pembelajaran yang didanai komunitas dengan cepat berkembang menjadi gerakan.
                  </p>
                  <p>
                    Hari ini, kami mengoperasikan dua kampus, menawarkan delapan program bahasa, dan terus menjadi pelopor dalam cara-cara baru membuat pendidikan dapat diakses. Kesuksesan kami diukur bukan dari keuntungan, tetapi dari jumlah siswa yang mencapai tujuan pembelajaran bahasa mereka.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 7. CTA SECTION */}
        <section className="py-24 bg-primary text-primary-foreground text-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{
            opacity: 0,
            scale: 0.95
          }} whileInView={{
            opacity: 1,
            scale: 1
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5
          }} className="max-w-3xl mx-auto">
              <h2 className="mb-8">Jadilah bagian dari perubahan.</h2>
              <p className="mb-12 text-primary-foreground/90 text-xl">
                Bergabunglah dengan misi kami untuk membuat pendidikan berkualitas dapat diakses. Baik Anda ingin mendukung kampanye atau bermitra dengan kami, kami ingin terhubung.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/campaigns">
                  <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-14 px-8 text-lg font-semibold w-full sm:w-auto">
                    Lihat Kampanye Kami
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground/10 bg-transparent h-14 px-8 text-lg font-semibold w-full sm:w-auto">
                    Hubungi Kami <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>;
}
export default AboutPage;
