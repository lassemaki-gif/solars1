"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from "recharts";
import type { FinanceResponse } from "@/lib/api";
import type { MarketConfig } from "@/lib/market";

export function SavingsChart({ finance, market }: { finance: FinanceResponse; market: MarketConfig }) {
  const { currencySymbol, locale } = market;
  const payback = finance.finance.payback_years;

  const data = finance.finance.yearly_cashflows.map((r) => ({
    year: r.year,
    cumulative: Math.round(r.cumulative_eur),
  }));

  const fmt = (v: number) =>
    `${currencySymbol}${Math.abs(v) >= 1000
      ? `${(v / 1000).toFixed(0)}k`
      : v.toLocaleString(locale, { maximumFractionDigits: 0 })}`;

  return (
    <div className="mt-6 pt-6 border-t border-ink/20">
      <p className="text-xs uppercase tracking-widest text-ash mb-4">25-year cumulative savings</p>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e3611d" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#e3611d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="currentColor" strokeOpacity={0.08} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={fmt}
            width={42}
          />
          <Tooltip
            formatter={(v) => [
              `${currencySymbol}${Number(v).toLocaleString(locale, { maximumFractionDigits: 0 })}`,
              "Cumulative",
            ]}
            labelFormatter={(l) => `Year ${l}`}
            contentStyle={{
              background: "rgb(var(--color-paper))",
              border: "1px solid rgb(var(--color-ink) / 0.2)",
              borderRadius: 0,
              fontSize: 11,
              fontFamily: "JetBrains Mono",
            }}
          />
          {payback != null && payback <= 25 && (
            <ReferenceLine
              x={Math.round(payback)}
              stroke="#e3611d"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              label={{ value: "Payback", position: "top", fontSize: 8, fill: "#e3611d", fontFamily: "JetBrains Mono" }}
            />
          )}
          <ReferenceLine y={0} stroke="currentColor" strokeOpacity={0.15} />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke="#e3611d"
            strokeWidth={2}
            fill="url(#savingsGrad)"
            dot={false}
            activeDot={{ r: 3, fill: "#e3611d" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
