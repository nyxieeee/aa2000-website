import { useState, ChangeEvent, FormEvent } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, User, ArrowLeft, CheckCircle } from 'lucide-react';
import { PageHead } from '../components/ui/PageHead';
import { checkoutSchema, type CheckoutFormData } from '../lib/validations';
import { submitOrder } from '../lib/api';

const initialFormData: CheckoutFormData = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  zipCode: '',
  cardNumber: '',
  expiryDate: '',
  cvv: ''
};

const Checkout = () => {
  const { cart, subtotal, discount, discountAmount, totalPrice, appliedCode, clearCart } = useCart();
  const navigate = useNavigate();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    setFormData({ ...formData, [target.name]: target.value });
    if (errors[target.name as keyof CheckoutFormData]) {
      setErrors((prev) => ({ ...prev, [target.name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as keyof CheckoutFormData;
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitError(null);
    setSubmitting(true);
    try {
      await submitOrder({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
        subtotal,
        discountAmount,
        discountCode: appliedCode || undefined,
        total: totalPrice,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      });
      setOrderPlaced(true);
      setTimeout(() => {
        clearCart();
        navigate('/');
      }, 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit order. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <article className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <PageHead title="Checkout" description="AA2000 Security - Secure checkout" />
        <h2 className="text-3xl text-slate-900 font-bold mb-4">Your Cart is Empty</h2>
        <p className="text-slate-600 mb-8">Add items to your cart before checking out.</p>
        <button onClick={() => navigate('/products')} className="px-6 py-3 bg-aa-blue text-slate-900 rounded-lg font-bold hover:bg-aa-blue-dark transition-colors">
          Browse Products
        </button>
      </article>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="bg-white-light p-8 rounded-2xl border border-slate-200/50 shadow-xl max-w-md w-full text-center">
          <div className="bg-green-500/10 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Order Placed Successfully!</h2>
          <p className="text-slate-600 mb-6">Thank you for your purchase. We'll send you a confirmation email shortly.</p>
          <p className="text-sm text-slate-500">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  const inputClass = (field: keyof CheckoutFormData) =>
    `w-full bg-white border rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-1 transition-all ${errors[field] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-aa-blue focus:ring-aa-blue'}`;

  return (
    <article className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <PageHead title="Checkout" description="Complete your order - AA2000 Security" />
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate('/cart')} className="flex items-center text-aa-blue hover:text-aa-cyan mb-8 font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </button>

        <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white-light p-6 rounded-xl border border-slate-200/50">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-aa-blue" />
                  Customer Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Full Name</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={inputClass('fullName')} placeholder="John Doe" />
                    {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass('email')} placeholder="john@example.com" />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-600 mb-2">Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass('phone')} placeholder="+63 912 345 6789" />
                    {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-white-light p-6 rounded-xl border border-slate-200/50">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-aa-blue" />
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass('address')} placeholder="123 Main Street" />
                    {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">City</label>
                      <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass('city')} placeholder="Manila" />
                      {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Zip Code</label>
                      <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className={inputClass('zipCode')} placeholder="1000" />
                      {errors.zipCode && <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white-light p-6 rounded-xl border border-slate-200/50">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-aa-blue" />
                  Payment Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Card Number</label>
                    <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} className={inputClass('cardNumber')} placeholder="1234 5678 9012 3456" maxLength={19} />
                    {errors.cardNumber && <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Expiry Date</label>
                      <input type="text" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className={inputClass('expiryDate')} placeholder="MM/YY" maxLength={5} />
                      {errors.expiryDate && <p className="mt-1 text-sm text-red-500">{errors.expiryDate}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">CVV</label>
                      <input type="text" name="cvv" value={formData.cvv} onChange={handleChange} className={inputClass('cvv')} placeholder="123" maxLength={4} />
                      {errors.cvv && <p className="mt-1 text-sm text-red-500">{errors.cvv}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {submitError && (
              <p className="text-red-500 text-sm">{submitError}</p>
            )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-aa-blue text-slate-900 rounded-xl font-bold text-lg hover:bg-aa-blue-dark transition-colors shadow-lg shadow-aa-blue/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Place Order'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white-light p-6 rounded-xl border border-slate-200/50 sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h3>

              <div className="space-y-4 mb-6 border-b border-slate-200/30 pb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.name} x {item.quantity}</span>
                    <span className="text-slate-900 font-medium">PHP {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 border-b border-slate-200/30 pb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>PHP {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCode})</span>
                    <span>-PHP {discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
              </div>

              <div className="flex justify-between text-slate-900 font-bold text-xl mb-4">
                <span>Total</span>
                <span>PHP {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <p className="text-slate-600 text-xs text-center">
                Secure checkout powered by AA2000 Security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default Checkout;
