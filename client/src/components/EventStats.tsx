import React from 'react';
import { Users, UserCheck, TrendingUp, ShieldCheck, Trophy, Ticket } from 'lucide-react';
import { EventStatsData } from '../types/index.js';

interface EventStatsProps {
  stats: EventStatsData;
}

export const EventStats: React.FC<EventStatsProps> = ({ stats }) => {
  const {
    totalRegistered,
    checkedInCount,
    attendanceRate,
    capacityLimit,
    remainingCapacity,
    partnerLeaderboard,
    ticketTypeBreakdown,
  } = stats;

  return (
    <div className="space-y-6">
      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered */}
        <div className="card-luxury rounded-2xl p-5 border border-amber-500/20 dark:border-allstar-gold/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400">Total Inscritos</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalRegistered}</span>
            {capacityLimit && (
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                / {capacityLimit} cupos máx
              </span>
            )}
          </div>
          {capacityLimit && (
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
              <span>Disponibles:</span>
              <span className="font-bold text-amber-600 dark:text-allstar-gold">
                {remainingCapacity !== null ? remainingCapacity : 'N/A'}
              </span>
            </div>
          )}
        </div>

        {/* Live Check-ins */}
        <div className="card-luxury rounded-2xl p-5 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-mono tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
              Asistieron en Vivo
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">{checkedInCount}</span>
            <span className="text-xs font-mono text-emerald-600/80 dark:text-emerald-400/80">en puerta</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Personas validadas con QR
          </div>
        </div>

        {/* Attendance Rate % */}
        <div className="card-luxury rounded-2xl p-5 border border-amber-500/20 dark:border-allstar-gold/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400">
              Tasa de Asistencia
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-allstar-gold">{attendanceRate}%</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, attendanceRate)}%` }}
            />
          </div>
        </div>

        {/* Top Referrer Partner */}
        <div className="card-luxury rounded-2xl p-5 border border-amber-500/20 dark:border-allstar-gold/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400">
              Líder Top Referidos
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          {partnerLeaderboard.length > 0 ? (
            <div>
              <span className="text-lg font-bold text-slate-900 dark:text-white truncate block">
                {partnerLeaderboard[0].partnerName}
              </span>
              <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span>Invitados:</span>
                <span className="font-bold text-sky-600 dark:text-sky-400">{partnerLeaderboard[0].totalInvited}</span>
              </div>
            </div>
          ) : (
            <span className="text-sm text-slate-400">Sin datos de socios</span>
          )}
        </div>
      </div>

      {/* Grid: Partner Leaderboard & Ticket Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Partner Leaderboard */}
        <div className="card-luxury rounded-2xl p-6 border border-slate-200 dark:border-white/10">
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="w-5 h-5 text-amber-600 dark:text-allstar-gold" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Tabla de Liderazgo por Socios</h3>
          </div>

          {partnerLeaderboard.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No hay registros aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">
                    <th className="pb-3 font-semibold">Socio / Código</th>
                    <th className="pb-3 font-semibold text-center">Invitados</th>
                    <th className="pb-3 font-semibold text-center">Asistieron</th>
                    <th className="pb-3 font-semibold text-right">Efectividad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {partnerLeaderboard.map((p, idx) => {
                    const eff = p.totalInvited > 0 ? Math.round((p.checkedIn / p.totalInvited) * 100) : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3">
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                            {idx === 0 && <span className="text-amber-500 text-xs">🥇</span>}
                            {idx === 1 && <span className="text-slate-400 text-xs">🥈</span>}
                            {idx === 2 && <span className="text-amber-700 text-xs">🥉</span>}
                            <span>{p.partnerName}</span>
                          </div>
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">@{p.referralCode}</span>
                        </td>
                        <td className="py-3 text-center font-bold text-slate-900 dark:text-white">{p.totalInvited}</td>
                        <td className="py-3 text-center font-semibold text-emerald-600 dark:text-emerald-400">{p.checkedIn}</td>
                        <td className="py-3 text-right">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {eff}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Ticket Types Breakdown */}
        <div className="card-luxury rounded-2xl p-6 border border-slate-200 dark:border-white/10">
          <div className="flex items-center space-x-2 mb-4">
            <Ticket className="w-5 h-5 text-amber-600 dark:text-allstar-gold" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Distribución por Tipo de Entrada</h3>
          </div>

          {ticketTypeBreakdown.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No hay datos de tipos de entrada.</p>
          ) : (
            <div className="space-y-4">
              {ticketTypeBreakdown.map((t, idx) => {
                const percent = totalRegistered > 0 ? Math.round((t.total / totalRegistered) * 100) : 0;
                return (
                  <div key={idx} className="bg-slate-50 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-200 dark:border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">{t.typeName}</span>
                      <span className="font-mono text-xs font-bold text-amber-600 dark:text-allstar-gold">
                        {t.total} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                      <div
                        className="bg-allstar-gradient h-2 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex justify-between font-mono">
                      <span>Ingresaron:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{t.checkedIn} asistentes</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
