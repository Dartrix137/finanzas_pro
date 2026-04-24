'use client';

import React, { useState, useMemo } from 'react';
import { MONTHS, CURRENCY_FORMATTER, CURRENT_YEAR_STR } from '@/lib/constants';

export default function ReportesClient({ areas, metas, abonos, userRole, userAreaId }: any) {
  // If director, lock filter to their area. If superadmin, default to "ALL"
  const [selectedArea, setSelectedArea] = useState<string>(userRole === 'director' ? userAreaId : 'ALL');

  // Compute metrics based on selectedArea
  const { monthlyData, annualTarget, annualActual } = useMemo(() => {
    let filteredMetas = metas;
    let filteredAbonos = abonos;

    if (selectedArea !== 'ALL') {
      filteredMetas = metas.filter((m: any) => m.area_id === selectedArea);
      filteredAbonos = abonos.filter((a: any) => a.area_id === selectedArea);
    }

    const currentYear = CURRENT_YEAR_STR;

    const monthlyData = MONTHS.map((monthStr, idx) => {
      const monthNum = (idx + 1).toString().padStart(2, '0');
      const periodStr = `${currentYear}-${monthNum}`;

      // Sum targets for this month across filtered metas
      const target = filteredMetas
        .filter((m: any) => m.periodo === periodStr && m.tipo === 'mensual')
        .reduce((acc: number, m: any) => acc + m.valor, 0);

      // Sum actuals for this month across filtered abonos
      const actual = filteredAbonos
        .filter((a: any) => a.fecha.startsWith(periodStr))
        .reduce((acc: number, a: any) => acc + a.monto, 0);

      return {
        month: monthStr,
        periodCode: periodStr,
        target,
        actual,
        percent: target > 0 ? Math.round((actual / target) * 100) : 0
      };
    });

    // Anual Global
    const annualTarget = filteredMetas
      .filter((m: any) => m.periodo === currentYear && m.tipo === 'anual')
      .reduce((acc: number, m: any) => acc + m.valor, 0);

    const annualActual = monthlyData.reduce((acc, m) => acc + m.actual, 0);

    return { monthlyData, annualTarget, annualActual };
  }, [selectedArea, metas, abonos]);

  const annualPercent = annualTarget > 0 ? Math.min(100, Math.round((annualActual / annualTarget) * 100)) : 0;

  const handleExportCSV = () => {
    // Basic CSV construction
    const headers = ['Mes', 'Periodo', 'Meta Asignada', 'Recaudado Real', 'Porcentaje Alcanzado'];
    const rows = monthlyData.map(m => [
      m.month,
      m.periodCode,
      m.target,
      m.actual,
      `${m.percent}%`
    ]);

    // Add aggregate footer
    rows.push(['TOTAL ANUAL', CURRENT_YEAR_STR, annualTarget, annualActual, `${annualPercent}%`]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_metas_${selectedArea === 'ALL' ? 'global' : selectedArea}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Reportes Finacieros</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visualización y exportación de metas vs recaudo
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/25 text-sm"
          >
            <span className="material-icons-round text-lg">file_download</span>
            Exportar CSV
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:w-auto">
          <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
            Filtrar por Área
          </label>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            disabled={userRole !== 'superadmin'}
            className="w-full sm:w-72 bg-secondary border-none rounded-xl px-4 py-2.5 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            {userRole === 'superadmin' && <option value="ALL">Global (Todas las Áreas)</option>}
            {areas.map((a: any) => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-5 rounded-2xl border border-border flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Meta Anual</p>
            <h2 className="text-xl font-extrabold text-foreground">{CURRENCY_FORMATTER.format(annualTarget)}</h2>
          </div>
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <span className="material-icons-round text-primary">emoji_events</span>
          </div>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Recaudado Acumulado Anual</p>
              <h2 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{CURRENCY_FORMATTER.format(annualActual)}</h2>
            </div>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-xl flex items-center justify-center">
              <span className="material-icons-round">account_balance</span>
            </div>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-emerald-500 h-full transition-all duration-700 rounded-full"
              style={{ width: `${annualPercent}%` }}
            />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground mt-2">{annualPercent}% de la meta anual</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.15em] border-b border-border bg-secondary/30">
                <th className="px-6 py-4">Periodo (Mes)</th>
                <th className="px-6 py-4">Meta Asignada</th>
                <th className="px-6 py-4">Recaudado</th>
                <th className="px-6 py-4 text-right">Avance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {monthlyData.map((m) => (
                <tr key={m.month} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-foreground text-sm">{m.month}</p>
                    <p className="text-muted-foreground text-xs font-medium">{m.periodCode}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-foreground text-sm">
                    {m.target > 0 ? CURRENCY_FORMATTER.format(m.target) : <span className="text-muted-foreground">Sin Meta</span>}
                  </td>
                  <td className="px-6 py-4 font-bold text-primary text-sm">
                    {CURRENCY_FORMATTER.format(m.actual)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      m.percent >= 100 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                      m.percent >= 80 ? 'bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {m.percent}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
