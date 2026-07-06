import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CreditCard, DollarSign } from 'lucide-react';

interface RevenueAnalyticsProps {
  totalRevenue: number;
  subscriptionDistribution: Record<string, number>;
  recentPayments: Array<{
    id: string;
    userId: string;
    amountEGP: number;
    paymentProvider: string;
    paymentIntentId: string;
    status: 'pending' | 'paid' | 'failed';
    metadata: any;
    createdAt: string;
    creator: { name: string; email: string } | null;
  }>;
}

export function RevenueAnalytics({
  totalRevenue,
  subscriptionDistribution,
  recentPayments,
}: RevenueAnalyticsProps) {
  // ponytail: dropped mini-KPIs; add back if KPICardsRow is ever removed

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Subscription Plan Distribution Card */}
        <Card className="bg-gradient-to-b from-[#0f172a] to-[#0c1222] border-slate-800/80 rounded-2xl shadow-xl p-5 md:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800/50 pb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Plan Distributions
            </h3>
            <div className="mt-4 space-y-3.5">
              {[
                { key: 'free', label: 'Free Trial', desc: 'Welcome credits tier' },
                { key: 'starter', label: 'Starter plan', desc: '1,000 monthly credits' },
                { key: 'pro', label: 'Pro platform', desc: '5,000 monthly credits' },
                { key: 'agency', label: 'Agency level', desc: 'Unlimited projects/high cap' },
              ].map((tier) => {
                const count = subscriptionDistribution[tier.key] || 0;
                return (
                  <div key={tier.key} className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block capitalize">{tier.label}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">{tier.desc}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Recent Transactions List Table */}
        <Card className="bg-gradient-to-b from-[#0f172a] to-[#0c1222] border-slate-800/80 rounded-2xl shadow-xl md:col-span-2 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-800/40 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Recent Payment Transactions Logs
            </h3>
            <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-950/50 border border-slate-850 px-2 py-0.5 rounded uppercase">
              Live updates
            </span>
          </div>

          <div className="overflow-x-auto flex-1 max-h-[300px] overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-slate-400 uppercase bg-[#0c1222]/80 sticky top-0 z-15 backdrop-blur-sm border-b border-slate-800/50">
                <tr>
                  <th className="px-4 py-2.5 bg-[#0c1222]/80">Creator</th>
                  <th className="px-4 py-2.5 bg-[#0c1222]/80">Type</th>
                  <th className="px-4 py-2.5 bg-[#0c1222]/80">Amount</th>
                  <th className="px-4 py-2.5 bg-[#0c1222]/80">Status</th>
                  <th className="px-4 py-2.5 bg-[#0c1222]/80 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/45">
                {recentPayments.map((p) => {
                  const dateStr = new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
                  const timeStr = new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  let type = 'Credit Pack';
                  if (p.metadata?.type === 'subscription') type = 'Subscription';
                  const details = p.metadata?.planId || p.metadata?.packId || 'Standard top-up';

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-250 truncate max-w-[150px]" title={p.creator?.email || p.userId}>
                          {p.creator?.name || p.creator?.email || p.userId}
                        </div>
                        <div className="text-[9px] text-slate-500 truncate max-w-[150px] select-all">
                          {p.creator?.email || 'User ID: ' + p.userId}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-300 block">{type}</span>
                        <span className="text-[9px] text-slate-500 font-mono capitalize">{details}</span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-200">
                        {p.amountEGP} EGP
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          p.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : p.status === 'failed'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-[10px] text-slate-400 font-medium">
                        <div className="font-semibold text-slate-300">{dateStr}</div>
                        <div className="text-[9px] text-slate-500">{timeStr}</div>
                      </td>
                    </tr>
                  );
                })}
                {recentPayments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No payment transaction logs processed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
