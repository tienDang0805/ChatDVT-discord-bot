import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, RotateCcw, Smartphone, Tablet, Monitor, Copy, Trash2, Maximize2, Minimize2, Sun, Moon, Wifi, Battery, Signal, ChevronDown, Terminal, X as XIcon, AlertTriangle, Info, Bug } from 'lucide-react';

interface DebugLog {
  id: number;
  type: 'log' | 'warn' | 'error' | 'info' | 'postMessage' | 'event' | 'network';
  content: string;
  timestamp: number;
}

interface DevicePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  type: 'phone' | 'tablet';
  notch?: boolean;
}

const DEVICES: DevicePreset[] = [
  { id: 'iphone-15', name: 'iPhone 15 Pro', width: 393, height: 852, type: 'phone', notch: true },
  { id: 'iphone-se', name: 'iPhone SE', width: 375, height: 667, type: 'phone' },
  { id: 'pixel-8', name: 'Pixel 8', width: 412, height: 915, type: 'phone', notch: true },
  { id: 'samsung-s24', name: 'Galaxy S24', width: 360, height: 780, type: 'phone', notch: true },
  { id: 'ipad-mini', name: 'iPad Mini', width: 744, height: 1133, type: 'tablet' },
  { id: 'ipad-pro', name: 'iPad Pro 11"', width: 834, height: 1194, type: 'tablet' },
];

const EXAMPLE_SCRIPT = `<div style="padding: 20px; text-align: center; background: linear-gradient(135deg, #f97316, #ec4899); color: white; border-radius: 12px; margin: 20px; font-family: sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  <h2 style="margin-bottom: 10px; font-weight: 800;">ChatDVT Simulator</h2>
  <p style="font-size: 13px; opacity: 0.9; margin-bottom: 20px;">Trình giả lập WebView chạy mượt mà</p>
  <button onclick="runTest()" style="background: white; color: #f97316; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: transform 0.2s;">
    Bấm test Console
  </button>
</div>
<script>
function runTest() {
  console.log("Xin chào từ WebView Simulator!");
  console.warn("Cảnh báo mẫu trong simulator");
  console.error("Lỗi mẫu trong simulator");
  alert("Test thành công!");
}
</script>`;

const wrapSnippet = (snippet: string): string => {
  const trimmed = snippet.trim();
  if (trimmed.toLowerCase().startsWith('<!doctype') || trimmed.toLowerCase().startsWith('<html')) {
    return trimmed;
  }
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:100%;height:100%;overflow-x:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;-ms-overflow-style:none;scrollbar-width:none}
    html::-webkit-scrollbar,body::-webkit-scrollbar{display:none}
    /* Override external widget CSS that incorrectly uses device-width instead of width */
    #osc_frame.h-open-container, .osc-widget-normal {
      width: 100% !important;
      height: 100% !important;
      max-height: 100vh !important;
      bottom: 0 !important;
      right: 0 !important;
      left: 0 !important;
      border-radius: 0 !important;
    }
  </style>
  <script>
    Object.defineProperty(window.screen, 'width', { get: function() { return window.innerWidth; } });
    Object.defineProperty(window.screen, 'height', { get: function() { return window.innerHeight; } });
    Object.defineProperty(window.screen, 'availWidth', { get: function() { return window.innerWidth; } });
    Object.defineProperty(window.screen, 'availHeight', { get: function() { return window.innerHeight; } });
    Object.defineProperty(Navigator.prototype, 'userAgent', { get: function() { return 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'; } });
    Object.defineProperty(Navigator.prototype, 'platform', { get: function() { return 'iPhone'; } });
    Object.defineProperty(Navigator.prototype, 'maxTouchPoints', { get: function() { return 5; } });
    if (navigator.userAgentData) {
      Object.defineProperty(navigator.userAgentData, 'mobile', { get: function() { return true; } });
    } else {
      Object.defineProperty(Navigator.prototype, 'userAgentData', { get: function() { return { mobile: true, platform: 'iOS' }; } });
    }
    window.ontouchstart = function(){};
    var originalMatchMedia = window.matchMedia;
    window.matchMedia = function(query) {
      if (query.includes('pointer: coarse') || query.includes('hover: none')) return { matches: true, media: query, addListener: function(){}, removeListener: function(){} };
      if (query.includes('pointer: fine') || query.includes('hover: hover')) return { matches: false, media: query, addListener: function(){}, removeListener: function(){} };
      return originalMatchMedia.call(window, query);
    };
    (function(){
      function s(o){try{return JSON.stringify(o)}catch(e){return String(o)}}
      function send(t,c){parent.postMessage({__debug:true,type:t,content:c},'*');}
      var ol=console.log,ow=console.warn,oe=console.error,oi=console.info;
      console.log=function(){var a=[].slice.call(arguments).map(s).join(' ');ol.apply(console,arguments);send('log',a);};
      console.warn=function(){var a=[].slice.call(arguments).map(s).join(' ');ow.apply(console,arguments);send('warn',a);};
      console.error=function(){var a=[].slice.call(arguments).map(s).join(' ');oe.apply(console,arguments);send('error',a);};
      console.info=function(){var a=[].slice.call(arguments).map(s).join(' ');oi.apply(console,arguments);send('info',a);};
      window.addEventListener('error',function(e){send('error','[JS] '+e.message+' at '+e.filename+':'+e.lineno);});
      window.addEventListener('unhandledrejection',function(e){send('error','[Promise] '+String(e.reason));});
      var origPM=window.postMessage;
      window.addEventListener('message',function(e){if(e.data&&!e.data.__debug){send('postMessage','[IN] '+s(e.data));}});
      var origFetch=window.fetch;
      if(origFetch){window.fetch=function(){var url=arguments[0];var opts=arguments[1]||{};send('network','[Fetch] '+(opts.method||'GET')+' '+url);return origFetch.apply(window,arguments).then(function(r){send('network','[Fetch] '+r.status+' '+url);return r;}).catch(function(e){send('error','[Fetch] FAIL '+url+' '+e.message);throw e;});};}
      var origXHR=XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open=function(m,u){this.__dbg_url=m+' '+u;send('network','[XHR] '+m+' '+u);origXHR.apply(this,arguments);};
      send('info','[Debug] Bridge initialized');
    })();
  </script>
</head>
<body>
${trimmed}
</body>
</html>`;
};

export const EmulatorCheck = () => {
  const [code, setCode] = useState(EXAMPLE_SCRIPT);
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(DEVICES[0]);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [scale, setScale] = useState(1);
  const [isDarkStatusBar, setIsDarkStatusBar] = useState(false);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [debugFilter, setDebugFilter] = useState<'all' | 'log' | 'warn' | 'error' | 'postMessage' | 'network'>('all');
  const debugLogIdRef = useRef(0);
  const debugScrollRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const deviceW = isLandscape ? selectedDevice.height : selectedDevice.width;
  const deviceH = isLandscape ? selectedDevice.width : selectedDevice.height;

  const calculateScale = useCallback(() => {
    const container = previewContainerRef.current;
    if (!container) return;
    const padding = 80;
    const availW = container.clientWidth - padding;
    const availH = container.clientHeight - padding;
    const frameW = deviceW + 32;
    const frameH = deviceH + 100;
    const maxScale = selectedDevice.type === 'phone' ? 0.82 : 0.7;
    const s = Math.min(availW / frameW, availH / frameH, maxScale);
    setScale(Math.max(s, 0.25));
  }, [deviceW, deviceH, selectedDevice.type]);

  useEffect(() => {
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [calculateScale]);

  useEffect(() => {
    document.title = 'WebView Simulator | ChatDVT Portal';
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowDeviceMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data && e.data.__debug) {
        debugLogIdRef.current++;
        const entry: DebugLog = { id: debugLogIdRef.current, type: e.data.type, content: e.data.content, timestamp: Date.now() };
        setDebugLogs(prev => [...prev.slice(-500), entry]);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  useEffect(() => {
    if (debugScrollRef.current) {
      debugScrollRef.current.scrollTop = debugScrollRef.current.scrollHeight;
    }
  }, [debugLogs]);

  const renderPreview = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !code.trim()) return;
    const html = wrapSnippet(code);
    iframe.srcdoc = html;
  }, [code]);

  const handleRun = useCallback(() => {
    renderPreview();
  }, [renderPreview]);

  const handleClear = () => {
    setCode('');
    setDebugLogs([]);
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.srcdoc = '';
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setCode(text);
    } catch {}
  };

  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="h-screen flex flex-col bg-[#0a0e17] text-slate-200 font-sans overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-[#0d1220] shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-slate-500 hover:text-cyan-400 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <Smartphone size={18} className="text-cyan-400" />
            <h1 className="text-sm font-bold tracking-tight">WebView <span className="text-cyan-400">Simulator</span></h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowDeviceMenu(!showDeviceMenu)}
              className="flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              {selectedDevice.type === 'phone' ? <Smartphone size={13} /> : <Tablet size={13} />}
              {selectedDevice.name}
              <ChevronDown size={12} />
            </button>
            {showDeviceMenu && (
              <div className="absolute top-full right-0 mt-1 bg-[#1a2035] border border-slate-700 rounded-xl shadow-2xl z-50 py-1.5 min-w-[200px]">
                {DEVICES.map(d => (
                  <button
                    key={d.id}
                    onClick={() => { setSelectedDevice(d); setShowDeviceMenu(false); }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-700/50 transition-colors flex items-center gap-2 ${d.id === selectedDevice.id ? 'text-cyan-400' : 'text-slate-300'}`}
                  >
                    {d.type === 'phone' ? <Smartphone size={12} /> : <Tablet size={12} />}
                    {d.name}
                    <span className="text-slate-600 ml-auto">{d.width}×{d.height}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsLandscape(!isLandscape)}
            className={`p-1.5 rounded-lg border transition-colors ${isLandscape ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}
            title="Xoay màn hình"
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={() => setShowDebug(!showDebug)}
            className={`p-1.5 rounded-lg border transition-colors relative ${showDebug ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}
            title="Debug Console"
          >
            <Terminal size={14} />
            {debugLogs.filter(l => l.type === 'error').length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] font-black text-white flex items-center justify-center">{debugLogs.filter(l => l.type === 'error').length > 9 ? '9+' : debugLogs.filter(l => l.type === 'error').length}</span>
            )}
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình preview'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {!isFullscreen && (
          <div className="w-[45%] flex flex-col border-r border-slate-800 min-h-0">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-[#0d1220] shrink-0">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">HTML / JS Editor</span>
              <div className="flex gap-1">
                <button onClick={handlePaste} className="text-[10px] font-medium text-slate-500 hover:text-cyan-400 px-2 py-1 rounded hover:bg-slate-800 transition-colors flex items-center gap-1" title="Paste từ clipboard">
                  <Copy size={11} /> Paste
                </button>
                <button onClick={handleClear} className="text-[10px] font-medium text-slate-500 hover:text-red-400 px-2 py-1 rounded hover:bg-slate-800 transition-colors flex items-center gap-1">
                  <Trash2 size={11} /> Xoá
                </button>
                <button onClick={handleRun} className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors flex items-center gap-1">
                  <Play size={11} /> Chạy
                </button>
              </div>
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              className={`w-full bg-[#0a0e17] text-emerald-300 font-mono text-[12px] leading-relaxed p-4 resize-none focus:outline-none selection:bg-cyan-500/30 min-h-0 ${showDebug ? 'flex-1 basis-1/2' : 'flex-1'}`}
              placeholder="Paste HTML/JS script vào đây..."
            />

            {showDebug && (
              <div className="flex-1 basis-1/2 border-t border-slate-800 bg-[#0d1220] flex flex-col min-h-0">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Terminal size={13} className="text-emerald-400" />
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Debug Console</span>
                    <span className="text-[10px] text-slate-600 ml-1">{debugLogs.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(['all', 'log', 'warn', 'error', 'postMessage', 'network'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setDebugFilter(f)}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors ${debugFilter === f ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {f === 'all' ? 'All' : f === 'postMessage' ? 'Msg' : f === 'network' ? 'Net' : f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                    <button onClick={() => setDebugLogs([])} className="text-slate-600 hover:text-red-400 ml-1 transition-colors" title="Xóa logs"><Trash2 size={12} /></button>
                    <button onClick={() => setShowDebug(false)} className="text-slate-600 hover:text-slate-300 ml-1 transition-colors"><XIcon size={14} /></button>
                  </div>
                </div>
                <div ref={debugScrollRef} className="flex-1 overflow-y-auto overflow-x-hidden font-mono text-[11px] leading-relaxed min-h-0">
                  {debugLogs.filter(l => debugFilter === 'all' || l.type === debugFilter).map(log => {
                    const colors: Record<string, string> = {
                      log: 'text-slate-400', warn: 'text-yellow-400', error: 'text-red-400',
                      info: 'text-cyan-400', postMessage: 'text-purple-400', event: 'text-blue-400', network: 'text-emerald-400'
                    };
                    const icons: Record<string, any> = {
                      error: <AlertTriangle size={10} className="shrink-0 mt-0.5" />,
                      warn: <AlertTriangle size={10} className="shrink-0 mt-0.5" />,
                      info: <Info size={10} className="shrink-0 mt-0.5" />,
                      postMessage: <Bug size={10} className="shrink-0 mt-0.5" />,
                    };
                    const ts = new Date(log.timestamp);
                    const time = `${String(ts.getHours()).padStart(2,'0')}:${String(ts.getMinutes()).padStart(2,'0')}:${String(ts.getSeconds()).padStart(2,'0')}.${String(ts.getMilliseconds()).padStart(3,'0')}`;
                    return (
                      <div key={log.id} className={`flex items-start gap-1.5 px-2 py-0.5 hover:bg-slate-800/40 border-b border-slate-800/30 ${colors[log.type] || 'text-slate-400'}`}>
                        <span className="text-slate-700 shrink-0 text-[9px]">{time}</span>
                        {icons[log.type] || <Terminal size={10} className="shrink-0 mt-0.5" />}
                        <span className={`text-[9px] font-bold uppercase shrink-0 ${log.type === 'error' ? 'text-red-500' : log.type === 'warn' ? 'text-yellow-500' : 'text-slate-600'}`}>{log.type === 'postMessage' ? 'MSG' : log.type === 'network' ? 'NET' : log.type.slice(0, 3).toUpperCase()}</span>
                        <span className="break-all">{log.content}</span>
                      </div>
                    );
                  })}
                  {debugLogs.filter(l => debugFilter === 'all' || l.type === debugFilter).length === 0 && (
                    <div className="flex items-center justify-center h-full text-slate-700 text-xs">Chưa có log nào{debugFilter !== 'all' ? ` (filter: ${debugFilter})` : ''}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div
          ref={previewContainerRef}
          className={`${isFullscreen ? 'w-full' : 'flex-1'} flex items-center justify-center bg-[#080c14] overflow-hidden relative`}
        >
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center', transition: 'transform 0.3s ease' }}>
            <div
              className="relative bg-[#1a1a1a] rounded-[3rem] shadow-2xl shadow-black/50"
              style={{
                width: deviceW + 32,
                height: deviceH + (selectedDevice.type === 'phone' ? 90 : 60),
                padding: selectedDevice.type === 'phone' ? '45px 16px' : '30px 16px',
              }}
            >
              <div className="absolute inset-0 rounded-[3rem] border-2 border-slate-700/30 pointer-events-none" />

              {selectedDevice.type === 'phone' && (
                <>
                  <div className="absolute top-0 left-0 right-0 h-[45px] flex items-center justify-between px-8 z-10">
                    <span className={`text-[11px] font-bold ${isDarkStatusBar ? 'text-black' : 'text-white'}`}>{timeStr}</span>
                    {selectedDevice.notch && (
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[90px] h-[28px] bg-black rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700" />
                      </div>
                    )}
                    <div className={`flex items-center gap-1 ${isDarkStatusBar ? 'text-black' : 'text-white'}`}>
                      <Signal size={11} />
                      <Wifi size={11} />
                      <Battery size={11} />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-slate-600 rounded-full" />
                </>
              )}

              <div
                className="relative bg-white rounded-[10px] overflow-hidden"
                style={{ width: deviceW, height: deviceH }}
              >
                <iframe
                  ref={iframeRef}
                  title="WebView Preview"
                  allow="geolocation; microphone; camera"
                  className="border-0 block"
                  style={{ width: deviceW, height: deviceH, overflow: 'hidden' }}
                />
              </div>
            </div>

            <p className="text-center text-[10px] text-slate-600 mt-3 font-medium">
              {selectedDevice.name} — {deviceW}×{deviceH} {isLandscape ? '(Landscape)' : '(Portrait)'}
            </p>
          </div>

          <button
            onClick={() => setIsDarkStatusBar(!isDarkStatusBar)}
            className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50 text-slate-500 hover:text-slate-300 transition-colors"
            title="Toggle status bar color"
          >
            {isDarkStatusBar ? <Sun size={12} /> : <Moon size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
};
