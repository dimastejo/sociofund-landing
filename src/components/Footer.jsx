import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <span className="text-xl font-bold text-primary">Sociofund</span>
            </div>
            <p className="text-sm text-secondary-foreground/80 leading-relaxed">
              Platform crowdfunding untuk mendukung pendidikan yang terjangkau, bisa diakses dan berkualitas di Indonesia.
            </p>
          </div>

          <div>
            <span className="font-semibold text-base mb-4 block">Quick links</span>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/campaigns" className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                  Campaigns
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/register-program" className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
                  Register Program
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <span className="font-semibold text-base mb-4 block">Contact Info</span>
            <ul className="space-y-3">
              <li className="flex items-start text-sm text-secondary-foreground/80">
                <Mail className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>support@sociofund.or.id</span>
              </li>
              <li className="flex items-start text-sm text-secondary-foreground/80">
                <Phone className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>+62 882 1115 5354</span>
              </li>
              <li className="flex items-start text-sm text-secondary-foreground/80">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Yogyakarta, Indonesia</span>
              </li>
            </ul>
          </div>

          <div>
            <span className="font-semibold text-base mb-4 block">Follow us</span>
            <div className="flex space-x-4">
              <a href="#" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/sociofund.labs/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary-foreground/80 hover:text-primary transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-secondary-foreground/80">
            © 2026 Sociofund. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-secondary-foreground/80 hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
