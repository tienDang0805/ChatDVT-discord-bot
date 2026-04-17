import { useState, useEffect, useRef } from 'react';
import api from '../api';

const MESSENGER_ID = '100006665862022';

function openMessenger(text?: string) {
  const deepLink = `fb-messenger://user-thread/${MESSENGER_ID}`;
  const fallback = text
    ? `https://m.me/${MESSENGER_ID}?text=${encodeURIComponent(text)}`
    : `https://m.me/${MESSENGER_ID}`;
  const start = Date.now();
  window.location.href = deepLink;
  setTimeout(() => {
    if (Date.now() - start < 2500) {
      window.location.href = fallback;
    }
  }, 1500);
}

const GALLERY_PHOTOS = [
  { id: 1, src: 'https://lh3.googleusercontent.com/d/1K4mHuS7nleGtukGNCK-X5zLyEuwvAR0M' },
  { id: 2, src: 'https://lh3.googleusercontent.com/d/1Oss22ujYRFMumfh5Z10AA4gH5ITzwzus' },
  { id: 3, src: 'https://lh3.googleusercontent.com/d/1_ar_0sazttbF-BES-kAldq5E6Hy8onGO' },
  { id: 4, src: 'https://lh3.googleusercontent.com/d/1-B22OAV5jxd2-MtDPJmUGqmrlFSA8qSV' },
  { id: 5, src: 'https://lh3.googleusercontent.com/d/16i2ld_YfXUvEyqXeFJqGrP4XiUC0UHyy' },
];

type BotInfo = { avatar: string; globalName?: string; username?: string };
type Msg = { id: number; from: 'bot' | 'user' | 'system'; text: string; delay: number };

function preloadConfetti() {
  if (!(window as any).__confettiLoaded) {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
    s.onload = () => { (window as any).__confettiLoaded = true; };
    document.head.appendChild(s);
  }
}

function useBotInfo() {
  const [info, setInfo] = useState<BotInfo>({ avatar: '', globalName: 'ChatDVT' });
  useEffect(() => { api.get('/bot-info').then(r => r.data && setInfo(r.data)).catch(() => {}); }, []);
  return { avatar: info.avatar, name: info.globalName || info.username || 'ChatDVT' };
}

function fireConfetti(duration = 3000) {
  const doFire = () => {
    const c = (window as any).confetti;
    if (!c) return;
    const end = Date.now() + duration;
    const colors = ['#ff0a54','#ff477e','#ff85a1','#fbb1bd','#a78bfa','#fbbf24','#34d399'];
    (function f() {
      c({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
      c({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
      if (Date.now() < end) requestAnimationFrame(f);
    })();
    c({ particleCount: 120, spread: 100, origin: { y: 0.5 }, colors });
  };
  if ((window as any).__confettiLoaded) { doFire(); } else {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
    s.onload = () => { (window as any).__confettiLoaded = true; doFire(); };
    document.head.appendChild(s);
  }
}

function Dots({ avatar }: { avatar: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 16px' }}>
      <img src={avatar} alt="" style={{ width:28, height:28, borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(255,255,255,0.1)' }} />
      <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:'18px 18px 18px 4px', padding:'10px 16px', display:'flex', gap:5 }}>
        {[0,1,2].map(i=><div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'#71717a', animation:`blink 1.4s ${i*0.2}s infinite` }} />)}
      </div>
    </div>
  );
}

function Bot({ text, avatar, anim }: { text: string; avatar: string; anim?: boolean }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:8, padding:'3px 16px', animation: anim ? 'pop .4s cubic-bezier(.34,1.56,.64,1)' : 'none', maxWidth:'100%' }}>
      <img src={avatar} alt="" style={{ width:28, height:28, borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(255,255,255,0.1)', flexShrink:0 }} />
      <div style={{ background:'rgba(255,255,255,0.08)', backdropFilter:'blur(16px)', borderRadius:'18px 18px 18px 4px', padding:'10px 14px', color:'#e4e4e7', fontSize:'clamp(13px,3.5vw,15px)', lineHeight:1.6, maxWidth:'calc(100% - 44px)', border:'1px solid rgba(255,255,255,0.06)', wordBreak:'break-word' }} dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  );
}

function Me({ text, anim }: { text: string; anim?: boolean }) {
  return (
    <div style={{ display:'flex', justifyContent:'flex-end', padding:'3px 16px', animation: anim ? 'pop .3s ease-out':'none' }}>
      <div style={{ background:'linear-gradient(135deg,#3b82f6,#2563eb)', borderRadius:'18px 18px 4px 18px', padding:'10px 14px', color:'#fff', fontSize:'clamp(13px,3.5vw,15px)', lineHeight:1.6, maxWidth:'80%' }}>{text}</div>
    </div>
  );
}

function Sys({ text, anim }: { text: string; anim?: boolean }) {
  return (
    <div style={{ display:'flex', justifyContent:'center', padding:'6px 16px', animation: anim ? 'fade .5s':'none' }}>
      <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:20, padding:'4px 14px', color:'#52525b', fontSize:'clamp(10px,2.5vw,11px)', fontFamily:'monospace' }}>{text}</div>
    </div>
  );
}

function Header({ avatar, name }: { avatar: string; name: string }) {
  return (
    <div style={{ position:'sticky', top:0, zIndex:20, background:'rgba(9,9,11,0.85)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'10px 16px', display:'flex', alignItems:'center', gap:12 }}>
      <div style={{ position:'relative' }}>
        <img src={avatar} alt={name} style={{ width:40, height:40, borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(255,255,255,0.1)' }} />
        <div style={{ position:'absolute', bottom:0, right:0, width:12, height:12, borderRadius:'50%', background:'#22c55e', border:'2px solid #09090b', boxShadow:'0 0 6px rgba(34,197,94,.6)' }} />
      </div>
      <div>
        <div style={{ color:'#fff', fontWeight:700, fontSize:'clamp(15px,3.5vw,16px)', display:'flex', alignItems:'center', gap:6 }}>
          {name}
          <span style={{ background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', borderRadius:4, padding:'1px 5px', fontSize:9, fontWeight:700, color:'#fff' }}>BOT</span>
        </div>
        <div style={{ color:'#22c55e', fontSize:'clamp(10px,2.5vw,11px)', fontWeight:500 }}>online — trợ lý của anh Tiến</div>
      </div>
    </div>
  );
}

function Toast({ text, onClose }: { text: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:999, padding:'16px', display:'flex', justifyContent:'center', animation:'slideUp .4s ease-out', pointerEvents:'none' }}>
      <div onClick={onClose} style={{ background:'rgba(239,68,68,.15)', backdropFilter:'blur(20px)', border:'1px solid rgba(239,68,68,.3)', borderRadius:14, padding:'14px 20px', color:'#fca5a5', fontSize:'clamp(13px,3.5vw,15px)', fontWeight:600, maxWidth:360, textAlign:'center', pointerEvents:'auto', cursor:'pointer', boxShadow:'0 8px 30px rgba(0,0,0,.3)' }}>
        {text}
      </div>
    </div>
  );
}

function ChatPhase({ avatar, botName, onDone }: { avatar: string; botName: string; onDone: () => void }) {
  const [msgs, setMsgs] = useState<{m:Msg; v:boolean}[]>([]);
  const [typing, setTyping] = useState(true);
  const [btns, setBtns] = useState(false);
  const [done, setDone] = useState(false);
  const [toast, setToast] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const script: Msg[] = [
    { id:0, from:'system', text:'🔐 Kênh bí mật — đã kết nối', delay:700 },
    { id:1, from:'bot', text:`Ê! 👋 Em là <b>${botName}</b>, con bot của anh Tiến nè.`, delay:1100 },
    { id:2, from:'bot', text:'Anh Tiến hôm nay biểu em đi giao hàng nè, duma biến em thành <b>shipper</b> 📦', delay:1400 },
    { id:3, from:'bot', text:'Ảnh bảo: <i>"Ngày <b>21/4</b> quan trọng lắm, mày ship cho đúng hẹn, đừng có tào lao!"</i> 😤', delay:1300 },
    { id:4, from:'bot', text:'Em hỏi: <i>"Quan trọng cỡ nào?"</i> — Ảnh trả lời: <i>"Quan trọng hơn cả deploy production đó!"</i> 😱', delay:1200 },
    { id:5, from:'system', text:'📡 Scanning... tìm thấy 1 mục tiêu đang cắm mặt vào điện thoại', delay:900 },
    { id:6, from:'bot', text:'Khoan, em hỏi chút: <b>Chị có phải là người đọc được thiệp của anh Tiến không?</b> 🤔', delay:1200 },
    { id:7, from:'bot', text:'Vì lỡ giao nhầm là ảnh <b>chửi em</b> lắm á 😭', delay:800 },
    { id:8, from:'bot', text:'(mà thật ra cũng hơi tò mò bên trong có gì, ảnh cấm em xem 🙄)', delay:900 },
  ];

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let t = 400;
    script.forEach((m, i) => {
      const t1 = t, t2 = t1 + 600 + Math.random() * 400;
      setTimeout(() => setTyping(true), t1);
      setTimeout(() => {
        setTyping(false);
        setMsgs(p => [...p, { m, v:true }]);
        if (i === script.length - 1) setTimeout(() => setBtns(true), 400);
      }, t2);
      t = t2 + m.delay;
    });
  }, []);

  useEffect(() => { ref.current && (ref.current.scrollTop = ref.current.scrollHeight); }, [msgs, typing]);

  const confirm = () => {
    if (done) return;
    setDone(true);
    setBtns(false);
    setMsgs(p => [...p, { m:{ id:50, from:'user', text:'Ừa đúng tao nè! Đưa đây mau! 😎', delay:0 }, v:true }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(p => [...p, { m:{ id:51, from:'bot', text:'Hmm để em verify chút... 🧐', delay:0 }, v:true }]);
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMsgs(p => [...p, { m:{ id:52, from:'system', text:'🔍 Xác minh danh tính... IP check... vân tay... mùi hương nước hoa...', delay:0 }, v:true }]);
        setTimeout(() => {
          setMsgs(p => [...p, { m:{ id:53, from:'system', text:'✅ Kết quả: 99.9% là Huyền (0.1% còn lại là do wifi lag)', delay:0 }, v:true }]);
          setTyping(true);
          setTimeout(() => {
            setTyping(false);
            setMsgs(p => [...p, { m:{ id:54, from:'bot', text:'Ok chị Huyền rồi! 😂 Anh Tiến dặn dò: <i>"Đưa cho chị ấy cẩn thận, đừng có làm xước!"</i>', delay:0 }, v:true }]);
            setTimeout(() => {
              setMsgs(p => [...p, { m:{ id:55, from:'bot', text:'Ship tận tay luôn nè! Mở ra xem đi chị ơi 📦✨', delay:0 }, v:true }]);
              setTimeout(() => {
                setMsgs(p => [...p, { m:{ id:56, from:'system', text:'🚀 Chuyển sang chế độ Unbox...', delay:0 }, v:true }]);
                setTimeout(onDone, 1200);
              }, 800);
            }, 1000);
          }, 900);
        }, 1200);
      }, 1000);
    }, 900);
  };

  return (
    <>
      <div ref={ref} style={{ flex:1, overflowY:'auto', paddingTop:8, paddingBottom: btns ? 160 : 20, display:'flex', flexDirection:'column', gap:4 }}>
        {msgs.map(({m}) => m.from==='system' ? <Sys key={m.id} text={m.text} anim /> : m.from==='bot' ? <Bot key={m.id} text={m.text} avatar={avatar} anim /> : <Me key={m.id} text={m.text} anim />)}
        {typing && <Dots avatar={avatar} />}
      </div>
      {btns && (
        <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'16px 16px calc(env(safe-area-inset-bottom,12px) + 12px)', background:'linear-gradient(transparent,#09090b 40%)', display:'flex', flexDirection:'column', gap:10, alignItems:'center', animation:'slideUp .5s ease-out' }}>
          <button onClick={confirm} style={{ width:'100%', maxWidth:380, padding:'15px', background:'linear-gradient(135deg,#3b82f6,#2563eb)', color:'#fff', border:'none', borderRadius:14, fontSize:'clamp(14px,3.5vw,15px)', fontWeight:700, cursor:'pointer', boxShadow:'0 6px 20px rgba(37,99,235,.4)' }}>
            Ừa đúng tao nè! Đưa đây mau! 😎
          </button>
          <button onClick={() => setToast(true)} style={{ width:'100%', maxWidth:380, padding:'12px', background:'rgba(255,255,255,.05)', color:'#71717a', border:'1px solid rgba(255,255,255,.08)', borderRadius:12, fontSize:'clamp(12px,3vw,13px)', fontWeight:600, cursor:'pointer' }}>
            Hông phải, tao lượm được link 🫣
          </button>
        </div>
      )}
      {toast && <Toast text="Chắc chắn là Huyền rồi mà, đừng có chối! Nhận đi chị! 😤💖" onClose={() => setToast(false)} />}
    </>
  );
}

function UnboxPhase({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [boom, setBoom] = useState(false);
  const [particles, setParticles] = useState<{id:number;x:number;y:number;s:number;d:number}[]>([]);
  const holdRef = useRef<any>(null);
  const decayRef = useRef<any>(null);

  const start = () => {
    if (boom) return;
    setHolding(true);
    clearInterval(decayRef.current);
    holdRef.current = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(holdRef.current); explode(); return 100; } return p + 1.2; });
    }, 25);
  };

  const stop = () => {
    if (boom) return;
    setHolding(false);
    clearInterval(holdRef.current);
    decayRef.current = setInterval(() => {
      setProgress(p => { if (p <= 0) { clearInterval(decayRef.current); return 0; } return p - 1.5; });
    }, 25);
  };

  const explode = () => {
    if (boom) return;
    setBoom(true);
    setHolding(false);
    fireConfetti(4000);
    const ps = Array.from({ length: 20 }, (_, i) => ({
      id: i, x: Math.random() * 300 - 150, y: Math.random() * 300 - 150,
      s: Math.random() * 20 + 10, d: Math.random() * 500,
    }));
    setParticles(ps);
    setTimeout(onDone, 2000);
  };

  useEffect(() => () => { clearInterval(holdRef.current); clearInterval(decayRef.current); }, []);

  const emojis = ['✨','🎉','🎊','💫','⭐','🌟','💖','🎁'];
  const sc = 1 + (progress / 100) * .25;
  const shake = holding && progress > 40;

  return (
    <div style={{ position:'absolute', inset:0, background:'#09090b', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', overflow:'hidden', userSelect:'none', WebkitUserSelect:'none', touchAction:'manipulation' }}>
      <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle at 50% 50%, rgba(236,72,153,${progress/500}) 0%, transparent 60%)`, transition:'all .3s', pointerEvents:'none' }} />

      {boom && particles.map(p => (
        <div key={p.id} style={{
          position:'absolute', top:'50%', left:'50%', fontSize: p.s,
          animation: `particleOut 1s ${p.d}ms ease-out forwards`,
          transform: `translate(${p.x}px, ${p.y}px)`,
          pointerEvents:'none', zIndex:5,
        }}>{emojis[p.id % emojis.length]}</div>
      ))}

      <div style={{ textAlign:'center', zIndex:10, marginBottom:40, animation:'fade .6s ease-out' }}>
        <h2 style={{ fontSize:'clamp(20px,5vw,26px)', fontWeight:800, background:'linear-gradient(135deg,#f472b6,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:6 }}>
          Có quà nè!
        </h2>
        <p style={{ color:'#71717a', fontSize:'clamp(12px,3vw,14px)' }}>Nhấn <strong style={{color:'#d4d4d8'}}>giữ chặt</strong> hộp quà để mở</p>
      </div>

      <div style={{ position:'relative', zIndex:10 }}>
        <svg width="200" height="200" style={{ position:'absolute', top:-25, left:-25, pointerEvents:'none', transform:`scale(${sc})`, transition:'transform .1s' }}>
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="4" />
          <circle cx="100" cy="100" r="90" fill="none" stroke="url(#pg)" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={565} strokeDashoffset={565 - (progress / 100) * 565}
            style={{ transition:'stroke-dashoffset 50ms' }} transform="rotate(-90 100 100)" />
          <defs><linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ec4899"/><stop offset="100%" stopColor="#8b5cf6"/></linearGradient></defs>
        </svg>

        <button
          onMouseDown={start} onMouseUp={stop} onMouseLeave={stop}
          onTouchStart={e => { e.preventDefault(); start(); }} onTouchEnd={stop}
          style={{
            width:150, height:150, borderRadius:28, background:'rgba(255,255,255,.05)', border:'2px solid rgba(255,255,255,.1)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:70,
            cursor:'pointer', outline:'none', position:'relative',
            transform: `scale(${boom ? 1.8 : sc})`, opacity: boom ? 0 : 1,
            transition: boom ? 'all .5s ease-out' : 'transform .1s',
            animation: shake ? `wiggle ${progress > 70 ? '.15s' : '.3s'} infinite` : 'bob 3s ease-in-out infinite',
            filter: `drop-shadow(0 0 ${progress/3}px rgba(236,72,153,.6))`,
            userSelect:'none', WebkitUserSelect:'none', WebkitTapHighlightColor:'transparent',
            WebkitTouchCallout:'none', touchAction:'none',
          }}
        >
          🎁
          <div style={{ position:'absolute', inset:0, borderRadius:28, background:'linear-gradient(135deg,rgba(236,72,153,.15),rgba(139,92,246,.15))', opacity: holding ? 1 : 0, transition:'opacity .3s' }} />
        </button>
      </div>

      <div style={{ position:'absolute', bottom:'clamp(40px,10vh,80px)', width:'clamp(150px,40vw,200px)', height:6, background:'rgba(255,255,255,.05)', borderRadius:3, overflow:'hidden', zIndex:10, opacity: boom ? 0 : 1, transition:'opacity .3s' }}>
        <div style={{ height:'100%', background:'linear-gradient(90deg,#ec4899,#8b5cf6)', borderRadius:3, transition:'width 50ms', width:`${progress}%` }} />
      </div>
    </div>
  );
}

function GalleryPhase({ onDone }: { onDone: () => void }) {
  const [show, setShow] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number|null>(null);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
    fireConfetti(2000);
  }, []);

  return (
    <div style={{ position:'absolute', inset:0, background:'#09090b', overflowY:'auto', overflowX:'hidden' }}>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'-20%', left:'-20%', width:'60%', height:'60%', borderRadius:'50%', background:'rgba(236,72,153,.08)', filter:'blur(80px)' }} />
        <div style={{ position:'absolute', bottom:'-20%', right:'-20%', width:'60%', height:'60%', borderRadius:'50%', background:'rgba(139,92,246,.08)', filter:'blur(80px)' }} />
      </div>

      <div style={{ position:'relative', zIndex:10, maxWidth:500, margin:'0 auto', padding:'clamp(24px,6vw,40px) 16px' }}>
        <div style={{ textAlign:'center', marginBottom:32, animation: show ? 'slideUp .8s ease-out' : 'none', opacity: show ? 1 : 0 }}>
          <div style={{ fontSize:'clamp(40px,10vw,56px)', marginBottom:8, animation:'bob 3s ease-in-out infinite' }}>📸</div>
          <h2 style={{ fontSize:'clamp(22px,6vw,30px)', fontWeight:800, background:'linear-gradient(135deg,#f9a8d4,#c4b5fd,#93c5fd)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:8 }}>
            Nhật Ký Kỷ Niệm
          </h2>
          <p style={{ color:'#71717a', fontSize:'clamp(12px,3vw,14px)' }}>Em chỉ tìm được mấy hình này thôi, hơi dìm đừng khóc nhé 😜</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'clamp(8px,2vw,12px)', marginBottom:32 }}>
          {GALLERY_PHOTOS.map((photo, i) => (
            <div
              key={photo.id}
              onClick={() => setActiveIdx(activeIdx === i ? null : i)}
              style={{
                position:'relative', borderRadius:16, overflow:'hidden', cursor:'pointer',
                aspectRatio: i === 0 || i === 5 ? '1/1.2' : '1/1',
                gridRow: i === 0 ? 'span 2' : undefined,
                animation: show ? `scaleUp .6s ${i * 100}ms ease-out both` : 'none',
                border: '1px solid rgba(255,255,255,.08)',
                transform: activeIdx === i ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform .3s cubic-bezier(.34,1.56,.64,1)',
                boxShadow: activeIdx === i ? '0 12px 40px rgba(0,0,0,.5)' : '0 4px 12px rgba(0,0,0,.3)',
                zIndex: activeIdx === i ? 5 : 1,
              }}
            >
              <img src={photo.src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(transparent 60%, rgba(0,0,0,.5))' }} />
            </div>
          ))}
        </div>

        <div style={{ display:'flex', justifyContent:'center', animation: show ? 'slideUp 1s .6s ease-out both' : 'none' }}>
          <button
            onClick={onDone}
            style={{
              padding:'16px 40px', background:'linear-gradient(135deg,#ec4899,#8b5cf6)', color:'#fff',
              border:'none', borderRadius:16, fontSize:'clamp(14px,3.5vw,16px)', fontWeight:700,
              cursor:'pointer', boxShadow:'0 8px 30px rgba(236,72,153,.35)',
              animation:'pulse 2s ease-in-out infinite',
            }}
          >
            Xem lời chúc từ anh Tiến 💌
          </button>
        </div>
      </div>

      {activeIdx !== null && (
        <div onClick={() => setActiveIdx(null)} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.85)', backdropFilter:'blur(20px)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:20,
          animation:'fade .3s ease-out',
        }}>
          <div style={{ maxWidth:500, maxHeight:'80vh', borderRadius:16, overflow:'hidden', animation:'scaleUp .4s cubic-bezier(.34,1.56,.64,1)', boxShadow:'0 20px 60px rgba(0,0,0,.5)' }}>
            <img src={GALLERY_PHOTOS[activeIdx].src} alt="" style={{ width:'100%', height:'100%', objectFit:'contain', display:'block' }} />
          </div>
        </div>
      )}
    </div>
  );
}

function FloatingParticles() {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    dur: 6 + Math.random() * 8,
    size: 2 + Math.random() * 4,
    emoji: ['✨','⭐','💫','🌟','·'][i % 5],
  }));
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:1, overflow:'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position:'absolute', left:`${p.left}%`, bottom:'-5%',
          fontSize: p.emoji === '·' ? p.size * 3 : p.size + 6,
          opacity: p.emoji === '·' ? 0.3 : 0.15,
          animation: `floatUp ${p.dur}s ${p.delay}s linear infinite`,
        }}>{p.emoji}</div>
      ))}
    </div>
  );
}

function useTypewriter(text: string, speed = 40, enabled = true) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    setDisplayed('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, enabled]);
  return { displayed, done };
}

function WishPhase() {
  const [show, setShow] = useState(false);
  const [cakeTaps, setCakeTaps] = useState(0);
  const [easterEgg, setEasterEgg] = useState(false);
  const [startTyping, setStartTyping] = useState(false);
  const wish1 = useTypewriter('Sinh nhật 27 tuổi vui vẻ nha! 🥳', 50, startTyping);
  const wish2 = useTypewriter('Donate Khầy 30k ăn hủ tiếu nhé nhé lelele 🍜', 45, wish1.done);
  const wish3 = useTypewriter('Tuổi mới hi vọng chúc m bớt khó tính nhoa 😜 — khó tính là khen á không phải chê đâu nha!', 30, wish2.done);

  useEffect(() => {
    setTimeout(() => setShow(true), 200);
    setTimeout(() => setStartTyping(true), 1200);
    fireConfetti(6000);
  }, []);

  return (
    <div style={{ position:'absolute', inset:0, background:'#09090b', overflowY:'auto', overflowX:'hidden' }}>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'-15%', left:'-15%', width:'50%', height:'50%', borderRadius:'50%', background:'rgba(251,191,36,.1)', filter:'blur(100px)' }} />
        <div style={{ position:'absolute', bottom:'-15%', right:'-15%', width:'50%', height:'50%', borderRadius:'50%', background:'rgba(236,72,153,.1)', filter:'blur(100px)' }} />
        <div style={{ position:'absolute', top:'30%', right:'-10%', width:'35%', height:'35%', borderRadius:'50%', background:'rgba(139,92,246,.08)', filter:'blur(80px)' }} />
      </div>

      <div style={{ position:'relative', zIndex:10, maxWidth:480, margin:'0 auto', padding:'clamp(32px,8vw,60px) 16px', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{ animation: show ? 'slideUp .8s ease-out' : 'none', opacity: show ? 1 : 0, width:'100%' }}>
          <div style={{ textAlign:'center', marginBottom:12 }}>
            <div
              onClick={() => {
                const n = cakeTaps + 1;
                setCakeTaps(n);
                if (n >= 7 && !easterEgg) { setEasterEgg(true); fireConfetti(3000); }
              }}
              style={{ fontSize:'clamp(50px,14vw,72px)', animation:'bob 4s ease-in-out infinite', marginBottom:8, cursor:'pointer', transition:'transform .1s', transform: cakeTaps > 0 ? `scale(${1 + cakeTaps * 0.03})` : 'scale(1)' }}
            >🎂</div>
            <div style={{
              fontSize:'clamp(11px,2.5vw,13px)', color:'#a1a1aa', fontFamily:'monospace',
              background:'rgba(255,255,255,.05)', display:'inline-block', padding:'4px 12px', borderRadius:20,
              border:'1px solid rgba(255,255,255,.08)', marginBottom:16,
            }}>
              v27.0 — 21/04 Birthday Release 🎉
            </div>
          </div>

          <h1 style={{
            textAlign:'center', fontSize:'clamp(32px,9vw,48px)', fontWeight:900, letterSpacing:'-0.03em',
            background:'linear-gradient(135deg,#fbbf24,#f472b6,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            lineHeight:1.1, marginBottom:32,
            animation: show ? 'scaleUp .6s .2s ease-out both' : 'none',
          }}>
            CMSN Huyềnnn!
          </h1>

          <div style={{ textAlign:'center', marginBottom:24 }}>
            <div style={{ display:'inline-block', background:'rgba(255,255,255,.08)', borderRadius:12, padding:'6px 14px', border:'1px solid rgba(255,255,255,.06)' }}>
              <span style={{ color:'#a1a1aa', fontSize:'clamp(12px,3vw,13px)', fontFamily:'monospace' }}>📅 21 / 04</span>
            </div>
          </div>

          {easterEgg && (
            <div style={{
              background:'linear-gradient(135deg,rgba(236,72,153,.1),rgba(139,92,246,.1))',
              borderRadius:16, padding:'16px 20px', marginBottom:24, textAlign:'center',
              border:'1px solid rgba(236,72,153,.2)', animation:'scaleUp .5s cubic-bezier(.34,1.56,.64,1)',
            }}>
              <p style={{ color:'#f9a8d4', fontSize:'clamp(13px,3.5vw,15px)', fontWeight:600, lineHeight:1.6 }}>
                🤫 Bạn tìm ra rồi á! Thật ra anh Tiến code cái này lúc 3h sáng, vừa code vừa ngáp đó kakaka
              </p>
            </div>
          )}

          <div style={{
            background:'rgba(255,255,255,.05)', backdropFilter:'blur(20px)',
            borderRadius:20, padding:'clamp(20px,5vw,28px)', border:'1px solid rgba(255,255,255,.08)',
            boxShadow:'0 20px 50px rgba(0,0,0,.3)', marginBottom:24,
            animation: show ? 'slideUp .8s .3s ease-out both' : 'none',
          }}>
            <div style={{ position:'relative', marginBottom:20 }}>
              <div style={{ position:'absolute', top:-8, left:4, fontSize:32, color:'rgba(255,255,255,.08)', fontFamily:'serif' }}>"</div>
              <p style={{ color:'#e4e4e7', fontSize:'clamp(15px,4vw,17px)', lineHeight:1.8, paddingLeft:8, fontWeight:500, minHeight:'1.8em' }}>
                {wish1.done
                  ? <>Sinh nhật <span style={{ background:'linear-gradient(135deg,#fbbf24,#f59e0b)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontWeight:800 }}>27 tuổi</span> vui vẻ nha! 🥳</>
                  : <>{wish1.displayed}<span style={{ animation:'blink 1s infinite', color:'#f472b6' }}>|</span></>
                }
              </p>
              {wish1.done && (
                <p style={{ color:'#e4e4e7', fontSize:'clamp(15px,4vw,17px)', lineHeight:1.8, paddingLeft:8, fontWeight:500, marginTop:12, minHeight:'1.8em' }}>
                  {wish2.done
                    ? <>Donate Khầy <span style={{ color:'#fbbf24', fontWeight:800 }}>30k</span> ăn hủ tiếu nhé nhé <span style={{ fontStyle:'italic', color:'#c4b5fd' }}>lelele</span> 🍜</>
                    : <>{wish2.displayed}<span style={{ animation:'blink 1s infinite', color:'#f472b6' }}>|</span></>
                  }
                </p>
              )}
            </div>

            <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent)', margin:'16px 0' }} />

            {wish2.done && (
              <p style={{ color:'#a1a1aa', fontSize:'clamp(14px,3.5vw,15px)', lineHeight:1.8, fontStyle:'italic', minHeight:'3.6em' }}>
                {wish3.done
                  ? <>Tuổi mới hi vọng chúc m bớt khó tính nhoa 😜 — khó tính là <strong style={{ color:'#f472b6' }}>khen</strong> á không phải chê đâu nha!</>
                  : <>{wish3.displayed}<span style={{ animation:'blink 1s infinite', color:'#f472b6' }}>|</span></>
                }
              </p>
            )}

            <div style={{ marginTop:16, textAlign:'right', opacity: wish3.done ? 1 : 0, transition:'opacity .5s' }}>
              <span style={{ color:'#52525b', fontSize:'clamp(11px,2.5vw,12px)', fontFamily:'monospace' }}>— Anh Tiến, deployed via ChatDVT 🤖</span>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10, animation: show ? 'slideUp .8s .5s ease-out both' : 'none' }}>
            <button onClick={() => openMessenger('Khầy nay màu mè dữ')}
              style={{
                display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'15px 20px',
                background:'linear-gradient(135deg,#ec4899,#8b5cf6)', color:'#fff', border:'none',
                borderRadius:14, fontSize:'clamp(14px,3.5vw,15px)', fontWeight:700, width:'100%',
                boxShadow:'0 6px 24px rgba(236,72,153,.35)', transition:'all .2s', cursor:'pointer',
              }}
            >
              💬 Reply anh Tiến ngay
            </button>
            <button onClick={() => openMessenger('Rảnh quá à ba :v')}
              style={{
                display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px 20px',
                background:'rgba(255,255,255,.05)', color:'#a1a1aa', border:'1px solid rgba(255,255,255,.08)',
                borderRadius:14, fontSize:'clamp(13px,3vw,14px)', fontWeight:600, width:'100%',
                transition:'all .2s', cursor:'pointer',
              }}
            >
              💻 Code web để chúc sinh nhật luôn á?! 
            </button>
          </div>

          <p style={{ textAlign:'center', color:'#27272a', fontSize:'clamp(9px,2vw,10px)', fontFamily:'monospace', marginTop:32 }}>
            crafted with ❤️ & mass caffeine ☕ by ChatDVT
          </p>

          <CountdownWidget />

          <div style={{ display:'flex', gap:10, marginTop:24 }}>
            <button onClick={() => window.location.reload()}
              style={{
                flex:1, padding:'13px 16px', background:'rgba(255,255,255,.05)', color:'#a1a1aa',
                border:'1px solid rgba(255,255,255,.08)', borderRadius:12,
                fontSize:'clamp(12px,3vw,13px)', fontWeight:600, cursor:'pointer', transition:'all .2s',
              }}
            >
              🔄 Replay Thiệp
            </button>
            <button onClick={() => window.location.href = '/'}
              style={{
                flex:1, padding:'13px 16px', background:'rgba(255,255,255,.05)', color:'#a1a1aa',
                border:'1px solid rgba(255,255,255,.08)', borderRadius:12,
                fontSize:'clamp(12px,3vw,13px)', fontWeight:600, cursor:'pointer', transition:'all .2s',
              }}
            >
              🏠 Trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeDiff(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { d:0, h:0, m:0, s:0, done:true };
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
    done: false,
  };
}

function useDoubleCountdown() {
  const y = new Date().getFullYear();
  const thisYearDate = new Date(`${y}-04-21T00:00:00+07:00`);
  const nextYearDate = new Date(`${y + 1}-04-21T00:00:00+07:00`);
  const [t1, setT1] = useState(getTimeDiff(thisYearDate));
  const [t2, setT2] = useState(getTimeDiff(nextYearDate));
  useEffect(() => {
    const id = setInterval(() => { setT1(getTimeDiff(thisYearDate)); setT2(getTimeDiff(nextYearDate)); }, 1000);
    return () => clearInterval(id);
  }, []);
  return { thisYear: { year: y, ...t1 }, nextYear: { year: y + 1, ...t2 } };
}

function MiniTimer({ t }: { t: { d:number; h:number; m:number; s:number } }) {
  return (
    <div style={{ display:'flex', gap:'clamp(4px,1.5vw,8px)', justifyContent:'center' }}>
      {[{ v:t.d, l:'Ngày' },{ v:t.h, l:'Giờ' },{ v:t.m, l:'Phút' },{ v:t.s, l:'Giây' }].map((x, i) => (
        <div key={i} style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.06)', borderRadius:10, padding:'clamp(6px,2vw,10px) clamp(5px,1.5vw,8px)', minWidth:'clamp(42px,12vw,54px)' }}>
          <div style={{ fontSize:'clamp(16px,4.5vw,22px)', fontWeight:800, fontFamily:'monospace', background:'linear-gradient(135deg,#fbbf24,#f472b6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1 }}>
            {String(x.v).padStart(2, '0')}
          </div>
          <div style={{ color:'#3f3f46', fontSize:'clamp(7px,1.8vw,8px)', fontWeight:600, marginTop:3, textTransform:'uppercase', letterSpacing:1 }}>{x.l}</div>
        </div>
      ))}
    </div>
  );
}

function CountdownWidget() {
  const cd = useDoubleCountdown();
  return (
    <div style={{ marginTop:32, background:'rgba(255,255,255,.03)', borderRadius:20, padding:'clamp(16px,4vw,24px)', border:'1px solid rgba(255,255,255,.05)', textAlign:'center' }}>
      <div style={{ marginBottom:20 }}>
        <p style={{ color:'#71717a', fontSize:'clamp(11px,2.8vw,13px)', marginBottom:10 }}>
          {cd.thisYear.done ? `✅ 21/04/${cd.thisYear.year} — Đã nhận quà!` : `⏰ Đếm ngược tới 21/04/${cd.thisYear.year}`}
        </p>
        {!cd.thisYear.done && <MiniTimer t={cd.thisYear} />}
      </div>
      <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent)', margin:'16px 0' }} />
      <div>
        <p style={{ color:'#71717a', fontSize:'clamp(11px,2.8vw,13px)', marginBottom:10 }}>🎁 Đếm ngược tới 21/04/{cd.nextYear.year}</p>
        <MiniTimer t={cd.nextYear} />
      </div>
      <p style={{ fontSize:'clamp(15px,4.5vw,20px)', fontWeight:800, marginTop:20, background:'linear-gradient(135deg,#fbbf24,#f472b6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
        Năm sau nhận quà tiếp nha kakakak 🎁
      </p>
    </div>
  );
}

export default function BirthdayGreeting() {
  const [phase, setPhase] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const [displayPhase, setDisplayPhase] = useState(1);
  const { avatar, name } = useBotInfo();

  useEffect(() => { document.title = `${name} | Nhiệm vụ bí mật 🤫`; preloadConfetti(); }, [name]);

  const goToPhase = (next: number) => {
    setTransitioning(true);
    setTimeout(() => {
      setPhase(next);
      setDisplayPhase(next);
      setTimeout(() => setTransitioning(false), 50);
    }, 600);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'#09090b', fontFamily:"'Inter',-apple-system,sans-serif", display:'flex', flexDirection:'column', zIndex:9999, overflow:'hidden' }}>
      <style>{`
        @keyframes blink { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-4px);opacity:1} }
        @keyframes pop { from{opacity:0;transform:translateY(10px) scale(.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes fade { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleUp { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
        @keyframes wiggle { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-4deg)} 75%{transform:rotate(4deg)} }
        @keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulse { 0%,100%{box-shadow:0 8px 30px rgba(236,72,153,.35)} 50%{box-shadow:0 8px 40px rgba(236,72,153,.55),0 0 0 4px rgba(236,72,153,.15)} }
        @keyframes particleOut { 0%{opacity:1;transform:translate(0,0) scale(1)} 100%{opacity:0;transform:translate(var(--tx,100px),var(--ty,-100px)) scale(0)} }
        @keyframes floatUp { 0%{transform:translateY(0);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translateY(-110vh);opacity:0} }
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:10px}
        *{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}
      `}</style>

      <div style={{
        position:'absolute', inset:0,
        opacity: transitioning ? 0 : 1,
        transform: transitioning ? 'scale(1.04)' : 'scale(1)',
        transition: 'opacity .5s ease-in-out, transform .5s ease-in-out',
        display:'flex', flexDirection:'column',
        filter: transitioning ? 'blur(6px)' : 'blur(0px)',
      }}>
        {displayPhase === 1 && (
          <>
            <Header avatar={avatar} name={name} />
            <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
              <ChatPhase avatar={avatar} botName={name} onDone={() => goToPhase(2)} />
            </div>
          </>
        )}
        {displayPhase === 2 && <UnboxPhase onDone={() => goToPhase(3)} />}
        {displayPhase === 3 && <GalleryPhase onDone={() => goToPhase(4)} />}
        {displayPhase === 4 && <WishPhase />}
      </div>

      <FloatingParticles />

      {transitioning && (
        <div style={{
          position:'absolute', inset:0, zIndex:100,
          display:'flex', alignItems:'center', justifyContent:'center',
          pointerEvents:'none',
        }}>
          <div style={{
            width:40, height:40, border:'3px solid rgba(255,255,255,.1)',
            borderTopColor:'#ec4899', borderRadius:'50%',
            animation:'spin .8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
        </div>
      )}
    </div>
  );
}
