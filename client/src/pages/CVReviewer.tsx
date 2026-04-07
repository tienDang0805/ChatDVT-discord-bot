import React, { useState, useRef, useEffect } from 'react';
import { Upload, Scan, AlertTriangle, FileText, CornerUpLeft, Code, Eye, File as FileIcon, CheckCircle2, Wand2, Star, Github, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from 'react-hot-toast';
import { EditableCV, type CVData } from '../components/EditableCV';
import { GeminiKeyInput, getStoredGeminiKey } from '../components/GeminiKeyInput';

const htmlToMd = (html: string) => {
  if (!html) return '';
  let md = html.replace(/<b\b[^>]*>(.*?)<\/b>/gi, '**$1**')
               .replace(/<strong\b[^>]*>(.*?)<\/strong>/gi, '**$1**')
               .replace(/<i\b[^>]*>(.*?)<\/i>/gi, '_$1_')
               .replace(/<em\b[^>]*>(.*?)<\/em>/gi, '_$1_')
               .replace(/<div><br><\/div>/gi, '\n')
               .replace(/<div\b[^>]*>(.*?)<\/div>/gi, '\n$1')
               .replace(/<br\s*\/?>/gi, '\n')
               .replace(/<[^>]+>/g, '')
               .replace(/\n\s*\n/g, '\n\n');
  return md.trim();
};

const jsonToMarkdown = (data: CVData) => {
  if (!data) return '';
  const { personalInfo, experience, education, skills, projects, customSections } = data;
  let md = `# ${personalInfo?.fullName || 'Tên'}\n`;
  md += `**${personalInfo?.title || 'Vị trí'}** | ${personalInfo?.email || ''} | ${personalInfo?.phone || ''} | ${personalInfo?.portfolio || ''}\n\n`;
  
  if (personalInfo?.summary) md += `## SUMMARY\n${htmlToMd(personalInfo.summary)}\n\n`;
  
  if (experience?.length) {
    md += `## WORK EXPERIENCE\n`;
    experience.forEach(exp => {
      md += `### **${exp.role}** - *${exp.company}*\n_${exp.duration}_\n${htmlToMd(exp.description)}\n\n`;
    });
  }
  
  if (projects?.length) {
    md += `## PROJECTS\n`;
    projects.forEach(proj => {
      md += `### **${proj.name}**\n_${proj.duration}_\n${htmlToMd(proj.description)}\n\n`;
    });
  }
  
  if (education?.length) {
    md += `## EDUCATION\n`;
    education.forEach(edu => {
      md += `### **${edu.school}**\n**${edu.degree}** ${edu.gpa ? `| GPA: ${edu.gpa}` : ''} | _${edu.duration}_\n\n`;
    });
  }
  
  if (skills?.length) {
    md += `## SKILLS\n`;
    skills.forEach(s => { md += `- ${htmlToMd(s)}\n`; });
    md += '\n';
  }
  
  if (customSections?.length) {
    customSections.forEach(section => {
      md += `## ${section.title?.toUpperCase()}\n`;
      section.items?.forEach(item => {
         md += `### **${item.name}**\n_${item.duration}_\n${htmlToMd(item.description)}\n\n`;
      });
    });
  }

  return md;
};

const sampleCV: CVData = {
  personalInfo: {
    fullName: "NGUYỄN VĂN A",
    title: "Senior Full Stack Software Engineer",
    email: "nguyenvana.dev@email.com",
    phone: "(+84) 987 654 321",
    portfolio: "github.com/nguyenvana | linkedin.com/in/nguyenvana",
    summary: "Senior Full Stack Engineer với hơn 5 năm kinh nghiệm thiết kế và phát triển các hệ thống chịu tải cao (high-traffic distributed systems). Chuyên môn sâu về Node.js, React, và Data Architecture. Đam mê tối ưu hoá hiệu năng (performance tuning) và xây dựng văn hoá kĩ thuật (engineering culture). Từng leader team 5 người phát triển core payment gateway xử lý hơn $1M/ngày."
  },
  experience: [
    {
       company: "Kỳ Lân Công Nghệ (Tech Unicorn VN)",
       role: "Senior Backend Engineer",
       duration: "01/2021 - Hiện tại",
       description: "- Thiết kế lại kiến trúc (Refactor Microservices) cho hệ thống lõi giúp giảm 40% latency và tiết kiệm $2,000 AWS cost mỗi tháng.\n- Triển khai Redis caching và Optimize SQL Queries, giải quyết triệt để bài toán bottleneck cho hơn 2 triệu concurrent users dịp Flash Sale.\n- Dẫn dắt team 5 thành viên; áp dụng CI/CD (GitHub Actions, Docker) giảm thời gian release từ 2 ngày xuống 30 phút."
    },
    {
       company: "Công ty Outsourcing X",
       role: "Full Stack Developer",
       duration: "06/2018 - 12/2020",
       description: "- Xây dựng từ đầu (from scratch) 3 hệ thống CRM nội bộ bằng React và Express.js cho thị trường Nhật.\n- Tích hợp thành công các cổng thanh toán Stripe và PayPal, đạt độ ổn định 99.9% uptime.\n- Mentor cho 3 Fresher lên trình độ Junior trong vòng 6 tháng."
    }
  ],
  education: [
    {
       school: "Đại học Bách Khoa Hà Nội",
       degree: "Kỹ sư Kỹ thuật Phần mềm",
       duration: "2014 - 2018",
       gpa: "3.6/4.0 (Giỏi)"
    }
  ],
  skills: [
    "Ngôn ngữ: TypeScript, Go, Python, SQL",
    "Frontend: React.js, Next.js, Tailwind CSS",
    "Backend & DB: Node.js, Express, PostgreSQL, MongoDB, Redis",
    "Infrastructure: Docker, Kubernetes, AWS (EC2), CI/CD"
  ],
  projects: [
    {
       name: "Hệ thống Phân phối Video Thời gian thực",
       duration: "Dự án cá nhân (2022)",
       description: "- Tự xây dựng streaming server bằng WebRTC & Golang. Đạt giải Nhất cuộc thi Hackathon nội bộ công ty."
    }
  ]
};

interface FeatureRating {
  issue: string;
  advice: string;
}

interface AnalysisResult {
  score: number;
  level: string;
  overall: string;
  critiques: FeatureRating[];
  strengths: string[];
  development?: {
    missingSkills: string[];
    nextSteps: string[];
  };
}

export const CVReviewer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  
  const [reviewResult, setReviewResult] = useState<AnalysisResult | null>(null);
  const [rewriteResult, setRewriteResult] = useState<CVData | null>(null);
  const [devMarkdown, setDevMarkdown] = useState<string>('');
  const [currentMode, setCurrentMode] = useState<'review' | 'rewrite' | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  
  const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Khám Điền Thổ CV | devtiendang.blog";
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'];
      
      const isImage = selectedFile.type.startsWith('image/');
      const isAllowedDoc = allowedTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.md');
      
      if (!isImage && !isAllowedDoc) {
        toast.error("Chỉ chấp nhận ảnh, PDF, DOCX, TXT, MD thưa ngài!");
        return;
      }
      
      setFile(selectedFile);
      setReviewResult(null);
      setRewriteResult(null);
      setLogs([]);

      if (isImage) {
        const reader = new FileReader();
        reader.onload = (event) => setFilePreview(event.target?.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const loadSampleCV = () => {
    // Fake a file to satisfy UI checks
    const fakeFile = new File(["sample"], "Sample_CV_Senior_99D.pdf", { type: "application/pdf" });
    setFile(fakeFile);
    setFilePreview(null);
    setReviewResult(null);
    setRewriteResult(sampleCV);
    setDevMarkdown(jsonToMarkdown(sampleCV));
    setCurrentMode('rewrite');
    setIsScanning(false);
    toast.success("Đã nạp thành công Mẫu CV Chuyên Gia!");
  };

  const startProcess = async (mode: 'review' | 'rewrite') => {
    if (!file) return;
    setIsScanning(true);
    setScanProgress(0);
    setReviewResult(null);
    setRewriteResult(null);
    setCurrentMode(mode);
    setActiveTab('preview');
    
    setLogs([
      "Bật Server HR chạy bằng cơm...", 
      `Chế độ: ${mode === 'review' ? 'KHÁM ĐIỀN THỔ (REVIEW)' : 'REFACTOR CV 90+ (REWRITE)'}`,
      "Đang dịch ngược tệp tin..."
    ]);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 2;
        return next > 95 ? 95 : next;
      });
    }, 800);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const formData = new FormData();
      formData.append('cvFile', file);
      formData.append('mode', mode);
      if (customPrompt) {
        formData.append('customPrompt', customPrompt);
      }
      if (mode === 'rewrite' && reviewResult) {
        formData.append('reviewContext', JSON.stringify(reviewResult));
      }
      const storedKey = getStoredGeminiKey();
      if (storedKey) formData.append('geminiApiKey', storedKey);

      const response = await fetch(`${apiUrl}/api/cv-reviewer`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      clearInterval(interval);
      setScanProgress(100);
      setIsScanning(false);
      
      if (!response.ok) {
        toast.error(data.error || "Nhân sự báo lỗi rồi bạn ơi.");
        setLogs(prev => [...prev, `LỖI: ${data.error}`]);
      } else {
        if (mode === 'review') {
           setReviewResult(data.result);
        } else {
           setRewriteResult(data.result);
           setDevMarkdown(jsonToMarkdown(data.result));
        }
        setLogs(prev => [...prev, "Báo cáo biên bản hoàn tất."]);
        toast.success("Done!");
      }
    } catch (error) {
      clearInterval(interval);
      setScanProgress(100);
      setIsScanning(false);
      toast.error("Mất sóng não với AI.");
      setLogs(prev => [...prev, "LỖI KẾT NỐI SERVER"]);
    }
  };

  const reset = () => {
    setFile(null);
    setFilePreview(null);
    setReviewResult(null);
    setRewriteResult(null);
    setIsScanning(false);
    setLogs([]);
    setScanProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- UI Components ---
  const renderUploader = () => (
    <div className="bg-[#161b22] border border-slate-800 rounded-xl p-6 shadow-2xl relative overflow-hidden flex flex-col h-full">
      {!file ? (
        <div className="flex flex-col gap-4">
          <div 
            className="border-2 border-dashed border-slate-600 hover:border-cyan-500 rounded-lg h-60 md:h-72 flex flex-col items-center justify-center cursor-pointer transition-colors group relative bg-[#0d1117]"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={48} className="text-slate-500 group-hover:text-cyan-500 mb-4 group-hover:-translate-y-2 transition-transform duration-300" />
            <p className="text-slate-400 font-bold group-hover:text-white transition-colors uppercase tracking-widest text-sm">THẢ BẢN CV LỖI VÀO ĐÂY</p>
            <p className="text-xs text-slate-600 mt-2">Nhận đĩa mềm PDF, DOCX, Ảnh PNG/JPG, Markdown</p>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          </div>
          <button 
            onClick={loadSampleCV}
            className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-yellow-500 border border-yellow-500/30 py-4 mt-2 rounded-lg font-bold transition-all shadow-lg text-sm tracking-wider"
          >
            <Star size={18} /> LOAD MẪU CV CHUYÊN GIA (&gt;90Đ) LÀM THAM KHẢO
          </button>
        </div>
      ) : (
        <div className="relative flex-1 min-h-[200px] md:min-h-[320px] rounded-lg border border-cyan-500/30 bg-black flex items-center justify-center group overflow-hidden">
          {filePreview ? (
             <img src={filePreview} alt="CV Preview" className="h-full w-full object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
          ) : (
             <div className="flex flex-col items-center text-cyan-400">
                <FileText size={80} className="mb-4 opacity-80" />
                <p className="font-bold text-lg mb-1">{file.name}</p>
                <p className="text-sm opacity-60 bg-cyan-900/40 px-3 py-1 rounded-full">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
             </div>
          )}
          
          {isScanning && (
            <>
              <div className="absolute top-0 left-0 w-full h-[3px] bg-cyan-400 shadow-[0_0_20px_#22d3ee] animate-[scan_2s_ease-in-out_infinite]" />
              <div className="absolute inset-0 bg-cyan-900/20 pointer-events-none mix-blend-screen" />
            </>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-col md:flex-row gap-4">
        {file && !isScanning && !reviewResult && !rewriteResult && (
          <>
            <button 
              onClick={() => startProcess('review')}
              className="flex-1 bg-gradient-to-r from-rose-600 to-orange-600 text-white font-bold py-3.5 rounded-xl hover:from-rose-500 hover:to-orange-500 transition-all flex justify-center items-center gap-2 active:scale-95 shadow-lg shadow-rose-900/20 uppercase text-sm tracking-wider"
            >
              <Scan size={18} /> Khám Điền Thổ
            </button>
            <button 
              onClick={() => startProcess('rewrite')}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3.5 rounded-xl hover:from-cyan-500 hover:to-blue-500 transition-all flex justify-center items-center gap-2 active:scale-95 shadow-lg shadow-cyan-900/20 uppercase text-sm tracking-wider"
            >
              <Wand2 size={18} /> REFACTOR CV ĐẠT 90+
            </button>
          </>
        )}
        {file && (
          <button 
            onClick={reset}
            disabled={isScanning}
            className="md:px-6 bg-[#1f2937] text-slate-300 font-bold py-3.5 rounded-xl hover:bg-[#374151] border border-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm tracking-wider"
          >
            Vứt Đi Làm Lại
          </button>
        )}
      </div>
    </div>
  );

  const renderReviewResult = () => {
    if (!reviewResult) return null;
    
    // Dynamic color logic for score
    const score = reviewResult.score;
    let scoreColor = "text-rose-500";
    let scoreBg = "bg-rose-500/10";
    let scoreBorder = "border-rose-500/30";
    
    if (score >= 90) { 
      scoreColor = "text-emerald-500"; 
      scoreBg = "bg-emerald-500/10"; 
      scoreBorder = "border-emerald-500/30"; 
    } else if (score >= 70) { 
      scoreColor = "text-amber-500"; 
      scoreBg = "bg-amber-500/10"; 
      scoreBorder = "border-amber-500/30"; 
    }

    return (
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 md:p-10 shadow-2xl flex flex-col animate-[fade-in_0.5s_ease-out] relative font-sans">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-800 pb-6 gap-4">
           <div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-3">
                <Scan className="text-cyan-500" size={28} /> ATS ANALYSIS REPORT
              </h3>
              <p className="text-slate-500 text-sm mt-1.5 font-medium">Báo cáo chuẩn mực về mức độ tương thích của CV với hệ thống quét tự động</p>
           </div>
           
           <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border ${scoreBorder} ${scoreBg}`}>
              <div className="flex flex-col text-right">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ATS SCORE</span>
                 <span className={`text-4xl font-black ${scoreColor} leading-none tracking-tighter`}>{score}<span className="text-xl opacity-40 font-bold">/100</span></span>
              </div>
           </div>
        </div>
        
        {/* Executive Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 mb-8 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
           <div className="flex justify-between items-start md:items-center mb-3">
              <h4 className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                <FileText size={14} className="text-cyan-500" /> Executive Summary
              </h4>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700`}>
                 Level: {reviewResult.level}
              </span>
           </div>
           
           <p className="text-slate-200 leading-relaxed text-lg md:text-xl font-medium">
             "{reviewResult.overall}"
           </p>
           
           <div className="mt-8 flex flex-col gap-4">
              <div className="relative">
                <textarea 
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  placeholder="Yêu cầu đặc biệt cho AI (Ví dụ: Thêm tech stack React, dịch sang tiếng Nhật...)"
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg p-3.5 text-[13.5px] text-slate-300 outline-none focus:border-cyan-500/50 transition-colors custom-scrollbar placeholder:text-slate-600 resize-none h-[75px]"
                />
                <button 
                   onClick={() => startProcess('rewrite')}
                   className="absolute right-2 bottom-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-2 rounded-md font-black uppercase tracking-widest text-[11px] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-95"
                >
                   <Wand2 size={14} /> REFACTOR (&gt;95 ĐIỂM)
                </button>
              </div>
           </div>
        </div>

        {/* Details Grid */}
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8">
           {/* Actionable Feedback */}
           <div>
               <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-5 text-slate-400 border-b border-slate-800 pb-2">
                 Actionable Feedback (Khuyến nghị Cải thiện)
               </h4>
               <div className="space-y-4">
                 {reviewResult.critiques?.map((item, idx) => (
                   <div key={idx} className="group bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl hover:border-cyan-500/30 transition-all">
                      <p className="text-rose-400 font-bold mb-3 text-[14.5px] leading-snug flex gap-2 items-start">
                        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                        <span>{item.issue}</span>
                      </p>
                      <div className="flex gap-3 items-start bg-emerald-500/5 p-3.5 rounded-lg border border-emerald-500/10">
                         <div className="mt-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider ring-1 ring-emerald-500/30">FIX</div>
                         <p className="text-slate-400 text-[13.5px] leading-relaxed font-medium">
                           {item.advice}
                         </p>
                      </div>
                   </div>
                 ))}
               </div>
           </div>

           {/* Core Strengths */}
           <div>
               <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-5 text-slate-400 border-b border-slate-800 pb-2">
                 Core Strengths (Điểm mạnh cốt lõi)
               </h4>
               <div className="space-y-3">
                 {reviewResult.strengths?.map((item, idx) => (
                   <div key={idx} className="bg-slate-900/40 border border-slate-800/80 p-4.5 rounded-xl flex items-start gap-3">
                      <div className="bg-emerald-500/10 p-1.5 rounded-full shrink-0 border border-emerald-500/20 mt-0.5">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      </div>
                      <p className="text-slate-300 text-[14.5px] leading-relaxed font-medium">{item}</p>
                   </div>
                 ))}
               </div>
           </div>
        </div>

        {/* Development Plan */}
        {reviewResult.development && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8 mt-8 border-l-4 border-l-blue-500 relative overflow-hidden transition-all shadow-lg hover:shadow-blue-900/10">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] -z-10 rounded-full" />
             <h4 className="text-[12px] font-black uppercase tracking-[0.2em] mb-6 text-blue-400 flex items-center gap-2">
               <TrendingUp size={16} /> ROADMAP & SKILL GAP ANALYSIS
             </h4>
             <div className="grid md:grid-cols-[1fr_1.5fr] gap-8">
                <div>
                   <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Tech & Soft Skills Còn Thiếu</h5>
                   <div className="flex flex-wrap gap-2">
                      {reviewResult.development.missingSkills?.map((s: string, i: number) => (
                         <span key={i} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-xs font-bold leading-none">{s}</span>
                      ))}
                   </div>
                </div>
                <div>
                   <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Hành Động Khuyên Dùng (Next Steps)</h5>
                   <ul className="space-y-3">
                      {reviewResult.development.nextSteps?.map((step: string, i: number) => (
                         <li key={i} className="flex gap-3 text-slate-300 text-[13.5px] leading-relaxed font-medium">
                            <span className="text-blue-500 mt-1 shrink-0"><ArrowRight size={14}/></span> {step}
                         </li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  };

  const renderRewriteResult = () => {
    if (!rewriteResult) return null;
    return (
      <div className="bg-[#0b0f19] border border-cyan-500/30 rounded-xl shadow-[0_0_40px_rgba(34,211,238,0.1)] flex flex-col animate-[fade-in_0.5s_ease-out] overflow-hidden transition-all duration-500" style={{ minHeight: activeTab === 'preview' ? '850px' : '650px' }}>
        
        {/* Tab Header */}
        <div className="flex bg-[#161b22] border-b border-slate-800 shrink-0 sm:flex-row flex-col">
           <button 
             onClick={() => setActiveTab('preview')}
             className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest transition-colors ${activeTab === 'preview' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20' : 'text-slate-500 hover:bg-slate-800'}`}
           >
             <Eye size={18} /> Normal Mode (Sửa trực tiếp & In PDF)
           </button>
           <button 
             onClick={() => { setActiveTab('raw'); setDevMarkdown(jsonToMarkdown(rewriteResult)); }}
             className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest transition-colors ${activeTab === 'raw' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20' : 'text-slate-500 hover:bg-slate-800'}`}
           >
             <Code size={18} /> Dev Mode (Trình sinh Markdown)
           </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 bg-[#1e1e1e] h-full flex flex-col relative">
           {activeTab === 'preview' ? (
              <EditableCV data={rewriteResult} onChange={setRewriteResult} />
           ) : (
              <div className="flex flex-col md:flex-row h-full">
                  {/* Fake VS Code Header */}
                  <div className="absolute top-0 w-full h-10 bg-[#252526] border-b border-[#3c3c3c] flex items-center px-4 justify-between select-none z-10 shrink-0 hidden md:flex">
                     <div className="flex items-center gap-2">
                        <Github size={16} className="text-slate-400" />
                        <span className="text-xs text-slate-300 font-mono">cv_chuan_ats.md - CHATDVT EDITION</span>
                     </div>
                     <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                     </div>
                  </div>
                  
                  {/* Left: Code Editor Fake */}
                  <div className="flex-1 border-r border-[#3c3c3c] min-h-[400px] bg-[#1e1e1e] flex flex-col pt-0 md:pt-10">
                     <TextareaAutosize
                       value={devMarkdown}
                       onChange={(e) => setDevMarkdown(e.target.value)}
                       className="w-full h-full min-h-[400px] bg-transparent text-[#d4d4d4] font-mono p-4 md:p-6 resize-none focus:outline-none focus:ring-0 leading-[1.6] text-[13px] md:text-sm custom-scrollbar selection:bg-[#264f78]"
                       placeholder="Nhập mã Markdown vào đây..."
                       spellCheck="false"
                     />
                  </div>
                  {/* Right: Code Preview Fake */}
                  <div className="flex-1 bg-[#161b22] text-[#c9d1d9] prose prose-invert p-6 md:p-10 custom-scrollbar overflow-auto min-h-[400px] pt-4 md:pt-14">
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>
                       {devMarkdown}
                     </ReactMarkdown>
                  </div>
              </div>
           )}
        </div>
        
        {/* Actions Footer - Only for Dev Mode */}
        {activeTab === 'raw' && (
           <div className="bg-[#161b22] p-4 border-t border-[#3c3c3c] flex justify-end gap-4 shrink-0 mt-auto">
              <button 
                onClick={() => {
                   navigator.clipboard.writeText(devMarkdown);
                   toast.success("Đã copy toàn bộ mã Markdown !");
                }}
                className="px-6 py-2.5 bg-[#007acc] hover:bg-[#005c99] text-white font-bold rounded-sm transition-all text-sm flex items-center gap-2 uppercase tracking-wide"
              >
                📋 COPY MÃ NGUỒN (MARKDOWN)
              </button>
           </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 py-12 px-4 md:px-8 font-sans overflow-x-hidden">
       <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>

      <div className="max-w-[1500px] mx-auto">
         {/* HEADER */}
         <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-5">
            <Link to="/" className="text-slate-400 hover:text-cyan-500 transition-colors p-3.5 bg-[#161b22] rounded-xl border border-slate-800 shadow-xl group">
              <CornerUpLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-500 uppercase tracking-tighter flex items-center gap-3">
              <FileIcon size={36} className="text-cyan-500 hidden md:block" /> CỨU RỖI CV CHẶP VÁ
            </h1>
          </div>
          <p className="text-slate-400 max-w-sm text-xs md:text-sm text-right border-r-4 border-emerald-500 pr-5 hidden md:block italic leading-relaxed">
            Sức mạnh AI phân tích và tự động thiết kế lại chiếc CV phèn chúa của bạn thành một tuyệt tác Silicon Valley chỉ trong 10 giây.
          </p>
        </div>

        <div className={`grid gap-12 transition-all duration-700 items-start ${reviewResult || rewriteResult ? 'xl:grid-cols-[1fr_2.5fr]' : 'max-w-4xl mx-auto'}`}>
           
           {/* CỘT UPLOADER (Trái) */}
           <div className={`flex flex-col gap-8 ${(!reviewResult && !rewriteResult) ? 'w-full' : 'xl:sticky xl:top-8'}`}>
              {renderUploader()}
              <div className="mt-4"><GeminiKeyInput accent="blue" /></div>
              
              {/* Terminal Logs hiển thị khi đang scan */}
              {isScanning && (
                 <div className="bg-black border border-slate-800 rounded-xl p-5 font-mono text-sm shadow-2xl animate-[fade-in_0.3s]">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
                         <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_#eab308]" />
                         <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                       </div>
                       <span className="text-slate-600 font-bold tracking-widest text-[10px]">HR_CONSOLE.exe - v9.9.9</span>
                    </div>
                    <div className="text-green-400 space-y-2 h-36 overflow-y-auto text-[13px] tracking-wide custom-scrollbar pr-2">
                        {logs.map((L, i) => <div key={i}>{`> ${L}`}</div>)}
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full mt-4 overflow-hidden border border-slate-800">
                       <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300" style={{width: `${scanProgress}%`}} />
                    </div>
                 </div>
              )}
           </div>

           {/* CỘT KẾT QUẢ (Phải) */}
           <div className="w-full">
              {(reviewResult || rewriteResult) && (
                 currentMode === 'review' ? renderReviewResult() : renderRewriteResult()
              )}
           </div>

        </div>

      </div>
    </div>
  );
};
