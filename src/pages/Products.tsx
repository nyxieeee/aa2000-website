import { useState, useEffect } from 'react';
import { ShoppingCart, FileText, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { PRODUCT_CATEGORIES } from '../constants';
import { PageHead } from '../components/ui/PageHead';

const PRODUCT_FILTER_KEY = 'aa2000-products-filter';

const Products = () => {
  const { products, loading } = useProducts();
  const [filter, setFilter] = useState(() => {
    try {
      return localStorage.getItem(PRODUCT_FILTER_KEY) || 'All';
    } catch {
      return 'All';
    }
  });

  useEffect(() => {
    localStorage.setItem(PRODUCT_FILTER_KEY, filter);
  }, [filter]);
  const { addToCart } = useCart();

  const filteredProducts = filter === 'All'
    ? products
    : products.filter(product => product.category === filter);

  return (
    <article className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <PageHead
        title="Products"
        description="Browse our security solutions - CCTV cameras, Fire Alarms, and Burglar Alarm systems. Top-tier equipment for your safety."
      />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Our Security Solutions</h1>
          <p className="text-slate-600 text-lg">Top-tier equipment for your safety and peace of mind.</p>
        </div>

        {loading && (
          <div className="text-center py-12 text-slate-500">Loading products…</div>
        )}

        <div className="flex justify-center mb-12 space-x-4 flex-wrap gap-y-2">
          {PRODUCT_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${filter === category
                ? 'bg-aa-blue text-slate-900 shadow-lg shadow-aa-blue/30'
                : 'bg-white-light text-slate-600 hover:text-slate-900 hover:bg-white-light/80'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {!loading && filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white-light rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 hover:border-aa-blue/30 transition-all duration-300 flex flex-col"
            >
                <Link to={`/products/${product.id}`} className="h-48 overflow-hidden relative group block">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-slate-900 font-semibold bg-aa-blue px-4 py-2 rounded-full">View Details</span>
                  </div>
                </Link>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-aa-cyan text-xs font-bold uppercase tracking-wider">{product.category}</span>
                    <span className="text-slate-900 font-bold text-lg">PHP {product.price.toLocaleString()}</span>
                  </div>
                  <h3 className="text-slate-900 font-bold text-xl mb-2">{product.name}</h3>
                  <p className="text-slate-600 text-sm mb-6 flex-grow">{product.description}</p>

                  <div className="space-y-3 mt-auto">
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full py-2 bg-aa-blue text-slate-900 rounded-lg font-semibold hover:bg-aa-blue-dark transition-colors flex items-center justify-center space-x-2 shadow-md shadow-aa-blue/10 active:scale-95 transform duration-150"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/contact" className="py-2 border border-aa-slate/30 text-slate-600 hover:text-slate-900 hover:border-aa-cyan rounded-lg text-xs font-medium flex items-center justify-center transition-colors text-center">
                        <FileText className="h-3 w-3 mr-1" /> Free Quotation
                      </Link>
                      <Link to="/contact" className="py-2 border border-aa-slate/30 text-slate-600 hover:text-slate-900 hover:border-aa-cyan rounded-lg text-xs font-medium flex items-center justify-center transition-colors text-center">
                        <CheckCircle className="h-3 w-3 mr-1" /> Site Assessment
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </article>
  );
};

export default Products;
