'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ProgramRegistrationForm from '@/components/ProgramRegistrationForm.jsx';
function RegisterProgramPage() {
  return <>
      <div className="min-h-screen flex flex-col">
        <Header />

        {/* HERO SECTION */}
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-secondary">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1632158707180-d2873939cd20" alt="Siswa belajar bersama di luar ruangan" className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 via-secondary/60 to-background"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-32">
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8
          }} className="max-w-3xl mx-auto">
              <h1 className="text-secondary-foreground mb-6">
                Register Your Program
              </h1>
              <p className="text-xl text-secondary-foreground/90 font-medium leading-relaxed">
                Punya inisiatif pendidikan yang berdampak? Daftarkan dirimu, rekanmu, gurumu, sekolahmu atau komunitas Anda untuk mendapatkan dukungan pendanaan dari komunitas Sociofund.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FORM SECTION */}
        <section className="relative z-20 -mt-24 pb-24 bg-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{
            opacity: 0,
            y: 40
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8,
            delay: 0.2
          }} className="max-w-4xl mx-auto">
              <ProgramRegistrationForm />
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>;
}
export default RegisterProgramPage;
