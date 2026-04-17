import { useState, useRef, useEffect } from 'react';
import { QRCode } from 'react-qrcode-logo';
import * as htmlToImage from 'html-to-image';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Download, Upload, Trash2, Palette, Sun, Moon,
  Type, Image, Sliders, Sparkles, QrCode, ChevronDown, ImagePlus, PenLine, Frame
} from 'lucide-react';

const FONT_OPTIONS = [
  { name: 'Sans Serif', value: '"Inter", "Segoe UI", sans-serif' },
  { name: 'Serif', value: '"Georgia", "Times New Roman", serif' },
  { name: 'Mono', value: '"Courier New", monospace' },
  { name: 'Cursive', value: '"Brush Script MT", "Segoe Script", cursive' },
  { name: 'Fantasy', value: '"Impact", "Haettenschweiler", fantasy' },
];

const FRAME_STYLES = [
  { id: 'none', label: 'Không', emoji: '❌' },
  { id: 'solid', label: 'Viền', emoji: '⬜' },
  { id: 'rounded', label: 'Bo tròn', emoji: '🔲' },
  { id: 'double', label: 'Đôi', emoji: '📐' },
  { id: 'dashed', label: 'Nét đứt', emoji: '✂️' },
  { id: 'shadow', label: 'Bóng đổ', emoji: '🌑' },
];

const CORNER_STICKERS = ['', '⭐', '❤️', '🌸', '✨', '🔥', '💎', '🎀', '🍀', '👑', '🎵', '🦋'];

type TextPosition = 'top' | 'bottom' | 'center';

type DotStyle = 'squares' | 'dots' | 'fluid';
type PaddingStyle = 'square' | 'circle';
type DownloadFormat = 'png' | 'jpg' | 'webp';

interface PresetTheme {
  name: string;
  fg: string;
  bg: string;
  eye: string;
  dot: DotStyle;
  emoji: string;
}

const presets: PresetTheme[] = [
  { name: 'Classic', fg: '#000000', bg: '#ffffff', eye: '#000000', dot: 'squares', emoji: '⬛' },
  { name: 'Cyberpunk', fg: '#00f0ff', bg: '#0d0d0d', eye: '#ff00d7', dot: 'dots', emoji: '🌐' },
  { name: 'Sunset', fg: '#ff6b35', bg: '#fff8f0', eye: '#e63946', dot: 'fluid', emoji: '🌅' },
  { name: 'Nature', fg: '#2d6a4f', bg: '#f0fff4', eye: '#40916c', dot: 'dots', emoji: '🌿' },
  { name: 'Ocean', fg: '#0077b6', bg: '#f0f8ff', eye: '#023e8a', dot: 'fluid', emoji: '🌊' },
  { name: 'Lavender', fg: '#7b2cbf', bg: '#faf5ff', eye: '#9d4edd', dot: 'dots', emoji: '💜' },
  { name: 'Monochrome', fg: '#333333', bg: '#f5f5f5', eye: '#555555', dot: 'squares', emoji: '🖤' },
  { name: 'Cherry', fg: '#dc143c', bg: '#fff0f3', eye: '#b5002b', dot: 'fluid', emoji: '🍒' },
];

export const QRGenerator = () => {
  const { theme, toggleTheme } = useTheme();
  const qrRef = useRef<QRCode>(null);

  const [text, setText] = useState('https://chatdvt.com');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [eyeColor, setEyeColor] = useState('#000000');
  const [dotStyle, setDotStyle] = useState<DotStyle>('squares');
  const [eyeRadius, setEyeRadius] = useState(0);
  const [qrSize, setQrSize] = useState(280);

  const [logoSrc, setLogoSrc] = useState<string | undefined>(undefined);
  const [logoFileName, setLogoFileName] = useState('');
  const [logoWidth, setLogoWidth] = useState(50);
  const [logoHeight, setLogoHeight] = useState(50);
  const [logoPadding, setLogoPadding] = useState(5);
  const [logoPaddingStyle, setLogoPaddingStyle] = useState<PaddingStyle>('circle');

  const [bgImageSrc, setBgImageSrc] = useState<string | undefined>(undefined);
  const [bgImageName, setBgImageName] = useState('');
  const [bgImageOpacity, setBgImageOpacity] = useState(0.35);
  const [bgImageScale, setBgImageScale] = useState(100);

  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [overlayText, setOverlayText] = useState('');
  const [overlayFontSize, setOverlayFontSize] = useState(18);
  const [overlayColor, setOverlayColor] = useState('#000000');
  const [overlayPosition, setOverlayPosition] = useState<TextPosition>('bottom');
  const [overlayBold, setOverlayBold] = useState(true);
  const [overlayFont, setOverlayFont] = useState(FONT_OPTIONS[0].value);
  const [overlayStroke, setOverlayStroke] = useState(true);
  const [overlayStrokeColor, setOverlayStrokeColor] = useState('#ffffff');
  const [overlayItalic, setOverlayItalic] = useState(false);
  const [textBannerEnabled, setTextBannerEnabled] = useState(false);
  const [textBannerColor, setTextBannerColor] = useState('#000000');
  const [textBannerOpacity, setTextBannerOpacity] = useState(0.6);

  const [frameStyle, setFrameStyle] = useState('none');
  const [frameColor, setFrameColor] = useState('#000000');
  const [frameWidth, setFrameWidth] = useState(3);
  const [cornerSticker, setCornerSticker] = useState('');
  const [cornerStickerSize, setCornerStickerSize] = useState(24);

  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>('png');
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('content');

  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Tạo Mã QR Custom | ChatDVT Portal';
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoSrc(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoSrc(undefined);
    setLogoFileName('');
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBgImageName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setBgImageSrc(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeBgImage = () => {
    setBgImageSrc(undefined);
    setBgImageName('');
  };

  const applyPreset = (p: PresetTheme) => {
    setFgColor(p.fg);
    setBgColor(p.bg);
    setEyeColor(p.eye);
    setDotStyle(p.dot);
  };

  const hasAnyText = topText.trim() || bottomText.trim();
  const hasDecor = hasAnyText || frameStyle !== 'none' || cornerSticker || bgImageSrc;

  const handleDownload = async () => {
    if (!previewContainerRef.current) return;
    try {
      const mimeMap: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };
      const scale = 2;
      let dataUrl: string;
      if (downloadFormat === 'jpg') {
        dataUrl = await htmlToImage.toJpeg(previewContainerRef.current, { quality: 0.95, pixelRatio: scale, backgroundColor: bgColor });
      } else {
        dataUrl = await htmlToImage.toPng(previewContainerRef.current, { pixelRatio: scale, backgroundColor: bgColor });
      }
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `qr-code-custom.${downloadFormat}`;
      a.click();
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const sections = [
    { id: 'content', label: 'Nội dung', icon: Type },
    { id: 'style', label: 'Kiểu dáng', icon: Palette },
    { id: 'logo', label: 'Logo', icon: Image },
    { id: 'background', label: 'Hình nền', icon: ImagePlus },
    { id: 'text', label: 'Chữ', icon: PenLine },
    { id: 'decor', label: 'Decor', icon: Frame },
    { id: 'advanced', label: 'Nâng cao', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Trang Chủ</span>
          </Link>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-[#1f2937] border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-orange-400 hover:border-orange-500/50 shadow-lg transition-all group"
          >
            {theme === 'dark' ? <Sun size={20} className="group-hover:rotate-90 transition-transform duration-500" /> : <Moon size={20} className="group-hover:-rotate-12 transition-transform duration-500" />}
          </button>
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/25">
              <QrCode size={32} />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Tạo Mã <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">QR Custom</span>
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Tạo mã QR độc đáo với logo riêng, tuỳ chỉnh màu sắc và kiểu dáng. Quét vẫn chuẩn 100%.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">

          <div className="lg:col-span-3 space-y-4">

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                    activeSection === s.id
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/25'
                      : 'bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-orange-500/50'
                  }`}
                >
                  <s.icon size={16} />
                  {s.label}
                </button>
              ))}
            </div>

            {activeSection === 'content' && (
              <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  URL hoặc Văn bản
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Nhập URL hoặc nội dung bất kỳ..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-none"
                />
                <p className="mt-2 text-xs text-slate-400">{text.length} ký tự</p>

                <div className="mt-6">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    <Sparkles size={14} className="inline mr-1 text-orange-500" />
                    Preset Themes
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                    {presets.map(p => (
                      <button
                        key={p.name}
                        onClick={() => applyPreset(p)}
                        className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border transition-all hover:scale-105 ${
                          fgColor === p.fg && bgColor === p.bg
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 shadow-md'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] hover:border-orange-500/50'
                        }`}
                      >
                        <span className="text-xl">{p.emoji}</span>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{p.name}</span>
                        <div className="flex gap-0.5 mt-1">
                          <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" style={{ backgroundColor: p.fg }} />
                          <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" style={{ backgroundColor: p.bg }} />
                          <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" style={{ backgroundColor: p.eye }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'style' && (
              <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Kiểu Dot</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['squares', 'dots', 'fluid'] as DotStyle[]).map(style => (
                      <button
                        key={style}
                        onClick={() => setDotStyle(style)}
                        className={`py-3 px-4 rounded-xl font-semibold text-sm capitalize transition-all ${
                          dotStyle === style
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                            : 'bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-orange-500/50'
                        }`}
                      >
                        {style === 'squares' ? '⬛ Vuông' : style === 'dots' ? '⚫ Tròn' : '🫧 Mượt'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Màu Code', value: fgColor, set: setFgColor },
                    { label: 'Màu Nền', value: bgColor, set: setBgColor },
                    { label: 'Màu Eye', value: eyeColor, set: setEyeColor },
                  ].map(c => (
                    <div key={c.label}>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">{c.label}</label>
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
                        <input
                          type="color"
                          value={c.value}
                          onChange={(e) => c.set(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={c.value}
                          onChange={(e) => c.set(e.target.value)}
                          className="flex-1 bg-transparent text-sm font-mono focus:outline-none uppercase"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                    <span>Bo tròn Eye</span>
                    <span className="text-orange-500">{eyeRadius}px</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={eyeRadius}
                    onChange={(e) => setEyeRadius(Number(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>
              </div>
            )}

            {activeSection === 'logo' && (
              <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Upload Logo / Ảnh biểu tượng</label>
                  {!logoSrc ? (
                    <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-500/5 transition-all group">
                      <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-orange-100 dark:group-hover:bg-orange-500/10 transition-colors">
                        <Upload size={28} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-slate-600 dark:text-slate-300">Kéo thả hoặc click để chọn ảnh</p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG, SVG, WebP</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                  ) : (
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                      <img src={logoSrc} alt="Logo" className="w-16 h-16 rounded-xl object-contain border border-slate-200 dark:border-slate-700 bg-white" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{logoFileName}</p>
                        <p className="text-xs text-green-500 font-medium mt-1">✓ Logo đã sẵn sàng</p>
                      </div>
                      <button onClick={removeLogo} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {logoSrc && (
                  <>
                    {(() => {
                      const maxLogo = Math.floor(qrSize * 0.28);
                      const coverage = Math.round((logoWidth * logoHeight) / (qrSize * qrSize) * 100);
                      const isDanger = coverage > 20;
                      return (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                                <span>Chiều rộng</span><span className="text-orange-500">{logoWidth}px</span>
                              </label>
                              <input type="range" min={20} max={maxLogo} value={Math.min(logoWidth, maxLogo)} onChange={e => setLogoWidth(Number(e.target.value))} className="w-full accent-orange-500" />
                            </div>
                            <div>
                              <label className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                                <span>Chiều cao</span><span className="text-orange-500">{logoHeight}px</span>
                              </label>
                              <input type="range" min={20} max={maxLogo} value={Math.min(logoHeight, maxLogo)} onChange={e => setLogoHeight(Number(e.target.value))} className="w-full accent-orange-500" />
                            </div>
                          </div>
                          <div className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold ${isDanger ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                            <span>Logo chiếm: {coverage}% QR</span>
                            <span>{isDanger ? '⚠️ Quá lớn, khó quét!' : '✅ An toàn'}</span>
                          </div>
                        </>
                      );
                    })()}
                    <div>
                      <label className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                        <span>Padding Logo</span><span className="text-orange-500">{logoPadding}px</span>
                      </label>
                      <input type="range" min={0} max={20} value={logoPadding} onChange={e => setLogoPadding(Number(e.target.value))} className="w-full accent-orange-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Hình dạng Padding</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['circle', 'square'] as PaddingStyle[]).map(s => (
                          <button
                            key={s}
                            onClick={() => setLogoPaddingStyle(s)}
                            className={`py-2.5 rounded-xl font-semibold text-sm capitalize transition-all ${
                              logoPaddingStyle === s
                                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                                : 'bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {s === 'circle' ? '⭕ Tròn' : '⬜ Vuông'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeSection === 'background' && (
              <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Upload Ảnh Nền QR</label>
                  {!bgImageSrc ? (
                    <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 cursor-pointer hover:border-cyan-500 hover:bg-cyan-50/50 dark:hover:bg-cyan-500/5 transition-all group">
                      <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-500/10 transition-colors">
                        <ImagePlus size={28} className="text-slate-400 group-hover:text-cyan-500 transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-slate-600 dark:text-slate-300">Chọn ảnh nền cho QR</p>
                        <p className="text-xs text-slate-400 mt-1">Ảnh sẽ hiển thị phía sau mã QR (như Miku, waifu...)</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleBgImageUpload} />
                    </label>
                  ) : (
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                      <img src={bgImageSrc} alt="BG" className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{bgImageName}</p>
                        <p className="text-xs text-cyan-500 font-medium mt-1">✓ Ảnh nền đã sẵn sàng</p>
                      </div>
                      <button onClick={removeBgImage} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {bgImageSrc && (
                  <>
                    <div>
                      <label className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                        <span>Độ mờ ảnh nền</span><span className="text-orange-500">{Math.round(bgImageOpacity * 100)}%</span>
                      </label>
                      <input type="range" min={10} max={80} value={Math.round(bgImageOpacity * 100)} onChange={e => setBgImageOpacity(Number(e.target.value) / 100)} className="w-full accent-orange-500" />
                      <p className="text-[11px] text-slate-400 mt-2">💡 Giảm opacity để QR dễ quét hơn. Khuyến nghị 25-40%.</p>
                    </div>
                    <div>
                      <label className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                        <span>Kích thước ảnh nền</span><span className="text-orange-500">{bgImageScale}%</span>
                      </label>
                      <input type="range" min={50} max={200} value={bgImageScale} onChange={e => setBgImageScale(Number(e.target.value))} className="w-full accent-orange-500" />
                      <p className="text-[11px] text-slate-400 mt-2">100% = vừa khít QR. &gt;100% = zoom in. &lt;100% = thu nhỏ.</p>
                    </div>
                  </>
                )}

                <div className="bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 rounded-xl p-4">
                  <p className="text-sm text-cyan-700 dark:text-cyan-400 font-medium">
                    🖼️ Ảnh nền sẽ hiển thị phía sau các dot QR. Khi download, ảnh nền + QR sẽ được ghép thành 1 file.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'text' && (
              <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">⬆️ Chữ phía trên QR</label>
                    <input type="text" value={topText} onChange={e => setTopText(e.target.value)} placeholder="VD: Happy Birthday 🎂" className="w-full bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all" maxLength={60} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">⬇️ Chữ phía dưới QR</label>
                    <input type="text" value={bottomText} onChange={e => setBottomText(e.target.value)} placeholder="VD: Scan Me! 📱" className="w-full bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all" maxLength={60} />
                  </div>
                </div>

                {hasAnyText && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Font chữ</label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {FONT_OPTIONS.map(f => (
                          <button key={f.name} onClick={() => setOverlayFont(f.value)} className={`py-2 px-1 rounded-lg text-[11px] font-semibold transition-all ${overlayFont === f.value ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md' : 'bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-orange-500/50'}`}>
                            <span style={{ fontFamily: f.value }}>{f.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                          <span>Cỡ chữ</span><span className="text-orange-500">{overlayFontSize}px</span>
                        </label>
                        <input type="range" min={10} max={40} value={overlayFontSize} onChange={e => setOverlayFontSize(Number(e.target.value))} className="w-full accent-orange-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Màu chữ</label>
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
                          <input type="color" value={overlayColor} onChange={e => setOverlayColor(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent" />
                          <input type="text" value={overlayColor} onChange={e => setOverlayColor(e.target.value)} className="flex-1 bg-transparent text-xs font-mono focus:outline-none uppercase" maxLength={7} />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={overlayBold} onChange={e => setOverlayBold(e.target.checked)} className="w-4 h-4 accent-orange-500 rounded" />
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Bold</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={overlayItalic} onChange={e => setOverlayItalic(e.target.checked)} className="w-4 h-4 accent-orange-500 rounded" />
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 italic">Italic</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={overlayStroke} onChange={e => setOverlayStroke(e.target.checked)} className="w-4 h-4 accent-orange-500 rounded" />
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Viền chữ</span>
                      </label>
                    </div>

                    {overlayStroke && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Màu viền chữ</label>
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
                          <input type="color" value={overlayStrokeColor} onChange={e => setOverlayStrokeColor(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent" />
                          <input type="text" value={overlayStrokeColor} onChange={e => setOverlayStrokeColor(e.target.value)} className="flex-1 bg-transparent text-xs font-mono focus:outline-none uppercase" maxLength={7} />
                        </div>
                      </div>
                    )}

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <label className="flex items-center gap-2 cursor-pointer mb-3">
                        <input type="checkbox" checked={textBannerEnabled} onChange={e => setTextBannerEnabled(e.target.checked)} className="w-4 h-4 accent-orange-500 rounded" />
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">🏷️ Banner nền chữ</span>
                      </label>
                      {textBannerEnabled && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Màu banner</label>
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
                              <input type="color" value={textBannerColor} onChange={e => setTextBannerColor(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent" />
                              <input type="text" value={textBannerColor} onChange={e => setTextBannerColor(e.target.value)} className="flex-1 bg-transparent text-xs font-mono focus:outline-none uppercase" maxLength={7} />
                            </div>
                          </div>
                          <div>
                            <label className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                              <span>Độ mờ</span><span className="text-orange-500">{Math.round(textBannerOpacity * 100)}%</span>
                            </label>
                            <input type="range" min={20} max={100} value={Math.round(textBannerOpacity * 100)} onChange={e => setTextBannerOpacity(Number(e.target.value) / 100)} className="w-full accent-orange-500" />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeSection === 'decor' && (
              <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">🖼️ Khung viền</label>
                  <div className="grid grid-cols-3 gap-2">
                    {FRAME_STYLES.map(f => (
                      <button key={f.id} onClick={() => setFrameStyle(f.id)} className={`py-2.5 px-2 rounded-xl font-semibold text-sm transition-all ${frameStyle === f.id ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-orange-500/50'}`}>
                        {f.emoji} {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {frameStyle !== 'none' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Màu khung</label>
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
                        <input type="color" value={frameColor} onChange={e => setFrameColor(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent" />
                        <input type="text" value={frameColor} onChange={e => setFrameColor(e.target.value)} className="flex-1 bg-transparent text-xs font-mono focus:outline-none uppercase" maxLength={7} />
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                        <span>Độ dày</span><span className="text-orange-500">{frameWidth}px</span>
                      </label>
                      <input type="range" min={1} max={8} value={frameWidth} onChange={e => setFrameWidth(Number(e.target.value))} className="w-full accent-orange-500" />
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">✨ Sticker 4 góc</label>
                  <div className="grid grid-cols-6 gap-2">
                    {CORNER_STICKERS.map((s, i) => (
                      <button key={i} onClick={() => setCornerSticker(s)} className={`aspect-square rounded-xl text-xl flex items-center justify-center transition-all ${cornerSticker === s ? 'bg-gradient-to-r from-orange-500 to-pink-500 shadow-lg ring-2 ring-orange-500/50' : 'bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-700 hover:border-orange-500/50 hover:scale-110'}`}>
                        {s || '✖'}
                      </button>
                    ))}
                  </div>
                  {cornerSticker && (
                    <div className="mt-3">
                      <label className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                        <span>Cỡ sticker</span><span className="text-orange-500">{cornerStickerSize}px</span>
                      </label>
                      <input type="range" min={14} max={40} value={cornerStickerSize} onChange={e => setCornerStickerSize(Number(e.target.value))} className="w-full accent-orange-500" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'advanced' && (
              <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                    <span>Kích thước QR</span><span className="text-orange-500">{qrSize}px</span>
                  </label>
                  <input type="range" min={150} max={500} value={qrSize} onChange={e => setQrSize(Number(e.target.value))} className="w-full accent-orange-500" />
                </div>
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4">
                  <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                    💡 Error Correction Level luôn ở mức <strong>H (30%)</strong> — đảm bảo QR vẫn quét đúng khi có logo che giữa.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-8 space-y-4">
              <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 text-center">Preview</h3>
                <div className="flex justify-center">
                  <div ref={previewContainerRef} className="relative inline-block" style={{ backgroundColor: bgColor, padding: hasDecor ? 20 : 0 }}>

                    {bgImageSrc && (
                      <img src={bgImageSrc} alt="bg" className="absolute object-cover" style={{ opacity: bgImageOpacity, width: `${bgImageScale}%`, height: `${bgImageScale}%`, top: `${(100 - bgImageScale) / 2}%`, left: `${(100 - bgImageScale) / 2}%`, zIndex: 0 }} />
                    )}

                    {frameStyle !== 'none' && (
                      <div className="absolute" style={{
                        inset: hasDecor ? 15 : 0,
                        border: frameStyle !== 'shadow' ? `${frameWidth}px ${frameStyle === 'dashed' ? 'dashed' : 'solid'} ${frameColor}` : `${frameWidth}px solid ${frameColor}`,
                        borderRadius: frameStyle === 'rounded' ? 16 : 0,
                        boxShadow: frameStyle === 'shadow' ? `4px 4px 12px ${frameColor}` : 'none',
                        outline: frameStyle === 'double' ? `${frameWidth}px solid ${frameColor}` : 'none',
                        outlineOffset: frameStyle === 'double' ? `${frameWidth + 2}px` : '0',
                        zIndex: 1, pointerEvents: 'none',
                      }} />
                    )}

                    {cornerSticker && (
                      <>
                        <span className="absolute" style={{ top: 2, left: 2, fontSize: cornerStickerSize, zIndex: 5 }}>{cornerSticker}</span>
                        <span className="absolute" style={{ top: 2, right: 2, fontSize: cornerStickerSize, zIndex: 5 }}>{cornerSticker}</span>
                        <span className="absolute" style={{ bottom: 2, left: 2, fontSize: cornerStickerSize, zIndex: 5 }}>{cornerSticker}</span>
                        <span className="absolute" style={{ bottom: 2, right: 2, fontSize: cornerStickerSize, zIndex: 5 }}>{cornerSticker}</span>
                      </>
                    )}

                    {topText.trim() && (
                      <div className="relative text-center" style={{ zIndex: 3, marginBottom: 4 }}>
                        {textBannerEnabled && <div className="absolute inset-0" style={{ backgroundColor: textBannerColor, opacity: textBannerOpacity, borderRadius: 4 }} />}
                        <span className="relative inline-block px-2" style={{ fontSize: overlayFontSize, color: overlayColor, fontWeight: overlayBold ? 'bold' : 'normal', fontStyle: overlayItalic ? 'italic' : 'normal', fontFamily: overlayFont, WebkitTextStroke: overlayStroke ? `1px ${overlayStrokeColor}` : 'none' }}>{topText}</span>
                      </div>
                    )}

                    <div className="relative" style={{ zIndex: 2 }}>
                      {text ? (
                        <QRCode ref={qrRef} value={text} size={qrSize} bgColor={bgImageSrc ? 'transparent' : bgColor} fgColor={fgColor} qrStyle={dotStyle} ecLevel="H" eyeColor={eyeColor} eyeRadius={eyeRadius} logoImage={logoSrc} logoWidth={logoWidth} logoHeight={logoHeight} logoPadding={logoPadding} logoPaddingStyle={logoPaddingStyle} removeQrCodeBehindLogo={true} quietZone={10} />
                      ) : (
                        <div className="flex items-center justify-center text-slate-400" style={{ width: qrSize, height: qrSize }}>
                          <p className="text-center text-sm">Nhập nội dung để tạo QR</p>
                        </div>
                      )}
                    </div>

                    {bottomText.trim() && (
                      <div className="relative text-center" style={{ zIndex: 3, marginTop: 4 }}>
                        {textBannerEnabled && <div className="absolute inset-0" style={{ backgroundColor: textBannerColor, opacity: textBannerOpacity, borderRadius: 4 }} />}
                        <span className="relative inline-block px-2" style={{ fontSize: overlayFontSize, color: overlayColor, fontWeight: overlayBold ? 'bold' : 'normal', fontStyle: overlayItalic ? 'italic' : 'normal', fontFamily: overlayFont, WebkitTextStroke: overlayStroke ? `1px ${overlayStrokeColor}` : 'none' }}>{bottomText}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  disabled={!text}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 disabled:shadow-none transition-all disabled:cursor-not-allowed"
                >
                  <Download size={18} />
                  Tải QR (.{downloadFormat})
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowFormatMenu(!showFormatMenu)}
                    className="h-full px-3 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700 rounded-xl hover:border-orange-500/50 transition-all"
                  >
                    <ChevronDown size={16} />
                  </button>
                  {showFormatMenu && (
                    <div className="absolute right-0 bottom-full mb-2 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-10">
                      {(['png', 'jpg', 'webp'] as DownloadFormat[]).map(f => (
                        <button
                          key={f}
                          onClick={() => { setDownloadFormat(f); setShowFormatMenu(false); }}
                          className={`block w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors ${
                            downloadFormat === f ? 'text-orange-500' : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          .{f.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Error Correction: <span className="font-bold text-orange-500">HIGH (30%)</span> • Logo an toàn khi quét
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center text-xs text-slate-400 dark:text-slate-600">
          <p>Powered by <span className="font-bold text-orange-500">ChatDVT Portal</span> • QR Generator v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
