import { useState } from 'react';
import { PageShell } from '../../../../shared/components/PageShell';

export const PdDocs = () => {
  const [loading, setLoading] = useState(true);

  return (
    <PageShell
      title="Physical Design căn bản"
      subtitle="Tài liệu PD cho người mới bắt đầu"
      icon="🔧"
      backTo="/"
      maxWidth="6xl"
    >
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-[#131923] rounded-xl z-10 min-h-[60vh]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Đang tải tài liệu...</p>
            </div>
          </div>
        )}

        <iframe
          src="/docs/PD_can_ban_cho_nguoi_moi.html"
          title="Physical Design căn bản cho người mới bắt đầu"
          className="w-full border border-slate-200 dark:border-slate-800 rounded-xl bg-white shadow-sm"
          style={{ minHeight: '85vh', height: '85vh' }}
          onLoad={() => setLoading(false)}
        />
      </div>
    </PageShell>
  );
};

export default PdDocs;
