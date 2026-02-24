import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { ArrowLeft, ShoppingCart, CheckCircle, Package, Wrench, FileText, Shield } from 'lucide-react';
import { PageHead } from '../components/ui/PageHead';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { getProductById, loading } = useProducts();
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const product = getProductById(parseInt(id ?? '0', 10));

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <PageHead title="Loading…" />
        <p className="text-slate-600">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <PageHead title="Product Not Found" />
        <h2 className="text-3xl text-slate-900 font-bold mb-4">Product Not Found</h2>
        <button onClick={() => navigate('/products')} className="px-6 py-3 bg-aa-blue text-slate-900 rounded-lg font-bold hover:bg-aa-blue-dark transition-colors">
          Back to Products
        </button>
      </div>
    );
  }

  const totalPrice = includeInstallation ? product.price + product.installationPrice : product.price;

  const handleAddToCart = () => {
    const productToAdd = {
      ...product,
      price: totalPrice,
      name: includeInstallation ? `${product.name} (with Installation)` : product.name
    };
    addToCart(productToAdd);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <article className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <PageHead
        title={product.name}
        description={product.description}
      />
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate('/products')} className="flex items-center text-aa-blue hover:text-aa-cyan mb-8 font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="bg-white-light rounded-2xl overflow-hidden border border-slate-200/50 shadow-xl">
              <img
                src={product.image}
                alt={product.name}
                fetchPriority="high"
                decoding="async"
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="bg-aa-navy text-white p-6 rounded-xl">
              <div className="flex items-center mb-3">
                <Shield className="h-5 w-5 mr-2 text-aa-cyan" />
                <h3 className="font-bold">Quality Guarantee</h3>
              </div>
              <p className="text-aa-slate text-sm">
                All AA2000 products come with manufacturer warranty and our satisfaction guarantee. Professional installation available.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-aa-cyan text-sm font-bold uppercase tracking-wider">{product.category}</span>
              <h1 className="text-4xl font-bold text-slate-900 mt-2 mb-4">{product.name}</h1>
              <p className="text-slate-600 text-lg leading-relaxed">{product.fullDescription}</p>
            </div>

            <div className="bg-white-light p-6 rounded-xl border border-slate-200/50">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-3xl font-bold text-slate-900">PHP {totalPrice.toLocaleString()}</span>
                  {includeInstallation && (
                    <p className="text-sm text-slate-600 mt-1">
                      Product: PHP {product.price.toLocaleString()} + Installation: PHP {product.installationPrice.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6 p-4 bg-white rounded-lg border border-slate-200">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeInstallation}
                    onChange={(e) => setIncludeInstallation(e.target.checked)}
                    className="mt-1 mr-3 h-5 w-5 text-aa-blue focus:ring-aa-blue border-slate-300 rounded"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center">
                      <Wrench className="h-4 w-4 mr-2 text-aa-blue" />
                      <span className="font-semibold text-slate-900">Professional Installation</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      Have our certified technicians install and configure your system. Includes setup, testing, and training.
                    </p>
                    <p className="text-sm font-medium text-aa-blue mt-2">
                      +PHP {product.installationPrice.toLocaleString()}
                    </p>
                  </div>
                </label>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-aa-blue text-slate-900 rounded-xl font-bold text-lg hover:bg-aa-blue-dark transition-colors shadow-lg shadow-aa-blue/20 flex items-center justify-center"
                >
                  {addedToCart ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/contact" className="py-3 border border-aa-slate/30 text-slate-600 hover:text-slate-900 hover:border-aa-cyan rounded-lg text-sm font-medium flex items-center justify-center transition-colors">
                    <FileText className="h-4 w-4 mr-1" /> Free Quote
                  </Link>
                  <Link to="/contact" className="py-3 border border-aa-slate/30 text-slate-600 hover:text-slate-900 hover:border-aa-cyan rounded-lg text-sm font-medium flex items-center justify-center transition-colors">
                    <CheckCircle className="h-4 w-4 mr-1" /> Site Assessment
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          <div className="bg-white-light p-8 rounded-2xl border border-slate-200/50">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <Shield className="h-6 w-6 mr-2 text-aa-blue" />
              Technical Specifications
            </h2>
            <div className="space-y-3">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between py-3 border-b border-slate-200/50 last:border-0">
                  <span className="text-slate-600 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-slate-900 font-semibold text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white-light p-8 rounded-2xl border border-slate-200/50">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <Package className="h-6 w-6 mr-2 text-aa-blue" />
              Package Inclusions
            </h2>
            <ul className="space-y-3">
              {product.inclusions.map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {product.installationPrice > 0 && (
          <div className="mt-8 bg-gradient-to-r from-aa-navy to-aa-blue-dark p-8 rounded-2xl text-white">
            <div className="flex items-start">
              <Wrench className="h-8 w-8 text-aa-cyan mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold mb-3">Professional Installation Service</h3>
                <p className="text-aa-slate mb-4 leading-relaxed">
                  Our certified technicians will handle the complete installation process, including mounting, wiring, network configuration, and system testing. We'll also provide comprehensive training on how to use your new security system effectively.
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-aa-cyan mr-2" />
                    Complete setup & configuration
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-aa-cyan mr-2" />
                    System testing & optimization
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-aa-cyan mr-2" />
                    User training included
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-aa-cyan mr-2" />
                    90-day installation warranty
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default ProductDetails;
