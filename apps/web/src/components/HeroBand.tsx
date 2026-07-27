import React from 'react';
import { DomainStats } from '@digitx/core';
import { Sparkles, CheckCircle2, ShieldCheck, Database } from 'lucide-react';

interface HeroBandProps {
  stats: DomainStats;
}

export const HeroBand: React.FC<HeroBandProps> = ({ stats }) => {
  return (
    <div className="relative overflow-hidden bg-canvas border-b border-hairline pt-12 pb-16 mesh-gradient-bg">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-canvas-soft border border-hairline text-xs font-mono text-hairline-strong mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
            <span>Dual-Channel DNS & WHOIS Verification Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-ink mb-4 max-w-2xl">
            DIGITX. <span className="text-hairline-strong font-normal">Premium Numeric Domains.</span>
          </h1>

          <p className="text-base sm:text-lg text-hairline-strong max-w-xl mb-10 leading-relaxed">
            极速盲扫与权威 WHOIS 双通道深度校验，发现具备高度收藏与商业价值的纯数字 .xyz 靓号域名。
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl">
            <div className="bg-canvas border border-hairline rounded-lg p-5 stacked-shadow text-left">
              <div className="flex items-center justify-between text-hairline-strong text-xs font-mono mb-2">
                <span>TOTAL CANDIDATES</span>
                <Database className="w-4 h-4 text-brand-blue" />
              </div>
              <div className="text-2xl font-bold text-ink font-mono">{stats.total.toLocaleString()}</div>
              <div className="text-xs text-hairline-strong mt-1">内置高分生成算法</div>
            </div>

            <div className="bg-canvas border border-hairline rounded-lg p-5 stacked-shadow text-left">
              <div className="flex items-center justify-between text-hairline-strong text-xs font-mono mb-2">
                <span>AVAILABLE NOW</span>
                <CheckCircle2 className="w-4 h-4 text-brand-teal" />
              </div>
              <div className="text-2xl font-bold text-brand-teal font-mono">{stats.available.toLocaleString()}</div>
              <div className="text-xs text-hairline-strong mt-1">确认空闲可自由注册</div>
            </div>

            <div className="bg-canvas border border-hairline rounded-lg p-5 stacked-shadow text-left">
              <div className="flex items-center justify-between text-hairline-strong text-xs font-mono mb-2">
                <span>CHECKED</span>
                <ShieldCheck className="w-4 h-4 text-brand-violet" />
              </div>
              <div className="text-2xl font-bold text-ink font-mono">{stats.checked.toLocaleString()}</div>
              <div className="text-xs text-hairline-strong mt-1">完成了两阶段核查</div>
            </div>

            <div className="bg-canvas border border-hairline rounded-lg p-5 stacked-shadow text-left">
              <div className="flex items-center justify-between text-hairline-strong text-xs font-mono mb-2">
                <span>REGISTERED</span>
                <span className="w-2 h-2 rounded-full bg-hairline-strong"></span>
              </div>
              <div className="text-2xl font-bold text-hairline-strong font-mono">{stats.registered.toLocaleString()}</div>
              <div className="text-xs text-hairline-strong mt-1">已被其他人买走</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
