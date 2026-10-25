import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle, Heart, ArrowUpRight } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';

export const Footer: React.FC = () => {
  const { settings, socialLinks, categories } = useStore();

  return (
    <footer className="bg-brand-charcoal text-white/90 pt-16 pb-24 md:pb-12 border-t border-brand-rose/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block group">
              <span className="font-serif text-3xl font-bold tracking-tight text-white group-hover:text-brand-pink transition-colors">
                STYLE <span className="text-brand-pink">HUT</span>
              </span>
              <span className="block text-[10px] tracking-[0.25em] text-brand-gold uppercase font-semibold mt-0.5">
                {settings.tagline || 'Be Your Own Style'}
              </span>
            </Link>

            <p className="text-sm text-gray-300 leading-relaxed max-w-sm">
              Discover Bangladesh's premier boutique destination for curated women's fashion, authentic Jamdani sarees, handcrafted festive suits, luxury modest wear and timeless bridal jewellery.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-pink text-white flex items-center justify-center transition-all text-xs font-bold"
                  aria-label={link.platform}
                >
                  {link.platform.charAt(0)}
                </a>
              ))}
              {settings.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 text-xs font-semibold transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Shop Categories */}
          <div>
            <h4 className="font-serif text-base font-semibold text-white tracking-wide uppercase mb-4 text-brand-gold">
              Categories
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              {categories.slice(0, 6).map(cat => (
                <li key={cat.id}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="hover:text-brand-pink transition-colors flex items-center gap-1 group"
                  >
                    <span>{cat.name}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/products" className="text-brand-pink hover:underline font-medium">
                  View All Collections →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h4 className="font-serif text-base font-semibold text-white tracking-wide uppercase mb-4 text-brand-gold">
              Customer Care
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/track-order" className="hover:text-brand-pink transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-brand-pink transition-colors">
                  Order History
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-brand-pink transition-colors">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link to="/policies/return-and-refund" className="hover:text-brand-pink transition-colors">
                  Return & Exchange Policy
                </Link>
              </li>
              <li>
                <Link to="/policies/privacy" className="hover:text-brand-pink transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/policies/terms" className="hover:text-brand-pink transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Boutique Address & Contact */}
          <div>
            <h4 className="font-serif text-base font-semibold text-white tracking-wide uppercase mb-4 text-brand-gold">
              Dhaka Boutique
            </h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-pink flex-shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed">{settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-pink flex-shrink-0" />
                <a href={`tel:${settings.phone}`} className="text-xs hover:text-brand-pink transition-colors">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-pink flex-shrink-0" />
                <a href={`mailto:${settings.email}`} className="text-xs hover:text-brand-pink transition-colors">
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Strip: Payment Badges & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-gray-400 text-center md:text-left flex items-center gap-1">
            <span>© {new Date().getFullYear()} {settings.store_name}. Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-brand-rose inline fill-brand-rose" />
            <span>in Bangladesh. All rights reserved.</span>
          </p>

          {/* Payment Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-gray-400 mr-2">Secure Payments:</span>
            <span className="px-2.5 py-1 bg-white/10 rounded border border-white/15 text-[11px] font-bold text-pink-300">
              bKash
            </span>
            <span className="px-2.5 py-1 bg-white/10 rounded border border-white/15 text-[11px] font-bold text-orange-300">
              Nagad
            </span>
            <span className="px-2.5 py-1 bg-white/10 rounded border border-white/15 text-[11px] font-bold text-purple-300">
              Rocket
            </span>
            <span className="px-2.5 py-1 bg-white/10 rounded border border-white/15 text-[11px] font-bold text-emerald-300">
              Cash on Delivery
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
