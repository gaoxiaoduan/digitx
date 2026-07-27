import React from 'react';
import { DomainRecord } from '@digitx/core';
import { X, ExternalLink, ShieldCheck, Tag, Info, Calendar } from 'lucide-react';

interface DetailSheetProps {
  domain: DomainRecord | null;
  onClose: () => void;
}

export const DetailSheet: React.FC<DetailSheetProps> = ({ domain, onClose }) => {
  if (!domain) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-canvas border-l border-hairline h-full shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-hairline mb-6">
            <div>
              <span className="text-xs font-mono text-hairline-strong uppercase">Domain Detail</span>
              <h2 className="text-2xl font-bold font-mono text-ink mt-0.5">{domain.domain}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-canvas-soft text-hairline-strong hover:text-ink transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Details list */}
          <div className="space-y-5 text-sm">
            <div className="bg-canvas-soft border border-hairline rounded-lg p-4">
              <div className="text-xs font-mono text-hairline-strong mb-1">RARE PATTERN SCORE</div>
              <div className="text-3xl font-extrabold font-mono text-brand-pink">{domain.score} / 100</div>
              <div className="text-xs text-hairline-strong mt-1">{domain.patternDesc}</div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-hairline">
                <span className="text-hairline-strong flex items-center gap-2">
                  <Tag className="w-4 h-4 text-brand-blue" />
                  模式分类
                </span>
                <span className="font-medium text-ink">{domain.category}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-hairline">
                <span className="text-hairline-strong flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-teal" />
                  当前状态
                </span>
                <span
                  className={`font-mono font-medium ${
                    domain.status === 'available' ? 'text-brand-teal' : 'text-hairline-strong'
                  }`}
                >
                  {domain.status === 'available' ? '✅ 未注册 (可用)' : '已注册'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-hairline">
                <span className="text-hairline-strong flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-violet" />
                  最后核查时间
                </span>
                <span className="font-mono text-xs text-ink">
                  {domain.updatedAt ? new Date(domain.updatedAt).toLocaleString() : '未扫描'}
                </span>
              </div>
            </div>

            {/* WHOIS Raw Detail */}
            <div className="mt-6">
              <div className="text-xs font-mono text-hairline-strong mb-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>WHOIS 详细验证日志</span>
              </div>
              <div className="bg-ink text-white font-mono text-xs p-4 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-48">
                {domain.detail || '暂无详细响应日志'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="pt-6 border-t border-hairline mt-6">
          {domain.status === 'available' ? (
            <a
              href={`https://www.namesilo.com/domain/search-domains?query=${domain.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-pill bg-ink text-white font-medium text-sm hover:bg-black transition-all shadow-md"
            >
              <span>立即去注册 {domain.domain}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <div className="text-center text-xs text-hairline-strong font-mono py-2">
              该域名已被注册，可定期关注释放状态
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
