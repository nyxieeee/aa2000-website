import React, { useState, useEffect } from 'react';
import { ShoppingCart, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { PageHead } from '../../components/ui/PageHead';
import { fetchOrders, fetchOrder } from '../../lib/api';
import type { Order } from '../../types';

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [orderDetail, setOrderDetail] = useState<Order | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchOrders();
      setOrders(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const toggleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      setOrderDetail(null);
      return;
    }
    setExpandedId(id);
    try {
      const detail = await fetchOrder(id);
      setOrderDetail(detail ?? null);
    } catch {
      setOrderDetail(null);
    }
  };

  const formatDate = (s: string) => {
    try {
      const d = new Date(s);
      return d.toLocaleString('en-PH', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return s;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHead title="Orders" description="AA2000 Admin - Checkout orders" />
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShoppingCart className="h-7 w-7 text-aa-cyan" />
          Orders
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-aa-cyan" />
          </div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No orders yet. Orders from checkout will appear here.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-semibold text-slate-700 w-10"></th>
                  <th className="p-3 font-semibold text-slate-700">ID</th>
                  <th className="p-3 font-semibold text-slate-700">Date</th>
                  <th className="p-3 font-semibold text-slate-700">Customer</th>
                  <th className="p-3 font-semibold text-slate-700">Email</th>
                  <th className="p-3 font-semibold text-slate-700">Total</th>
                  <th className="p-3 font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr
                      className="border-b border-slate-100 hover:bg-slate-50/50"
                    >
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => toggleExpand(order.id)}
                          className="p-1 rounded hover:bg-slate-200 text-slate-600"
                          aria-label={expandedId === order.id ? 'Collapse' : 'Expand'}
                        >
                          {expandedId === order.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-3 font-mono text-sm">{order.id}</td>
                      <td className="p-3 text-slate-600 text-sm">{formatDate(order.createdAt)}</td>
                      <td className="p-3 font-medium text-slate-900">{order.fullName}</td>
                      <td className="p-3 text-slate-600 text-sm">{order.email}</td>
                      <td className="p-3 font-medium">PHP {Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                    {expandedId === order.id && orderDetail?.id === order.id && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={7} className="p-4">
                          <div className="pl-6 space-y-3 text-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                              <p><span className="font-medium text-slate-700">Phone:</span> {orderDetail.phone}</p>
                              <p><span className="font-medium text-slate-700">Address:</span> {orderDetail.address}, {orderDetail.city} {orderDetail.zipCode}</p>
                            </div>
                            {orderDetail.discountCode && (
                              <p className="text-slate-600">
                                <span className="font-medium text-slate-700">Discount:</span> {orderDetail.discountCode} (-PHP {Number(orderDetail.discountAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })})
                              </p>
                            )}
                            <div>
                              <p className="font-medium text-slate-700 mb-2">Items</p>
                              <ul className="space-y-1">
                                {orderDetail.items?.map((item) => (
                                  <li key={item.id} className="flex justify-between text-slate-600">
                                    <span>{item.productName} x {item.quantity}</span>
                                    <span>PHP {(Number(item.price) * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
