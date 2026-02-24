import { Link } from 'react-router-dom';
import { Package, Plus, ExternalLink, LayoutDashboard, TrendingUp, Database, RefreshCw } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useProducts } from '../../context/ProductsContext';
import { PageHead } from '../../components/ui/PageHead';
import { ErrorBoundary } from '../../components/ErrorBoundary';

const CHART_COLORS = ['#0d9488', '#2563eb', '#1e3a8a', '#06142e', '#475569'];

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 animate-pulse">
      <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
      <div className="h-8 w-16 bg-slate-200 rounded mb-4" />
      <div className="h-3 w-20 bg-slate-100 rounded" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 animate-pulse">
      <div className="h-4 w-40 bg-slate-200 rounded mb-4" />
      <div className="h-64 sm:h-72 bg-slate-100 rounded-lg" />
    </div>
  );
}

const AdminDashboard = () => {
  const { products = [], loading, useApi, refetch } = useProducts();

  const safeProducts = Array.isArray(products) ? products : [];

  const byCategory = safeProducts.reduce<Record<string, number>>((acc, p) => {
    const cat = p?.category != null ? String(p.category) : 'Other';
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});

  const categoryBarData = Object.entries(byCategory).map(([name, count], i) => ({
    name: name || 'Category',
    count: Number(count) || 0,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));
  const categoryPieData = Object.entries(byCategory).map(([name, value], i) => ({
    name: name || 'Category',
    value: Number(value) || 0,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const totalValue = safeProducts.reduce((sum, p) => sum + (Number(p?.price) || 0), 0);
  const avgPrice = safeProducts.length > 0 ? totalValue / safeProducts.length : 0;
  const categoryCount = Object.keys(byCategory).length;

  const topByPrice = [...safeProducts]
    .sort((a, b) => (Number(b?.price) || 0) - (Number(a?.price) || 0))
    .slice(0, 5);

  const hasData = safeProducts.length > 0;

  return (
    <>
      <PageHead title="Admin Dashboard" />
      <div className="space-y-6 sm:space-y-8">
        {/* Header with welcome and refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 sm:h-7 sm:w-7 text-aa-cyan shrink-0" />
              Dashboard
            </h1>
            <p className="text-slate-600 text-sm sm:text-base mt-1">
              Overview of your store, charts, and quick actions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stat cards */}
        <section aria-label="Overview stats">
          <h2 className="sr-only">Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {loading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                {/* Card 1: Total Products — two stats */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 hover:shadow-md hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-slate-500 text-xs sm:text-sm font-medium truncate">Total Products</p>
                      <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tabular-nums">
                        {safeProducts.length}
                      </p>
                      <p className="text-slate-500 text-xs mt-1">In {categoryCount} categor{categoryCount === 1 ? 'y' : 'ies'}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-aa-blue/10 flex items-center justify-center shrink-0">
                      <Package className="h-5 w-5 sm:h-6 sm:w-6 text-aa-blue" />
                    </div>
                  </div>
                  <Link
                    to="/admin/products"
                    className="mt-3 sm:mt-4 inline-flex items-center gap-1 text-aa-blue font-medium text-xs sm:text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-aa-blue rounded"
                  >
                    Manage products
                    <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </Link>
                </div>

                {/* Card 2: Categories — two stats */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 hover:shadow-md hover:border-slate-300 transition-all">
                  <p className="text-slate-500 text-xs sm:text-sm font-medium">Categories</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tabular-nums">
                    {categoryCount}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    {hasData && categoryCount > 0
                      ? `Avg ${(safeProducts.length / categoryCount).toFixed(1)} products each`
                      : !hasData
                        ? 'No categories yet'
                        : '—'}
                  </p>
                  <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5">
                    {Object.entries(byCategory).map(([cat, count]) => (
                      <span
                        key={cat}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-medium"
                      >
                        {cat}: {count}
                      </span>
                    ))}
                    {!hasData && (
                      <span className="text-slate-400 text-xs sm:text-sm">None yet</span>
                    )}
                  </div>
                </div>

                {/* Card 3: Catalog value — two stats */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 hover:shadow-md hover:border-slate-300 transition-all">
                  <p className="text-slate-500 text-xs sm:text-sm font-medium">Catalog value</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                    PHP {totalValue.toLocaleString()}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    {hasData ? `Avg PHP ${avgPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })} per product` : 'Sum of all product prices'}
                  </p>
                </div>

                {/* Card 4: Data source — two stats */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 hover:shadow-md hover:border-slate-300 transition-all">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-slate-500 shrink-0" />
                    <p className="text-slate-500 text-xs sm:text-sm font-medium">Data source</p>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                    {useApi ? 'MySQL (API)' : 'Local storage'}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
                        useApi ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${useApi ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {useApi ? 'Connected' : 'Offline'}
                    </span>
                    {hasData && (
                      <span className="text-slate-500 ml-1">• {safeProducts.length} loaded</span>
                    )}
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Charts + Top products */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          <section className="xl:col-span-2" aria-label="Charts">
            <ErrorBoundary
              fallback={
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800 text-sm">
                  Charts could not be loaded. Stats and quick actions still work.
                </div>
              }
            >
              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <ChartSkeleton />
                  <ChartSkeleton />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
                    <h2 className="text-sm font-semibold text-slate-800 mb-4">Products by category</h2>
                    <div className="h-64 sm:h-72 w-full">
                      {!hasData || categoryBarData.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
                          <Package className="h-10 w-10 opacity-50" />
                          <p>Add products to see the chart.</p>
                        </div>
                      ) : (
                        <div className="w-full h-full min-h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryBarData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                              <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                formatter={(value: number | undefined) => [`${Number(value ?? 0)} products`, 'Count']}
                              />
                              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Products">
                                {categoryBarData.map((_, i) => (
                                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
                    <h2 className="text-sm font-semibold text-slate-800 mb-4">Category distribution</h2>
                    <div className="h-64 sm:h-72 w-full">
                      {!hasData || categoryPieData.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
                          <Package className="h-10 w-10 opacity-50" />
                          <p>No data yet.</p>
                        </div>
                      ) : (
                        <div className="w-full h-full min-h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={categoryPieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius="40%"
                                outerRadius="80%"
                                paddingAngle={2}
                                label={({ name, percent }) =>
                                  `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                                }
                              >
                                {categoryPieData.map((_, i) => (
                                  <Cell key={i} fill={categoryPieData[i]?.fill ?? CHART_COLORS[0]} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                formatter={(value: number | undefined) => [`${Number(value ?? 0)} products`, 'Count']}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </ErrorBoundary>
          </section>

          {/* Top products by price */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6" aria-label="Top products by price">
            <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-aa-cyan" />
              Top by price
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="h-3 w-full bg-slate-200 rounded mb-2" />
                      <div className="h-3 w-16 bg-slate-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : topByPrice.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Add products to see top by price.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {topByPrice.map((p, i) => (
                  <li key={p.id}>
                    <Link
                      to={`/admin/products`}
                      className="flex gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 truncate group-hover:text-aa-blue">
                          {p.name}
                        </p>
                        <p className="text-sm text-slate-500 tabular-nums">
                          PHP {(Number(p.price) || 0).toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Quick actions */}
        <section aria-label="Quick actions">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Quick actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Link
              to="/admin/products"
              className="group flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-aa-navy text-white rounded-xl border border-aa-navy shadow-sm hover:bg-aa-navy-light hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-aa-cyan focus:ring-offset-2"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-aa-cyan/20 flex items-center justify-center shrink-0 group-hover:bg-aa-cyan/30 transition-colors">
                <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-aa-cyan" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base sm:text-lg">Add product</h3>
                <p className="text-aa-slate text-xs sm:text-sm mt-0.5">Create a new product in the catalog.</p>
              </div>
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-aa-blue/30 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-aa-blue focus:ring-offset-2"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-aa-blue/10 transition-colors">
                <ExternalLink className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 group-hover:text-aa-blue" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base sm:text-lg text-slate-900">View site</h3>
                <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Open the public storefront in a new tab.</p>
              </div>
            </a>
          </div>
        </section>
      </div>
    </>
  );
};

export default AdminDashboard;
