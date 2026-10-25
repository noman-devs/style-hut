import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { ArrowLeft, ShieldCheck, FileText, RefreshCw } from 'lucide-react';

export const Policies: React.FC = () => {
  const { policyType } = useParams<{ policyType: string }>();
  const { settings } = useStore();

  const getPolicyContent = () => {
    switch (policyType) {
      case 'return-and-refund':
        return {
          title: 'Return & Exchange Policy',
          icon: <RefreshCw className="w-8 h-8 text-brand-rose" />,
          content: `Style Hut values your utmost satisfaction with every boutique acquisition.
          
1. 7-Day Exchange Window
You can request an exchange or return for any unworn, unwashed item within 7 calendar days of delivery. All original tags, boutique packaging, and security labels must be intact.

2. Damaged or Incorrect Item
In the rare event that an item arrives damaged or differs from your order, please notify our customer hotline or WhatsApp (+880 1711-987654) within 24 hours of delivery with photographic evidence. We will arrange a complimentary courier pickup and replacement.

3. Refund Processing
Approved refunds are credited via your original payment method (bKash, Nagad, Rocket, or Bank Transfer) within 3-5 business days upon our Dhaka boutique team inspecting the returned goods.`,
        };
      case 'terms':
        return {
          title: 'Terms & Conditions',
          icon: <FileText className="w-8 h-8 text-brand-rose" />,
          content: `Welcome to Style Hut. By accessing our website, placing an order, or utilizing our services in Bangladesh, you agree to comply with the following terms:

1. Pricing & Product Descriptions
All prices are quoted in Bangladeshi Taka (BDT ৳) and include applicable trade taxes unless explicitly noted. We strive for extreme color and fabric fidelity, though individual mobile and monitor screens may present slight variations.

2. Cash on Delivery (COD) Policy
Cash on Delivery is extended nationwide across all 64 districts in Bangladesh as a service of trust. Repeated non-acceptance or fraudulent refusal of dispatched parcels without valid cause may result in suspension of COD privileges.

3. Intellectual Property
All photographs, branding, product names, and bespoke designs hosted on Style Hut are the exclusive property of Style Hut Bangladesh.`,
        };
      case 'privacy':
      default:
        return {
          title: 'Privacy Policy',
          icon: <ShieldCheck className="w-8 h-8 text-brand-rose" />,
          content: `Your personal privacy is of paramount importance to Style Hut Bangladesh.

1. Information We Collect
We collect details such as your full name, mobile number, email address, and delivery coordinates solely to process orders, verify payments, and coordinate courier deliveries.

2. Protection of Financial Details
Style Hut never stores your mobile banking PINs or bank credentials. All manual mobile transactions (bKash, Nagad, Rocket) are submitted through end-to-end encrypted transaction references.

3. Third-Party Sharing
We never sell, rent, or trade your data to third-party marketing companies. Data is shared exclusively with our contracted delivery logistics partners (e.g., RedX, Steadfast, Pathao) solely for the fulfillment of your package.`,
        };
    }
  };

  const { title, icon, content } = getPolicyContent();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-rose hover:text-brand-pink transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Storefront</span>
      </Link>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-brand-border shadow-soft space-y-6">
        <div className="flex items-center gap-4 border-b border-brand-border pb-6">
          <div className="p-3 bg-brand-softPink rounded-2xl">
            {icon}
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-brand-rose font-bold">
              Style Hut Legal & Customer Care
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark mt-0.5">
              {title}
            </h1>
          </div>
        </div>

        <div className="text-sm text-brand-dark/85 leading-relaxed space-y-4 whitespace-pre-line font-light">
          {content}
        </div>

        <div className="pt-6 border-t border-brand-border text-xs text-brand-muted space-y-1">
          <p>For questions or assistance regarding this policy:</p>
          <p><strong>Hotline:</strong> {settings.phone} | <strong>Email:</strong> {settings.email}</p>
          <p><strong>Boutique Address:</strong> {settings.address}</p>
        </div>
      </div>
    </div>
  );
};
