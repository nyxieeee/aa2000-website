import { useState, FormEvent } from 'react';
import { Gift, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHead } from '../components/ui/PageHead';
import { useCart } from '../context/CartContext';

type RedeemStatus = 'idle' | 'success' | 'error';

const Redeem = () => {
  const { applyDiscount, appliedCode } = useCart();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<RedeemStatus>(() => (appliedCode ? 'success' : 'idle'));

  const handleRedeem = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = applyDiscount(code);
    if (result.success) {
      setStatus('success');
    } else {
      setStatus('error');
    }
  };

  return (
    <article className="bg-white min-h-screen py-20 px-4 flex items-center justify-center">
      <PageHead title="Redeem Code" description="Enter your AA2000 promo code to unlock exclusive discounts on security solutions." />
      <div className="bg-white-light p-8 rounded-2xl border border-slate-200/50 shadow-2xl max-w-md w-full text-center">
        <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center border-2 border-aa-blue/20">
          <Gift className="h-10 w-10 text-aa-cyan" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Redeem Code</h1>
        <p className="text-slate-600 mb-8">Enter your promo code below to unlock exclusive discounts.</p>

        <form onSubmit={handleRedeem} className="space-y-4">
          <input
            type="text"
            placeholder="Enter Code (e.g. AA2000)"
            className="w-full bg-white border border-slate-200-light rounded-xl px-6 py-4 text-center text-slate-900 text-lg tracking-widest uppercase focus:outline-none focus:border-aa-blue focus:ring-1 focus:ring-aa-blue transition-all placeholder-aa-slate/50"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setStatus('idle');
            }}
          />
          <button
            type="submit"
            className="w-full py-3 bg-aa-blue text-slate-900 rounded-xl font-bold hover:bg-aa-blue-dark transition-colors shadow-lg shadow-aa-blue/20"
          >
            Apply Code
          </button>
        </form>

        <AnimatePresence>
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center justify-center space-x-2 text-green-400"
            >
              <Check className="h-5 w-5" />
              <span className="font-semibold">Code Applied! 20% Discount Unlocked.</span>
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center justify-center space-x-2 text-red-400"
            >
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">Invalid Code. Please try again.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
};

export default Redeem;
