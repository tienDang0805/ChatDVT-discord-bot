import { useEffect, useRef, useState } from 'react';
import type { Adb } from '@yume-chan/adb';
import { Camera, CheckCircle2, Copy, Download, Loader2, PlugZap, RefreshCw, Smartphone, TerminalSquare, Unplug } from 'lucide-react';
import { PageShell } from '../../../../shared/components/PageShell';
import { authenticate, isPng, runShell, usbManager } from '../utils/adb';
import { appCommand, connectionError, metroCommand, packageId, PERMISSIONS } from '../utils/commands';

const STORAGE_KEY = 'android_toolbox_project_v1';
const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131923] p-5';
const input = 'w-full min-w-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1f2937] px-3 py-3 text-sm';
const button = 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed';

type Entry = { id: number; title: string; time: string; text: string; ok: boolean };
type Device = { name: string; serial: string; android?: string; api?: string; model?: string };

function savedProject(): { pkg: string; port: string } {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { pkg: typeof value.pkg === 'string' ? value.pkg : '', port: typeof value.port === 'string' ? value.port : '8081' };
  } catch { return { pkg: '', port: '8081' }; }
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function AndroidToolbox() {
  const [project, setProject] = useState(savedProject);
  const [device, setDevice] = useState<Device | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState('Chưa kết nối thiết bị');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [apps, setApps] = useState<string[]>([]);
  const [permission, setPermission] = useState<string>(PERMISSIONS[0][0]);
  const [screenshot, setScreenshot] = useState<Blob | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [logs, setLogs] = useState('');
  const [filter, setFilter] = useState('');
  const [logScope, setLogScope] = useState<'rn' | 'app' | 'all'>('rn');
  const [tab, setTab] = useState<'history' | 'screenshot' | 'logs'>('history');
  const adbRef = useRef<Adb | null>(null);
  const connectAbort = useRef<AbortController | null>(null);
  const actionAbort = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const entryId = useRef(0);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      connectAbort.current?.abort();
      actionAbort.current?.abort();
      const adb = adbRef.current;
      adbRef.current = null;
      void adb?.close().catch(() => {});
    };
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(project)); } catch { /* Private browsing can disable storage. */ }
  }, [project]);
  useEffect(() => {
    if (!screenshot) { setImageUrl(''); return; }
    const url = URL.createObjectURL(screenshot);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [screenshot]);

  const addEntry = (title: string, text: string, ok = true) => {
    if (!mounted.current) return;
    setEntries(previous => [{ id: ++entryId.current, title, time: new Date().toLocaleTimeString('vi-VN'), text: text.slice(0, 6000), ok }, ...previous].slice(0, 30));
  };

  const disconnect = async () => {
    connectAbort.current?.abort(new Error('Đã hủy kết nối.'));
    actionAbort.current?.abort(new Error('Đã ngắt kết nối.'));
    const adb = adbRef.current;
    adbRef.current = null;
    setDevice(null);
    setApps([]);
    setStatus('Đã ngắt kết nối');
    if (adb) {
      await adb.close().catch(() => {});
      addEntry('USB', 'Đã ngắt kết nối thiết bị.');
    }
  };

  const connect = async () => {
    if (!usbManager || connectAbort.current || adbRef.current) return;
    const controller = new AbortController();
    connectAbort.current = controller;
    setConnecting(true);
    setError('');
    setStatus('Chọn điện thoại trong hộp thoại của trình duyệt…');
    let timer: number | undefined;
    try {
      // Keep requestDevice in the click handler so browser user activation is preserved.
      const selected = await usbManager.requestDevice();
      controller.signal.throwIfAborted();
      if (!selected) { setStatus('Chưa chọn thiết bị'); return; }
      setStatus('Mở khóa điện thoại và chọn “Allow USB debugging”. Đang chờ tối đa 60 giây…');
      timer = window.setTimeout(() => controller.abort(new Error('Hết thời gian chờ. Mở khóa điện thoại, xác nhận USB debugging rồi thử lại.')), 60_000);
      const adb = await authenticate(selected, controller.signal);
      if (!mounted.current || controller.signal.aborted) { await adb.close(); return; }
      adbRef.current = adb;
      setDevice({ name: adb.banner.model || selected.name || 'Android', serial: selected.serial });
      setApps([]); setLogs(''); setScreenshot(null); setEntries([]); setTab('history');
      setStatus('Đã kết nối qua USB');
      addEntry('Kết nối USB', 'Thiết bị đã xác thực. Các nút bên dưới thực thi trực tiếp trên điện thoại.');
      const onDisconnect = () => {
        if (!mounted.current || adbRef.current !== adb) return;
        adbRef.current = null;
        actionAbort.current?.abort(new Error('Thiết bị đã mất kết nối.'));
        setDevice(null); setApps([]); setStatus('Thiết bị đã mất kết nối. Cắm lại USB và bấm Kết nối.');
        addEntry('USB', 'Mất kết nối thiết bị.', false);
      };
      void adb.disconnected.then(onDisconnect, onDisconnect);
    } catch (cause) {
      if (mounted.current) {
        setError(connectionError(controller.signal.aborted ? controller.signal.reason : cause));
        setStatus('Kết nối chưa thành công');
      }
    } finally {
      window.clearTimeout(timer);
      if (connectAbort.current === controller) connectAbort.current = null;
      if (mounted.current) setConnecting(false);
    }
  };

  const run = async (title: string, operation: (adb: Adb, signal: AbortSignal) => Promise<string>) => {
    const adb = adbRef.current;
    if (!adb || actionAbort.current) return;
    const controller = new AbortController();
    actionAbort.current = controller;
    setBusy(title); setError('');
    let timedOut = false;
    const timer = window.setTimeout(() => {
      timedOut = true;
      controller.abort(new Error('Thao tác quá 30 giây. Đã đóng kết nối; hãy kết nối lại để thử tiếp.'));
      void adb.close().catch(() => {});
    }, 30_000);
    try {
      const result = await operation(adb, controller.signal);
      controller.signal.throwIfAborted();
      if (mounted.current && adbRef.current === adb) addEntry(title, result || 'Hoàn tất.');
    } catch (cause) {
      if (mounted.current) {
        const message = timedOut ? 'Thao tác quá 30 giây. Hãy kết nối lại thiết bị.' : connectionError(controller.signal.aborted ? controller.signal.reason : cause);
        setError(message); addEntry(title, message, false);
      }
    } finally {
      window.clearTimeout(timer);
      if (actionAbort.current === controller) actionAbort.current = null;
      if (mounted.current) setBusy('');
    }
  };

  const shellAction = (title: string, action: Parameters<typeof appCommand>[0]) => {
    try {
      const args = appCommand(action, project.pkg, permission);
      if (action === 'clear' && !window.confirm(`Xóa TOÀN BỘ dữ liệu của ${packageId(project.pkg)} trên ${device?.name}? Tài khoản đăng nhập và dữ liệu local sẽ bị xóa. Không thể hoàn tác.`)) return;
      void run(title, async (adb, signal) => (await runShell(adb, args, signal)).text);
    } catch (cause) { setError(connectionError(cause)); }
  };

  const fetchInfo = () => void run('Thông tin thiết bị', async (adb, signal) => {
    const { text } = await runShell(adb, ['getprop'], signal);
    const prop = (key: string) => text.split('\n').find(line => line.startsWith(`[${key}]:`))?.split(']: [')[1]?.replace(/\]$/, '') || '—';
    const info = { model: prop('ro.product.model'), android: prop('ro.build.version.release'), api: prop('ro.build.version.sdk') };
    setDevice(previous => previous ? { ...previous, ...info } : previous);
    return `Model: ${info.model}\nAndroid: ${info.android}\nAPI: ${info.api}\nABI: ${prop('ro.product.cpu.abi')}\nSerial: ${adb.serial}`;
  });

  const fetchApps = () => void run('Danh sách app', async (adb, signal) => {
    const { text } = await runShell(adb, ['pm', 'list', 'packages', '-3'], signal);
    const list = text.split('\n').filter(line => line.startsWith('package:')).map(line => line.slice(8).trim()).sort();
    setApps(list);
    return `Đã lấy ${list.length} app bên thứ ba. Chọn package ở ô bên trái.`;
  });

  const capture = () => void run('Chụp màn hình', async (adb, signal) => {
    const { bytes } = await runShell(adb, ['screencap', '-p'], signal, true);
    if (!isPng(bytes)) throw new Error('Thiết bị không trả về ảnh PNG hợp lệ.');
    setScreenshot(new Blob([bytes], { type: 'image/png' })); setTab('screenshot');
    return `Đã chụp màn hình (${Math.round(bytes.length / 1024)} KB).`;
  });

  const fetchLogs = () => void run('Lấy Logcat', async (adb, signal) => {
    const args = ['logcat', '-d', '-t', '1500', '-v', 'threadtime'];
    if (logScope === 'rn') args.push('ReactNative:V', 'ReactNativeJS:V', 'AndroidRuntime:E', '*:S');
    if (logScope === 'app') {
      const pkg = packageId(project.pkg);
      const { text: pid } = await runShell(adb, ['pidof', '-s', pkg], signal);
      if (!/^\d+$/.test(pid)) throw new Error('App chưa chạy. Mở app trước khi lấy log theo PID.');
      args.push(`--pid=${pid}`);
    }
    const { text } = await runShell(adb, args, signal);
    setLogs(text); setTab('logs');
    return text ? 'Đã đọc bản chụp Logcat, tối đa 1.500 dòng. Bấm Lấy log lần nữa để cập nhật.' : 'Không có log khớp bộ lọc. Thử chọn Tất cả tag.';
  });

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); addEntry('Clipboard', 'Đã sao chép.'); }
    catch { setError('Không sao chép được. Hãy chọn và copy nội dung thủ công.'); }
  };

  const locked = !device || !!busy || connecting;
  const appLocked = locked || !project.pkg.trim();
  const visibleLogs = logs.split('\n').filter(line => !filter || line.toLowerCase().includes(filter.toLowerCase())).join('\n');
  let metro = '';
  try { metro = metroCommand(device?.serial || '', project.port); } catch { /* Explained below the port field. */ }

  return <PageShell title="Android Device Toolbox" subtitle="Điều khiển Android thật ngay trên trình duyệt" icon="🔌" backTo="/mobile" maxWidth="5xl">
    <div className="space-y-5">
      <section className={`${card} border-t-4 border-t-orange-500`}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 min-w-0"><span className="rounded-xl bg-orange-50 p-3 text-orange-600 dark:bg-orange-500/10"><Smartphone size={26} /></span><div className="min-w-0"><p className="mb-1 text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400">USB workspace</p><h2 className="text-lg font-bold break-words">{device?.name || 'Cắm điện thoại. Kết nối. Bắt đầu test.'}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400" role="status">{status}</p>{device && <p className="mt-2 font-mono text-xs break-all">{device.serial}{device.android ? ` · Android ${device.android} · API ${device.api}` : ''}</p>}</div></div>
          <div className="flex shrink-0 gap-2">{device || connecting ? <button className={button} onClick={() => void disconnect()}><Unplug size={16} />{connecting ? 'Hủy kết nối' : 'Ngắt kết nối'}</button> : <button className={`${button} !bg-orange-500 !border-orange-500 text-white hover:!bg-orange-600`} disabled={!usbManager || !window.isSecureContext} onClick={() => void connect()}><PlugZap size={17} />Kết nối USB</button>}</div>
        </div>
        {!usbManager && <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">{!window.isSecureContext ? 'WebUSB cần HTTPS hoặc localhost. Mở trang bằng địa chỉ an toàn để kết nối.' : 'Trình duyệt này không hỗ trợ WebUSB. Mở trang bằng Chrome hoặc Edge trên máy tính; Safari và Firefox không dùng được tính năng này.'}</p>}
        <ol className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300 md:grid-cols-3"><li><b className="text-orange-500">01.</b> Bật Developer options → USB debugging.</li><li><b className="text-orange-500">02.</b> Cắm cáp truyền dữ liệu và bấm Kết nối USB.</li><li><b className="text-orange-500">03.</b> Mở khóa máy, chấp nhận “Allow USB debugging”.</li></ol>
      </section>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 whitespace-pre-wrap break-words">{error}</div>}
      {busy && <p role="status" className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400"><Loader2 className="animate-spin" size={16} />Đang thực hiện: {busy}…</p>}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="space-y-5">
          <section className={card}>
            <div className="mb-4 flex items-center justify-between gap-2"><h2 className="text-lg font-bold">App đang test</h2><button className={button} disabled={locked} onClick={fetchApps}><RefreshCw size={15} />Lấy app</button></div>
            <label className="mb-2 block text-sm font-medium" htmlFor="adb-package">Package name</label>
            <input id="adb-package" className={`${input} font-mono`} list="adb-packages" value={project.pkg} onChange={event => setProject({ ...project, pkg: event.target.value })} placeholder="com.example.app" autoComplete="off" spellCheck={false} disabled={!!busy} />
            <datalist id="adb-packages">{apps.map(pkg => <option key={pkg} value={pkg} />)}</datalist>
            <p className="mt-2 text-xs text-slate-500">Nhập package hoặc bấm Lấy app để có gợi ý từ điện thoại.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className={button} disabled={appLocked} onClick={() => shellAction('Mở app', 'launch')}>Mở app</button>
              <button className={button} disabled={appLocked} onClick={() => shellAction('Dừng app', 'stop')}>Dừng app</button>
              <button className={button} disabled={appLocked} onClick={() => void run('Khởi động lại app', async (adb, signal) => { await runShell(adb, appCommand('stop', project.pkg), signal); return (await runShell(adb, appCommand('launch', project.pkg), signal)).text; })}>Khởi động lại</button>
              <button className={button} disabled={appLocked} onClick={() => shellAction('Cài đặt app', 'settings')}>Cài đặt app</button>
            </div>
            <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
              <label htmlFor="adb-permission" className="mb-2 block text-sm font-medium">Runtime permission</label>
              <select id="adb-permission" className={input} value={permission} onChange={event => setPermission(event.target.value)} disabled={!!busy}>{PERMISSIONS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
              <div className="mt-2 grid grid-cols-2 gap-2"><button className={button} disabled={appLocked} onClick={() => shellAction('Cấp permission', 'grant')}>Cấp quyền</button><button className={button} disabled={appLocked} onClick={() => shellAction('Thu hồi permission', 'revoke')}>Thu hồi quyền</button></div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">App phải khai báo permission trong manifest. Tùy Android, việc thu hồi có thể dừng app; không đồng nghĩa reset trạng thái “Không hỏi lại”.</p>
            </div>
            <button className={`${button} mt-5 w-full text-red-600 dark:text-red-400`} disabled={appLocked} onClick={() => shellAction('Xóa dữ liệu app', 'clear')}>Xóa toàn bộ dữ liệu app…</button>
          </section>

          <section className={card}>
            <h2 className="mb-4 text-lg font-bold">Thiết bị & bug report</h2>
            <div className="grid grid-cols-2 gap-2"><button className={button} disabled={locked} onClick={fetchInfo}>Thông tin máy</button><button className={button} disabled={locked} onClick={capture}><Camera size={16} />Chụp màn hình</button></div>
            <label htmlFor="adb-log-scope" className="mb-2 mt-4 block text-sm font-medium">Lấy Logcat gần nhất</label>
            <div className="flex gap-2"><select id="adb-log-scope" className={input} value={logScope} onChange={event => setLogScope(event.target.value as typeof logScope)} disabled={!!busy}><option value="rn">React Native + Android crash</option><option value="app">PID của app đang test</option><option value="all">Tất cả tag</option></select><button className={`${button} shrink-0`} disabled={locked || (logScope === 'app' && !project.pkg.trim())} onClick={fetchLogs}>Lấy log</button></div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">Bản chụp tối đa 1.500 dòng, không phải live stream. Lọc theo PID chỉ lấy tiến trình đang chạy; dùng Android crash nếu app đã thoát.</p>
          </section>
        </div>

        <section className={`${card} min-w-0 flex flex-col`}>
          <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Kết quả thiết bị">{([['history', 'Hoạt động'], ['screenshot', 'Screenshot'], ['logs', 'Logcat']] as const).map(([id, label]) => <button key={id} id={`adb-tab-${id}`} role="tab" aria-selected={tab === id} aria-controls="adb-output" className={`${button} ${tab === id ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300' : ''}`} onClick={() => setTab(id)}>{label}</button>)}</div>
          <div id="adb-output" role="tabpanel" aria-labelledby={`adb-tab-${tab}`} className="min-w-0 flex-1">
            {tab === 'history' && (entries.length ? <div className="space-y-3 max-h-[700px] overflow-auto">{entries.map(entry => <article key={entry.id} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800"><div className="flex items-center gap-2 text-sm"><CheckCircle2 size={15} className={entry.ok ? 'text-emerald-600' : 'text-red-500'} /><strong>{entry.title}</strong><time className="ml-auto text-xs text-slate-500">{entry.time}</time></div><pre className="mt-2 whitespace-pre-wrap break-all text-xs leading-relaxed text-slate-600 dark:text-slate-300">{entry.text}</pre></article>)}</div> : <div className="flex min-h-[350px] flex-col items-center justify-center text-center text-slate-500"><TerminalSquare size={38} strokeWidth={1.2} /><h3 className="mt-4 font-semibold text-slate-700 dark:text-slate-300">Kết quả thao tác sẽ hiện ở đây</h3><p className="mt-2 max-w-xs text-sm">Kết nối Android qua USB, chọn app rồi thực hiện một thao tác để bắt đầu.</p></div>)}
            {tab === 'screenshot' && (imageUrl && screenshot ? <div><button className={`${button} mb-4`} onClick={() => download(screenshot, `android-${Date.now()}.png`)}><Download size={15} />Tải PNG</button><img src={imageUrl} alt="Ảnh chụp màn hình thiết bị Android đang kết nối" className="mx-auto max-h-[650px] max-w-full rounded-xl object-contain" /></div> : <p className="py-20 text-center text-sm text-slate-500">Bấm Chụp màn hình để xem ảnh từ điện thoại.</p>)}
            {tab === 'logs' && <div><label htmlFor="adb-log-filter" className="mb-2 block text-sm">Tìm trong log</label><input id="adb-log-filter" className={input} value={filter} onChange={event => setFilter(event.target.value)} placeholder="Tìm keyword, tag, lỗi…" /><div className="my-3 flex flex-wrap gap-2"><button className={button} disabled={!visibleLogs} onClick={() => download(new Blob([visibleLogs], { type: 'text/plain;charset=utf-8' }), `logcat-${Date.now()}.txt`)}><Download size={15} />Tải log đã lọc</button><button className={button} disabled={!visibleLogs} onClick={() => void copy(visibleLogs)}><Copy size={15} />Copy</button></div><pre className="max-h-[600px] min-h-[250px] overflow-auto rounded-xl bg-slate-100 p-3 text-xs leading-relaxed dark:bg-slate-950 whitespace-pre-wrap break-all">{visibleLogs || (logs ? 'Không có dòng khớp từ khóa.' : 'Chưa có log. Chọn phạm vi rồi bấm Lấy log.')}</pre></div>}
          </div>
        </section>
      </div>

      <details className={card}><summary className="min-h-[44px] cursor-pointer font-bold">React Native: kết nối Metro</summary><div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300"><p>Metro chạy trên máy tính. Trình duyệt không mở được kết nối TCP trực tiếp đến Metro, nên bản này chưa hỗ trợ reverse port qua WebUSB.</p><p>Để dùng Metro qua USB: ngắt kết nối Toolbox, chạy lệnh dưới đây trong Terminal rồi giữ phiên ADB đó. Kết nối lại Toolbox có thể cần dừng ADB server và làm mất reverse port. Nếu muốn dùng song song, cấu hình app kết nối Metro qua IP LAN của máy tính.</p><label htmlFor="adb-metro-port" className="block font-medium">Metro port</label><input id="adb-metro-port" className={`${input} max-w-40`} inputMode="numeric" value={project.port} onChange={event => setProject({ ...project, port: event.target.value })} /><pre className="overflow-x-auto rounded-xl bg-slate-100 p-3 text-xs dark:bg-slate-950">{metro || 'Port phải từ 1 đến 65535.'}</pre><button className={button} disabled={!metro} onClick={() => void copy(metro)}><Copy size={15} />Copy lệnh Terminal</button></div></details>

      <details className={card}><summary className="min-h-[44px] cursor-pointer font-bold">Không thấy máy hoặc không kết nối được?</summary><div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300"><p><b>USB đang bận:</b> tạm ngừng debug trong Android Studio, đóng tab WebADB khác và chạy <code>adb kill-server</code> trong Terminal. Lệnh này dừng các phiên ADB đang chạy trên máy tính.</p><p><b>Danh sách trống:</b> kiểm tra cáp có truyền dữ liệu, bật USB debugging, mở khóa điện thoại. Windows có thể cần driver Android ADB; Linux cần quyền truy cập USB.</p><p><b>Không hiện hộp thoại xác thực:</b> rút/cắm lại cáp, kiểm tra “Revoke USB debugging authorizations” trong Developer options rồi kết nối lại.</p><p><b>Môi trường:</b> dùng Chrome/Edge, HTTPS hoặc localhost và Android hỗ trợ shell v2. Trình giả lập trên máy tính không xuất hiện trong danh sách USB.</p><p>Ảnh và log của công cụ được xử lý trong tab, không gửi lên backend. Package/port được nhớ trên trình duyệt; khóa xác thực ADB được thư viện lưu trong IndexedDB của website.</p></div></details>
    </div>
  </PageShell>;
}

export default AndroidToolbox;
