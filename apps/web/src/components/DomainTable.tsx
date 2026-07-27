import React from 'react';
import { DomainRecord } from '@digitx/core';
import { ExternalLink, Star, ShieldCheck, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';

interface DomainTableProps {
  domains: DomainRecord[];
  onSelectDomain: (d: DomainRecord) => void;
}

export const DomainTable: React.FC<DomainTableProps> = ({ domains, onSelectDomain }) => {
  if (domains.length === 0) {
    return (
      <div className="py-24 text-center">
        <HelpCircle className="w-10 h-10 text-hairline-strong mx-auto mb-3" />
        <h3 className="text-base font-medium text-ink">没有找到匹配的域名</h3>
        <p className="text-xs text-hairline-strong mt-1">尝试调整搜索关键词或重置筛选条件</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-hairline bg-canvas-soft text-[11px] font-mono uppercase tracking-wider text-hairline-strong">
            <th className="py-3 px-6 font-medium">域名 / Domain</th>
            <th className="py-3 px-4 font-medium">位数</th>
            <th className="py-3 px-4 font-medium">模式 / Pattern</th>
            <th className="py-3 px-4 font-medium text-right">稀有得分</th>
            <th className="py-3 px-4 font-medium text-center">状态</th>
            <th className="py-3 px-6 font-medium text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline bg-canvas text-sm font-sans">
          {domains.map((item) => {
            const isAvailable = item.status === 'available';
            const isRegistered = item.status === 'registered';

            return (
              <tr
                key={item.domain}
                onClick={() => onSelectDomain(item)}
                className="hover:bg-canvas-soft/80 cursor-pointer transition-colors group"
              >
                {/* Domain Name */}
                <td className="py-3.5 px-6 font-mono font-medium text-ink flex items-center gap-2">
                  <span className="group-hover:text-brand-blue transition-colors">{item.domain}</span>
                  {item.score >= 95 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-brand-pink/10 text-brand-pink border border-brand-pink/20">
                      TOP
                    </span>
                  )}
                </td>

                {/* Length */}
                <td className="py-3.5 px-4 font-mono text-xs text-hairline-strong">{item.number.length}位</td>

                {/* Category */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-ink">{item.category}</span>
                    <span className="text-[11px] text-hairline-strong truncate max-w-xs">{item.patternDesc}</span>
                  </div>
                </td>

                {/* Score */}
                <td className="py-3.5 px-4 text-right font-mono font-semibold">
                  <span
                    className={
                      item.score >= 90
                        ? 'text-brand-pink'
                        : item.score >= 80
                        ? 'text-brand-violet'
                        : 'text-ink'
                    }
                  >
                    {item.score}
                  </span>
                </td>

                {/* Status Badge */}
                <td className="py-3.5 px-4 text-center">
                  {isAvailable && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-brand-teal/10 text-brand-teal border border-brand-teal/20">
                      <CheckCircle2 className="w-3 h-3" />
                      可注册
                    </span>
                  )}
                  {isRegistered && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono text-hairline-strong bg-canvas-soft border border-hairline">
                      已注册
                    </span>
                  )}
                  {!isAvailable && !isRegistered && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono text-brand-blue bg-brand-blue/10 border border-brand-blue/20">
                      待验证
                    </span>
                  )}
                </td>

                {/* Action Link */}
                <td className="py-3.5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                  {isAvailable ? (
                    <a
                      href={`https://www.namesilo.com/domain/search-domains?query=${item.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-pill bg-ink text-white text-xs font-medium hover:bg-black transition-colors"
                    >
                      <span>抢注</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <button
                      onClick={() => onSelectDomain(item)}
                      className="text-xs text-hairline-strong hover:text-ink transition-colors font-mono"
                    >
                      详情 &rarr;
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
