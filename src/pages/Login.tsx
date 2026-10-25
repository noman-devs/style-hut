import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, toggleDemoAdmin, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        showToast('Successfully signed in!', 'success');
        navigate('/account');
      } else {
        setError(result.error || 'Failed to sign in. Please verify your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20">
      <div className="bg-white p-8 rounded-3xl border border-brand-border shadow-card space-y-6">
        
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-brand-softPink text-brand-rose flex items-center justify-center mx-auto mb-2">
            <User className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-brand-dark">Welcome Back</h1>
          <p className="text-xs text-brand-muted">Sign in to access your Style Hut account</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
              />
              <User className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Password *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
              />
              <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-full bg-brand-pink hover:bg-brand-rose text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <span>Signing In...</span> : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-brand-border/60 text-center space-y-3">
          <p className="text-xs text-brand-muted">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-brand-rose font-bold hover:underline">
              Register here
            </Link>
          </p>

          <div className="pt-2">
            <button
              onClick={() => {
                toggleDemoAdmin();
                navigate('/admin');
              }}
              className="text-[11px] text-brand-muted hover:text-brand-dark border border-dashed border-brand-border px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
              <span>{isAdmin ? 'Enter Admin Panel' : 'Quick Demo Admin Access'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
