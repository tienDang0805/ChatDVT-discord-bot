import { useState, useEffect } from 'react';

const FEATURES = [
  {
    icon: '🥚', title: 'Ấp Trứng & Nhận Thú',
    desc: 'Bắt đầu hành trình với `/pet start`. AI Gene-Sys sẽ tạo ra sinh vật độc nhất vô nhị với chỉ số, kỹ năng và ảnh chibi 2D được sinh tự động.',
    commands: ['/pet start', '/pet daily_free', '/pet info'],
  },
  {
    icon: '⚔️', title: 'Viễn Chinh Auto-Chain',
    desc: '100 ải từ Rừng Hoang đến Thánh Điện. Gõ 1 lệnh, Bot tự cày liên tục tới khi gục hoặc phá đảo. Quà gộp thành 1 Report duy nhất!',
    commands: ['/expedition fight', '/expedition status', '/expedition claim_afk'],
  },
  {
    icon: '🏰', title: 'Tháp Thử Thách',
    desc: 'Leo 50 tầng tháp với 3 chế độ: Thủ công, Tự Động hoặc ⚡Càn Quét chớp nhoáng. Nhận EXP, Coin và Rương Hiếm.',
    commands: ['/tower'],
  },
  {
    icon: '🤺', title: 'PK Liên Server',
    desc: 'Thách đấu bạn bè hoặc Auto-Match 5 đối thủ ngẫu nhiên. Giới hạn 5 lần/ngày. Traits bị động ảnh hưởng trực tiếp lên trận đấu!',
    commands: ['/pk', '/pk @user'],
  },
  {
    icon: '🧬', title: 'Tiến Hóa AI',
    desc: 'Dùng Đá Tiến Hóa để đột biến sinh vật lên bậc cao hơn (tối đa Bậc 10). AI sinh tên mới, lore mới, ảnh mới và buff Traits!',
    commands: ['/pet evolve'],
  },
  {
    icon: '🏋️', title: 'Huấn Luyện 1 Nút',
    desc: 'Đổi Coin thành EXP trực tiếp. Bot tự mua Đá EXP tối ưu nhất, ăn hết và trả tiền thừa. Level up ngay lập tức!',
    commands: ['/train coin:5000'],
  },
  {
    icon: '🛒', title: 'Cửa Hàng & Kho Đồ',
    desc: 'Mua bán vật phẩm, đá thuộc tính, trứng hiếm. Dùng lệnh use với option use_all để xả hàng loạt!',
    commands: ['/shop', '/buy', '/use', '/sell', '/inventory'],
  },
  {
    icon: '🏆', title: 'Bảng Xếp Hạng & Phần Thưởng',
    desc: '5 bảng xếp hạng: Tài sản, Level, Tiến Hóa, Viễn Chinh, Tháp. Top 10 nhận thưởng mỗi Thứ 6!',
    commands: ['/rank', '/claim_rank'],
  },
  {
    icon: '☀️', title: 'Nhận Quà Trọn Gói 1 Lệnh',
    desc: 'Gộp Daily + AFK Viễn Chinh vào đúng 1 lệnh duy nhất. Sáng ngủ dậy gõ 1 phát lấy hết quà.',
    commands: ['/claim_all'],
  },
  {
    icon: '📊', title: 'Tổng Quan Nhanh',
    desc: 'Xem toàn bộ tiến trình chỉ 1 lệnh: Level, Coin, Stats, Traits, Ải Viễn Chinh, Tháp, PK còn bao nhiêu lượt.',
    commands: ['/status'],
  },
];

const RARITIES = [
  { name: 'Normal', color: '#808080', chance: '50%', icon: '⚪' },
  { name: 'Magic', color: '#3B82F6', chance: '30%', icon: '🔵' },
  { name: 'Rare', color: '#EAB308', chance: '15%', icon: '🟡' },
  { name: 'Unique', color: '#A855F7', chance: '4%', icon: '🟣' },
  { name: 'Legend', color: '#F97316', chance: '1%', icon: '🟠' },
];

const TRAITS = [
  { type: 'crit', name: 'Bạo Kích', desc: 'Tăng tỷ lệ chí mạng', icon: '⚡' },
  { type: 'dodge', name: 'Né Tránh', desc: 'Tăng tỷ lệ né đòn', icon: '💨' },
  { type: 'hp_regen', name: 'Hồi Máu', desc: 'Hồi HP mỗi lượt', icon: '💚' },
  { type: 'atk_boost', name: 'Tăng Sát Thương', desc: 'Tăng % dame', icon: '🔥' },
  { type: 'def_boost', name: 'Tăng Phòng Thủ', desc: 'Giảm % dame nhận vào', icon: '🛡️' },
];

const QUICK_START_STEPS = [
  { step: 1, cmd: '/pet start', desc: 'Chọn 1 trong 3 trứng ngẫu nhiên để bắt đầu.' },
  { step: 2, cmd: '/pet info', desc: 'Xem chỉ số, skill và traits của thú cưng.' },
  { step: 3, cmd: '/expedition fight', desc: 'Bắt đầu cày ải nhận EXP và Coin.' },
  { step: 4, cmd: '/train coin:2000', desc: 'Dùng coin cày được để tăng cấp nhanh.' },
  { step: 5, cmd: '/pet evolve', desc: 'Đủ level? Mua Đá Tiến Hóa và tiến hóa!' },
  { step: 6, cmd: '/pk', desc: 'Thách đấu PK để khẳng định sức mạnh!' },
];

export function PetLandingPage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    // Đảm bảo nút back của trình duyệt luôn về /chatDVT nếu là entry đầu
    if (window.history.length <= 2) {
      window.history.replaceState(null, '', '/chatDVT');
      window.history.pushState(null, '', window.location.pathname);
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white overflow-x-hidden" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-[#0a0a1a]/90 backdrop-blur-xl shadow-2xl shadow-purple-900/10' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐾</span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">EvoVerse</span>
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-medium">Beta 1.0</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Tính Năng</a>
            <a href="#traits" className="text-sm text-gray-400 hover:text-white transition-colors">Hệ Thống</a>
            <a href="#quickstart" className="text-sm text-gray-400 hover:text-white transition-colors">Bắt Đầu</a>
            <a href="#commands" className="text-sm text-gray-400 hover:text-white transition-colors">Lệnh</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-300">Đang hoạt động trên Discord</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">EvoVerse</span>
            <br />
            <span className="text-white/90 text-3xl md:text-5xl font-light">Pet RPG on Discord</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Ấp trứng. Nuôi thú. Tiến hóa AI. Đánh Boss. PK liên server.
            <br className="hidden md:block" />
            Tất cả chỉ với <span className="text-purple-400 font-semibold">1 nút bấm</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://discord.com" target="_blank" rel="noreferrer"
               className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-purple-600/25 hover:shadow-purple-500/40 hover:scale-105">
              <svg width="24" height="24" viewBox="0 0 71 55" fill="currentColor"><path d="M60.1 4.9A58.5 58.5 0 0 0 45.4.2a.2.2 0 0 0-.2.1 40.8 40.8 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0A37.5 37.5 0 0 0 25.4.3a.2.2 0 0 0-.2-.1A58.4 58.4 0 0 0 10.6 4.9a.2.2 0 0 0-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.7 58.7 0 0 0 17.9 9a.2.2 0 0 0 .3-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.9a.2.2 0 0 1 .2 0 41.9 41.9 0 0 0 35.6 0 .2.2 0 0 1 .2 0l1.1.9a.2.2 0 0 1 0 .4 36.4 36.4 0 0 1-5.5 2.6.2.2 0 0 0-.1.3 47.2 47.2 0 0 0 3.6 5.9.2.2 0 0 0 .3.1 58.5 58.5 0 0 0 17.9-9v-.1c1.4-15-2.3-28-9.8-39.6a.2.2 0 0 0 0-.1zM23.7 37.3c-3.4 0-6.3-3.2-6.3-7s2.8-7 6.3-7 6.4 3.2 6.3 7-2.8 7-6.3 7zm23.3 0c-3.4 0-6.3-3.2-6.3-7s2.8-7 6.3-7 6.4 3.2 6.3 7-2.8 7-6.3 7z"/></svg>
              Thêm Bot vào Server
            </a>
            <a href="#quickstart"
               className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105">
              📖 Hướng Dẫn Nhanh
            </a>
          </div>

          <div className="flex justify-center gap-8 mt-16 text-center">
            {[
              { val: '100', label: 'Ải Viễn Chinh' },
              { val: '5', label: 'Loại Traits' },
              { val: '10', label: 'Bậc Tiến Hóa' },
              { val: '∞', label: 'Sinh Vật AI' },
            ].map((s, i) => (
              <div key={i} className="group">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">{s.val}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Tính Năng <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Siêu Cấp</span></h2>
            <p className="text-gray-500">Mọi thứ được thiết kế cho trải nghiệm 1-nút tối giản.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i}
                   onMouseEnter={() => setActiveFeature(i)}
                   className={`group relative p-6 rounded-2xl border transition-all duration-500 cursor-pointer ${activeFeature === i ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/30 scale-[1.02]' : 'bg-white/[0.02] border-white/[0.05] hover:border-white/10'}`}>
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{f.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-2 text-white">{f.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-3">{f.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {f.commands.map((cmd, ci) => (
                        <code key={ci} className="text-xs bg-black/40 text-purple-300 px-2 py-1 rounded-lg font-mono border border-purple-500/20">{cmd}</code>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRAITS */}
      <section id="traits" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Hệ Thống <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Chiến Đấu</span></h2>
            <p className="text-gray-500">AI sinh ra các Traits bị động ảnh hưởng trực tiếp lên chiến trường.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Rarity */}
            <div>
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-sm">✦</span>
                Độ Hiếm
              </h3>
              <div className="space-y-3">
                {RARITIES.map((r, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all">
                    <span className="text-2xl">{r.icon}</span>
                    <span className="font-semibold flex-1" style={{ color: r.color }}>{r.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: r.chance, backgroundColor: r.color }} />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{r.chance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Traits */}
            <div>
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-sm">🔮</span>
                Nội Tại (Traits)
              </h3>
              <div className="space-y-3">
                {TRAITS.map((t, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-orange-500/20 transition-all group">
                    <span className="text-2xl group-hover:scale-125 transition-transform">{t.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-white">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.desc}</div>
                    </div>
                    <code className="text-xs text-orange-400/60 font-mono">{t.type}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Combat Formula */}
          <div className="mt-16 p-6 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/10">
            <h4 className="font-semibold mb-3 text-indigo-300">⚙️ Công Thức Chiến Đấu</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-400">
              <div className="p-3 bg-black/30 rounded-xl"><code className="text-indigo-300">Damage</code> = (ATK × Skill Power) / 20 × (1 + atk_boost)</div>
              <div className="p-3 bg-black/30 rounded-xl"><code className="text-indigo-300">Defense</code> = DEF × (1 + def_boost) / (DEF + 150)</div>
              <div className="p-3 bg-black/30 rounded-xl"><code className="text-indigo-300">Crit</code> = 8% + SPD × 0.08% + crit_bonus</div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK START */}
      <section id="quickstart" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Bắt Đầu trong <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">5 Phút</span></h2>
            <p className="text-gray-500">Hướng dẫn nhanh cho tân thủ.</p>
          </div>

          <div className="space-y-4">
            {QUICK_START_STEPS.map((s, i) => (
              <div key={i} className="group flex items-start gap-6 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-green-500/20 transition-all">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 group-hover:scale-110 transition-transform">
                  {s.step}
                </div>
                <div className="flex-1">
                  <code className="text-sm bg-green-500/10 text-green-400 px-3 py-1 rounded-lg font-mono border border-green-500/20">{s.cmd}</code>
                  <p className="text-sm text-gray-400 mt-2">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ALL COMMANDS */}
      <section id="commands" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-900/5 to-transparent" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Toàn Bộ <span className="bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">Lệnh</span></h2>
            <p className="text-gray-500">Danh sách lệnh slash đầy đủ.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { cat: '🐾 Thú Cưng', cmds: ['/pet start — Ấp trứng thú mới', '/pet info — Xem thông tin thú', '/pet evolve — Tiến hóa', '/pet daily_free — Gacha miễn phí mỗi ngày'] },
              { cat: '⚔️ Chiến Đấu', cmds: ['/expedition fight — Cày ải tự động', '/expedition status — Tiến trình', '/expedition claim_afk — Nhận quà AFK', '/tower — Leo tháp thử thách', '/pk — PK người chơi / Auto Match'] },
              { cat: '💰 Kinh Tế', cmds: ['/shop — Xem cửa hàng', '/buy <id> — Mua vật phẩm', '/sell <id> — Bán vật phẩm', '/use <id> — Dùng item (use_all)', '/train coin:<số> — Đổi xu lấy EXP', '/inventory — Xem kho đồ'] },
              { cat: '🏆 Xã Hội', cmds: ['/rank — Bảng xếp hạng', '/claim_rank — Nhận thưởng Thứ 6', '/daily — Điểm danh hàng ngày', '/claim_all — Nhận trọn quà 1 nút', '/status — Tổng quan nhanh'] },
              { cat: '🎮 Mini-Game', cmds: ['/quiz — Trả lời câu đố', '/ctw — Catch The Word', '/grind — Cày nhiệm vụ'] },
              { cat: '⚙️ Cá Nhân', cmds: ['/identity — Cập nhật biệt danh', '/help — Xem trợ giúp'] },
            ].map((group, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <h4 className="font-semibold mb-3 text-white">{group.cat}</h4>
                <div className="space-y-2">
                  {group.cmds.map((c, ci) => {
                    const [cmd, ...descParts] = c.split(' — ');
                    return (
                      <div key={ci} className="flex items-start gap-2 text-sm">
                        <code className="text-purple-400 font-mono whitespace-nowrap">{cmd}</code>
                        {descParts.length > 0 && <span className="text-gray-500">— {descParts.join(' — ')}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-orange-500/10 border border-purple-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(168,85,247,0.15),_transparent_60%)]" />
            <div className="relative">
              <h2 className="text-4xl font-bold mb-4">Sẵn sàng phiêu lưu?</h2>
              <p className="text-gray-400 mb-8">Thêm bot vào server Discord và bắt đầu hành trình nuôi thú huyền bí ngay hôm nay!</p>
              <a href="https://discord.com" target="_blank" rel="noreferrer"
                 className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-10 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-purple-600/25 hover:shadow-purple-500/40 hover:scale-105">
                🚀 Bắt Đầu Ngay
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <span className="font-semibold text-sm bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">EvoVerse</span>
            <span className="text-xs text-gray-600">Beta 1.0</span>
          </div>
          <p className="text-xs text-gray-600">© 2024 EvoVerse Pet RPG. Powered by AI & Discord.js</p>
        </div>
      </footer>
    </div>
  );
}
