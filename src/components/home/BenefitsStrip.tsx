import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';

export const BenefitsStrip: React.FC = () => {
  const benefits = [
    {
      icon: <Truck className="w-6 h-6 text-brand-rose" />,
      title: 'Cash on Delivery',
      subtitle: 'Available nationwide across 64 districts',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-brand-rose" />,
      title: '100% Authentic Quality',
      subtitle: 'Finest handpicked boutique fabrics',
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-brand-rose" />,
      title: '7-Day Easy Return',
      subtitle: 'Hassle-free Dhaka boutique exchange',
    },
    {
      icon: <Headphones className="w-6 h-6 text-brand-rose" />,
      title: 'Dedicated Support',
      subtitle: 'Phone & WhatsApp assistance daily',
    },
  ];

  return (
    <div className="border-y border-brand-border/60 bg-white py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {benefits.map((benefit, i) => (
            <div key={i} className="flex items-start gap-3.5 group">
              <div className="p-3 rounded-2xl bg-brand-softPink/60 group-hover:bg-brand-softPink transition-colors flex-shrink-0">
                {benefit.icon}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-brand-dark">
                  {benefit.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-brand-muted mt-0.5">
                  {benefit.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
