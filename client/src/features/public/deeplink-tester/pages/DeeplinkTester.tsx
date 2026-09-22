import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageShell } from '../../../../shared/components/PageShell';
import { UrlComposer } from '../components/UrlComposer';
import { QueryParamsEditor } from '../components/QueryParamsEditor';
import { ActionLauncher } from '../components/ActionLauncher';
import { QrCodeTester } from '../components/QrCodeTester';
import { CliCommandGenerator } from '../components/CliCommandGenerator';
import { QuickPresets } from '../components/QuickPresets';
import { HistoryList } from '../components/HistoryList';
import { DomainInspector } from '../components/DomainInspector';
import { Cheatsheet } from '../components/Cheatsheet';
import { parseDeeplink, rebuildUrl } from '../utils/urlParser';
import { QueryParam, HistoryItem, DeeplinkPreset } from '../types/deeplink';
import { Compass, Globe, BookOpen, Layers } from 'lucide-react';

const HISTORY_STORAGE_KEY = 'chatdvt_deeplink_history';
const DEFAULT_INITIAL_URL = 'myapp://product/detail?id=1024&ref=portal_test';

export const DeeplinkTester: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialUrlFromParam = searchParams.get('link');

  const [url, setUrl] = useState<string>(initialUrlFromParam || DEFAULT_INITIAL_URL);
  const [activeTab, setActiveTab] = useState<'studio' | 'domain' | 'cheatsheet'>('studio');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [androidPackage, setAndroidPackage] = useState<string>('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const parsed = useMemo(() => {
    return parseDeeplink(url);
  }, [url]);

  useEffect(() => {
    if (parsed.androidPackage) {
      setAndroidPackage(parsed.androidPackage);
    }
  }, [parsed.androidPackage]);

  const saveToHistory = (urlToSave: string) => {
    if (!urlToSave.trim()) return;

    setHistory((prev) => {
      const filtered = prev.filter((item) => item.url !== urlToSave);
      const newItem: HistoryItem = {
        id: `h_${Date.now()}`,
        url: urlToSave,
        timestamp: Date.now(),
        isFavorite: prev.find((item) => item.url === urlToSave)?.isFavorite || false,
      };
      const nextHistory = [newItem, ...filtered].slice(0, 30);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));
      } catch {}
      return nextHistory;
    });
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
  };

  const handleClearUrl = () => {
    setUrl('');
  };

  const handleParamsChange = (newParams: QueryParam[]) => {
    const nextUrl = rebuildUrl(
      parsed.scheme,
      parsed.host,
      parsed.path,
      newParams,
      parsed.hash
    );
    setUrl(nextUrl);
  };

  const handleSelectPreset = (preset: DeeplinkPreset) => {
    setUrl(preset.url);
    if (preset.packageName) {
      setAndroidPackage(preset.packageName);
    }
    saveToHistory(preset.url);
  };

  const handleToggleFavorite = (id: string) => {
    setHistory((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      );
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleDeleteHistory = (id: string) => {
    setHistory((prev) => {
      const next = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {}
  };

  const handleLaunchSuccess = () => {
    saveToHistory(url);
  };

  return (
    <PageShell
      title="Deep Link Tester"
      subtitle="BỘ CÔNG CỤ TEST DEEPLINK, UNIVERSAL LINKS, QR CODE & CLI DÀNH CHO MOBILE DEV"
      icon="🔗"
      maxWidth="6xl"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'studio'
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Compass size={16} />
            <span>Deep Link Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('domain')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'domain'
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Globe size={16} />
            <span>Domain Inspector (AASA)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cheatsheet')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'cheatsheet'
                ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen size={16} />
            <span>Mobile Cheatsheet</span>
          </button>
        </div>

        {activeTab === 'studio' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-6">
                <UrlComposer
                  url={url}
                  parsed={parsed}
                  onChange={handleUrlChange}
                  onClear={handleClearUrl}
                />

                <QueryParamsEditor
                  params={parsed.params}
                  onChange={handleParamsChange}
                />

                <QuickPresets onSelectPreset={handleSelectPreset} />
              </div>

              <div className="lg:col-span-5 space-y-6">
                <ActionLauncher
                  url={url}
                  onLaunchSuccess={handleLaunchSuccess}
                />

                <QrCodeTester url={url} />

                <CliCommandGenerator
                  url={url}
                  defaultPackage={androidPackage}
                />

                <HistoryList
                  history={history}
                  onSelect={(selectedUrl) => {
                    setUrl(selectedUrl);
                  }}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDeleteHistory}
                  onClearAll={handleClearAllHistory}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'domain' && <DomainInspector />}

        {activeTab === 'cheatsheet' && <Cheatsheet />}
      </div>
    </PageShell>
  );
};
