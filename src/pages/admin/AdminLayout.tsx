import { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { Package, LogOut, LayoutDashboard, ExternalLink, Menu, X, ShoppingCart, Truck, Users } from 'lucide-react';
import { isAdminLoggedIn, setAdminLoggedOut } from './AdminLogin';
import { useProducts } from '../../context/ProductsContext';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/suppliers', label: 'Supplier', icon: Truck },
  { to: '/admin/customers', label: 'Customer', icon: Users },
];

const REALTIME_POLL_INTERVAL_MS = 15_000; // 15 seconds

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { refetchSilent } = useProducts();

  useEffect(() => {
    const id = setInterval(() => {
      refetchSilent();
    }, REALTIME_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refetchSilent]);

  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  const handleLogout = () => {
    setAdminLoggedOut();
    navigate('/admin', { replace: true });
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          aria-label="Close menu"
        />
      )}

      {/* Sidebar - drawer on mobile, fixed on desktop (does not scroll) */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-60 bg-aa-navy text-white flex flex-col shrink-0
          transform transition-transform duration-200 ease-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 lg:px-5">
          <Link
            to="/admin/dashboard"
            onClick={closeSidebar}
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 rounded-lg bg-aa-cyan/20 flex items-center justify-center">
              <Package className="h-5 w-5 text-aa-cyan" />
            </div>
            <span className="font-bold text-lg">AA2000 Admin</span>
          </Link>
          <button
            type="button"
            onClick={closeSidebar}
            className="p-2 rounded-lg text-aa-slate hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-aa-cyan/20 text-aa-cyan'
                    : 'text-aa-slate hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-aa-slate hover:bg-white/5 hover:text-white transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View site
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-aa-slate hover:bg-white/5 hover:text-white transition-colors text-left"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content - only this area scrolls */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-auto lg:ml-60">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-semibold text-slate-900">Admin</span>
        </header>

        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
