import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
      <div className="w-20 h-20 bg-brand-softPink text-brand-rose rounded-full flex items-center justify-center mx-auto">
        <ShoppingBag className="w-10 h-10" />
      </div>
      <h1 className="font-serif text-3xl font-bold text-brand-dark">404 - Page Not Found</h1>
      <p className="text-xs sm:text-sm text-brand-muted">
        The boutique page or collection you are seeking might have been moved or is currently unavailable.
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-pink hover:bg-brand-rose text-white text-xs font-bold rounded-full transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
};
