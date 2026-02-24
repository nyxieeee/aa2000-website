import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ProductsProvider } from './context/ProductsContext';
import { Layout, PageSkeleton, ErrorBoundary } from './components';

// Lazy load pages - loads only when route is visited
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Blogs = lazy(() => import('./pages/Blogs'));
const Contact = lazy(() => import('./pages/Contact'));
const Redeem = lazy(() => import('./pages/Redeem'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminSuppliers = lazy(() => import('./pages/admin/AdminSuppliers'));
const AdminSupplierProducts = lazy(() => import('./pages/admin/AdminSupplierProducts'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));

function App() {
  return (
    <ProductsProvider>
      <CartProvider>
        <ErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:id" element={<ProductDetails />} />
              <Route path="blogs" element={<Blogs />} />
              <Route path="contact" element={<Contact />} />
              <Route path="redeem" element={<Redeem />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
            </Route>
            <Route path="admin">
              <Route index element={<AdminLogin />} />
              <Route element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="suppliers" element={<AdminSuppliers />} />
                <Route path="suppliers/:id/products" element={<AdminSupplierProducts />} />
                <Route path="customers" element={<AdminCustomers />} />
              </Route>
            </Route>
            <Route path="admin/*" element={<Navigate to="/admin" replace />} />
          </Routes>
          </Suspense>
        </ErrorBoundary>
      </CartProvider>
    </ProductsProvider>
  );
}

export default App;
