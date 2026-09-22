import React, { useState } from 'react';
import { BookOpen, Copy, Check } from 'lucide-react';

interface CodeSnippet {
  id: string;
  title: string;
  platform: string;
  code: string;
}

const SNIPPETS: CodeSnippet[] = [
  {
    id: 'android_scheme',
    title: 'AndroidManifest.xml (Custom URL Scheme)',
    platform: 'Android',
    code: `<activity android:name=".MainActivity" android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="myapp" android:host="order" />
    </intent-filter>
</activity>`,
  },
  {
    id: 'android_applinks',
    title: 'AndroidManifest.xml (Android App Links)',
    platform: 'Android',
    code: `<activity android:name=".MainActivity" android:exported="true">
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="https" android:host="example.com" android:pathPrefix="/item" />
    </intent-filter>
</activity>`,
  },
  {
    id: 'ios_scheme',
    title: 'Info.plist (iOS Custom URL Scheme)',
    platform: 'iOS',
    code: `<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>com.example.myapp</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>myapp</string>
        </array>
    </dict>
</array>`,
  },
  {
    id: 'ios_universal',
    title: 'iOS Entitlements (Universal Links)',
    platform: 'iOS',
    code: `<key>com.apple.developer.associated-domains</key>
<array>
    <string>applinks:example.com</string>
</array>`,
  },
  {
    id: 'react_native',
    title: 'React Native (Linking API)',
    platform: 'React Native',
    code: `import { Linking } from 'react-native';

const handleUrl = (url: string | null) => {
  if (!url) return;
  const parsed = new URL(url);
  console.log(parsed.pathname, parsed.searchParams.get('id'));
};

Linking.getInitialURL().then(handleUrl);
const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));`,
  },
  {
    id: 'flutter_linking',
    title: 'Flutter (app_links package)',
    platform: 'Flutter',
    code: `import 'package:app_links/app_links.dart';

final appLinks = AppLinks();

appLinks.getInitialLink().then((uri) {
  if (uri != null) navigateToTarget(uri);
});

appLinks.uriLinkStream.listen((uri) {
  navigateToTarget(uri);
});`,
  },
];

export const Cheatsheet: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 dark:text-orange-400">
            <BookOpen size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Mobile Dev Setup Cheatsheet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cấu hình mẫu cho Android, iOS, React Native và Flutter
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SNIPPETS.map((snippet) => (
          <div
            key={snippet.id}
            className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {snippet.title}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {snippet.platform}
                </span>
              </div>
            </div>

            <div className="relative mt-2">
              <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto border border-slate-800 leading-relaxed max-h-48">
                {snippet.code}
              </pre>
              <button
                type="button"
                onClick={() => handleCopy(snippet.id, snippet.code)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-90"
                title="Copy snippet"
              >
                {copiedId === snippet.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
