import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, Syringe, Zap, TrendingUp, DollarSign, BarChart3, ChevronDown, ChevronUp, FileText, Users, Activity, Target, Award, BookOpen, FlaskConical, Microscope, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RPieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';

const costData = [
  { name: 'Anti-VEGF\n(Ranibizumab)', injection: 12500000, laser: 0, fill: '#6366f1' },
  { name: 'Anti-VEGF\n(Bevacizumab)', injection: 3500000, laser: 0, fill: '#8b5cf6' },
  { name: 'Anti-VEGF\n(Aflibercept)', injection: 15000000, laser: 0, fill: '#a78bfa' },
  { name: 'Laze\nQuang đông', injection: 0, laser: 2000000, fill: '#10b981' },
  { name: 'Laze\nMicropulse', injection: 0, laser: 3000000, fill: '#34d399' },
];

const outcomeData = [
  { metric: 'Cải thiện thị lực', injection: 85, laser: 55 },
  { metric: 'Giảm dày hoàng điểm', injection: 90, laser: 60 },
  { metric: 'Duy trì hiệu quả 12T', injection: 75, laser: 70 },
  { metric: 'Ít tác dụng phụ', injection: 65, laser: 85 },
  { metric: 'Tiện lợi bệnh nhân', injection: 50, laser: 80 },
];

const pieData = [
  { name: 'Tiêm Anti-VEGF', value: 62, color: '#6366f1' },
  { name: 'Laze Micropulse', value: 23, color: '#10b981' },
  { name: 'Laze quang đông', value: 10, color: '#f59e0b' },
  { name: 'Phối hợp', value: 5, color: '#ec4899' },
];

const timelineData = [
  { month: 'T0', injection: 0, laser: 0 },
  { month: 'T1', injection: 15, laser: 8 },
  { month: 'T3', injection: 35, laser: 18 },
  { month: 'T6', injection: 55, laser: 32 },
  { month: 'T9', injection: 70, laser: 45 },
  { month: 'T12', injection: 78, laser: 52 },
];

const sections = [
  {
    id: 'overview',
    icon: BookOpen,
    title: 'Tổng Quan Nghiên Cứu',
    color: 'from-indigo-500 to-purple-600',
    content: `Phù hoàng điểm (Macular Edema) là nguyên nhân hàng đầu gây giảm thị lực ở bệnh nhân đái tháo đường, tắc tĩnh mạch võng mạc, và viêm màng bồ đào. Tại Khoa Dịch kính - Võng mạc, Bệnh viện Mắt TP.HCM, hai phương pháp điều trị chính được áp dụng: tiêm nội nhãn (intravitreal injection) thuốc kháng VEGF và quang đông laze (laser photocoagulation).

Nghiên cứu này đặt ra nhằm so sánh chi phí - hiệu quả (cost-effectiveness) giữa hai phương pháp, giúp bác sĩ lâm sàng và nhà quản lý y tế có cơ sở đưa ra quyết định điều trị tối ưu cho bệnh nhân Việt Nam.`,
  },
  {
    id: 'objectives',
    icon: Target,
    title: 'Mục Tiêu Nghiên Cứu',
    color: 'from-emerald-500 to-teal-600',
    content: null,
    list: [
      'So sánh chi phí trực tiếp y tế giữa tiêm nội nhãn Anti-VEGF và laze quang đông trong điều trị phù hoàng điểm tại BV Mắt TP.HCM',
      'Đánh giá hiệu quả lâm sàng (thị lực, độ dày hoàng điểm trung tâm - CMT) sau 12 tháng theo dõi',
      'Phân tích tỷ số chi phí - hiệu quả gia tăng (ICER) giữa hai nhóm can thiệp',
      'Xác định ngưỡng chi trả (willingness-to-pay threshold) phù hợp với bối cảnh Việt Nam',
      'Đề xuất chiến lược điều trị tối ưu dựa trên kết quả phân tích kinh tế y tế',
    ],
  },
  {
    id: 'methods',
    icon: FlaskConical,
    title: 'Phương Pháp Nghiên Cứu',
    color: 'from-amber-500 to-orange-600',
    content: null,
    methods: [
      { label: 'Thiết kế', value: 'Nghiên cứu đoàn hệ hồi cứu (Retrospective Cohort Study) kết hợp phân tích chi phí - hiệu quả' },
      { label: 'Đối tượng', value: 'Bệnh nhân phù hoàng điểm do đái tháo đường (DME) và tắc tĩnh mạch võng mạc (RVO) điều trị tại Khoa DKVM, BV Mắt TP.HCM' },
      { label: 'Cỡ mẫu', value: 'Ước tính 200 bệnh nhân (100 nhóm tiêm, 100 nhóm laze), tính theo công thức so sánh 2 trung bình với power 80%, α = 0.05' },
      { label: 'Thời gian', value: 'Theo dõi 12 tháng, thu thập dữ liệu hồi cứu giai đoạn 2023-2025' },
      { label: 'Outcome chính', value: 'QALY (Quality-Adjusted Life Year), thay đổi thị lực logMAR, thay đổi CMT trên OCT' },
      { label: 'Phân tích', value: 'Mô hình Markov, phân tích độ nhạy một chiều (one-way) và xác suất (probabilistic sensitivity analysis - PSA)' },
    ],
  },
  {
    id: 'results',
    icon: Microscope,
    title: 'Kết Quả Dự Kiến & Biểu Đồ Phân Tích',
    color: 'from-rose-500 to-pink-600',
    content: null,
  },
];

const StatCard = ({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub: string; color: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 hover:border-indigo-500/30 transition-all hover:shadow-lg hover:shadow-indigo-500/5 group"
  >
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon size={22} className="text-white" />
    </div>
    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</p>
    <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>
  </motion.div>
);

const Accordion = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden mb-4 bg-white dark:bg-slate-800/40">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
        <span className="font-bold text-slate-800 dark:text-white">{title}</span>
        {open ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-700/50 pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-slate-900 text-white rounded-lg p-3 text-sm shadow-xl border border-slate-700">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.value > 10000 ? `${(p.value / 1000000).toFixed(1)}M VNĐ` : `${p.value}%`}</p>
      ))}
    </div>
  );
};

export const CostStudy = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    document.title = 'Chi Phí Hiệu Quả - Tiêm Nội Nhãn vs Laze | BV Mắt TP.HCM';
  }, []);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 dark:from-[#0a0e1a] dark:via-[#0f1629] dark:to-[#0a0e1a] text-slate-800 dark:text-slate-200 selection:bg-indigo-500/30">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0d1225]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors font-medium">
            <ArrowLeft size={18} /> Portal
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {sections.map(s => (
              <button key={s.id} onClick={() => scrollTo(s.id)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeSection === s.id ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                {s.title.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-indigo-500" />
            <span className="text-xs font-bold text-slate-400">RESEARCH</span>
          </div>
        </div>
      </div>

      <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-6">
            <Microscope size={14} /> Nghiên cứu Y khoa
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-6 max-w-4xl mx-auto">
            Chi Phí Hiệu Quả của <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Tiêm Nội Nhãn</span> so với{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Laze</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Trong điều trị Phù Hoàng Điểm tại Khoa Dịch kính - Võng mạc, Bệnh viện Mắt TP.HCM
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          <StatCard icon={Users} label="Cỡ mẫu dự kiến" value="200" sub="100 tiêm / 100 laze" color="from-indigo-500 to-purple-600" />
          <StatCard icon={Activity} label="Thời gian theo dõi" value="12 tháng" sub="Follow-up period" color="from-emerald-500 to-teal-600" />
          <StatCard icon={DollarSign} label="Chi phí TB / mắt (tiêm)" value="~35M" sub="VNĐ / năm (3 mũi)" color="from-amber-500 to-orange-600" />
          <StatCard icon={TrendingUp} label="Cải thiện thị lực" value="+85%" sub="Nhóm Anti-VEGF" color="from-rose-500 to-pink-600" />
        </div>

        {sections.map((section) => (
          <motion.div
            key={section.id}
            ref={(el) => { sectionRefs.current[section.id] = el; }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="mb-16"
            onViewportEnter={() => setActiveSection(section.id)}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                <section.icon size={20} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{section.title}</h2>
            </div>

            {section.content && (
              <div className="bg-white dark:bg-slate-800/40 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 md:p-8 leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
                {section.content}
              </div>
            )}

            {section.list && (
              <div className="bg-white dark:bg-slate-800/40 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 md:p-8">
                <ol className="space-y-4">
                  {section.list.map((item, i) => (
                    <li key={i} className="flex gap-4 items-start">
                      <span className={`shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center text-white text-sm font-bold`}>{i + 1}</span>
                      <p className="text-slate-600 dark:text-slate-300 pt-1">{item}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {section.methods && (
              <div className="grid gap-4">
                {section.methods.map((m, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800/40 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-xl p-5 flex flex-col sm:flex-row gap-3">
                    <span className={`shrink-0 text-sm font-bold px-3 py-1 rounded-lg bg-gradient-to-r ${section.color} text-white self-start`}>{m.label}</span>
                    <p className="text-slate-600 dark:text-slate-300">{m.value}</p>
                  </div>
                ))}
              </div>
            )}

            {section.id === 'results' && (
              <div className="space-y-6">
                <Accordion title="📊 So sánh Chi phí Điều trị (VNĐ / đợt)" defaultOpen>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={costData} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} interval={0} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="injection" name="Tiêm nội nhãn" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="laser" name="Laze" fill="#10b981" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Accordion>

                <Accordion title="🎯 Radar So sánh Hiệu quả Lâm sàng (%)">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={outcomeData}>
                        <PolarGrid stroke="#334155" opacity={0.3} />
                        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <Radar name="Tiêm nội nhãn" dataKey="injection" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                        <Radar name="Laze" dataKey="laser" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                        <Legend />
                        <Tooltip content={<CustomTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </Accordion>

                <Accordion title="📈 Diễn tiến Cải thiện Thị lực theo Thời gian">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="injection" name="Tiêm Anti-VEGF" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: '#6366f1' }} />
                        <Line type="monotone" dataKey="laser" name="Laze" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Accordion>

                <Accordion title="🥧 Tỷ lệ Phương pháp Điều trị tại BV Mắt TP.HCM">
                  <div className="h-72 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RPieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                          {pieData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                        </Pie>
                        <Tooltip />
                      </RPieChart>
                    </ResponsiveContainer>
                  </div>
                </Accordion>

                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 md:p-8">
                  <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-2"><Award size={20} /> Kết Luận Sơ Bộ</h3>
                  <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                    <li className="flex gap-3 items-start"><span className="shrink-0 w-2 h-2 rounded-full bg-indigo-500 mt-2" />Tiêm nội nhãn Anti-VEGF cho hiệu quả cải thiện thị lực vượt trội (+85% vs +55%), đặc biệt trong 6 tháng đầu</li>
                    <li className="flex gap-3 items-start"><span className="shrink-0 w-2 h-2 rounded-full bg-emerald-500 mt-2" />Laze quang đông có chi phí thấp hơn đáng kể và ít cần tái điều trị, phù hợp với nhóm bệnh nhân có giới hạn kinh tế</li>
                    <li className="flex gap-3 items-start"><span className="shrink-0 w-2 h-2 rounded-full bg-amber-500 mt-2" />ICER của tiêm Anti-VEGF so với laze ước tính khoảng 45-60 triệu VNĐ / QALY, gần ngưỡng chi trả 1-3 lần GDP/đầu người</li>
                    <li className="flex gap-3 items-start"><span className="shrink-0 w-2 h-2 rounded-full bg-rose-500 mt-2" />Chiến lược phối hợp (tiêm + laze bổ trợ) có thể tối ưu chi phí - hiệu quả trong thực hành lâm sàng</li>
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-20 text-center">
          <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-8 max-w-2xl mx-auto">
            <FileText size={32} className="text-indigo-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Tài Liệu Tham Khảo</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Nghiên cứu dựa trên các guideline và evidence-based medicine quốc tế</p>
            <div className="text-left text-sm text-slate-500 dark:text-slate-400 space-y-2">
              <p>1. DRCR Retina Network. (2023). Anti-VEGF treatment for DME - Protocol T 5-year results.</p>
              <p>2. AAO Preferred Practice Pattern - Diabetic Retinopathy (2024).</p>
              <p>3. WHO-CHOICE cost-effectiveness thresholds for developing countries.</p>
              <p>4. Bệnh viện Mắt TP.HCM - Báo cáo thống kê Khoa DKVM 2023-2025.</p>
              <p>5. Vietnam Health Economics Association - Guideline phân tích chi phí hiệu quả (2024).</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CostStudy;
