import React, { useState, useRef, useEffect } from 'react';
import { Upload, Scan, AlertTriangle, FileText, CornerUpLeft, Code, Eye, File, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from 'react-hot-toast';
import { EditableCV, type CVData } from '../components/EditableCV';

const jsonToMarkdown = (data: CVData) => {
  if (!data) return '';
  const { personalInfo, experience, education, skills, projects } = data;
  let md = `# ${personalInfo?.fullName || 'Tên'}\n`;
  md += `**${personalInfo?.title || 'Vị trí'}** | ${personalInfo?.email || ''} | ${personalInfo?.phone || ''} | ${personalInfo?.portfolio || ''}\n\n`;
  
  if (personalInfo?.summary) md += `## SUMMARY\n${personalInfo.summary}\n\n`;
  
  if (experience?.length) {
    md += `## KINH NGHIỆM LÀM VIỆC\n`;
    experience.forEach(exp => {
      md += `### **${exp.role}** - *${exp.company}*\n_${exp.duration}_\n${exp.description}\n\n`;
    });
  }
  
  if (projects?.length) {
    md += `## DỰ ÁN NỔI BẬT\n`;
    projects.forEach(proj => {
      md += `### **${proj.name}**\n_${proj.duration}_\n${proj.description}\n\n`;
    });
  }
  
  if (education?.length) {
    md += `## HỌC VẤN\n`;
    education.forEach(edu => {
      md += `### **${edu.school}**\n**${edu.degree}** | GPA: ${edu.gpa} | _${edu.duration}_\n\n`;
    });
  }
  
  if (skills?.length) {
    md += `## KỸ NĂNG\n`;
    skills.forEach(s => { md += `- ${s}\n`; });
  }
  return md;
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
  
  // Tab control for Rewrite mode
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

  const startProcess = async (mode: 'review' | 'rewrite') => {
    if (!file) return;
    setIsScanning(true);
    setScanProgress(0);
    setReviewResult(null);
    setRewriteResult(null);
    setCurrentMode(mode);
    setActiveTab('preview');
    
    setLogs([
      "Đang kích hoạt đặc vụ HR AI...", 
      `Chế độ: ${mode === 'review' ? 'KHÁM ĐIỀN THỔ (REVIEW)' : 'TỰ VIẾT MỚI CV (REWRITE)'}`,
      "Đang nhai nốt tệp tin..."
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

      const response = await fetch(`${apiUrl}/api/cv-reviewer`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      clearInterval(interval);
      setScanProgress(100);
      setIsScanning(false);
      
      if (!response.ok) {
        toast.error(data.error || "Lỗi cmnr, AI chê CV này.");
        setLogs(prev => [...prev, `ERROR: ${data.error}`]);
      } else {
        if (mode === 'review') {
           setReviewResult(data.result);
        } else {
           setRewriteResult(data.result);
           setDevMarkdown(jsonToMarkdown(data.result));
        }
        setLogs(prev => [...prev, "Hoàn tất xử lý tác vụ."]);
        toast.success("Xong rồi nha!");
      }
    } catch (error) {
      clearInterval(interval);
      setScanProgress(100);
      setIsScanning(false);
      toast.error("Lỗi mất kết nối với vũ trụ AI.");
      setLogs(prev => [...prev, "ERROR: Disconnected!"]);
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
        <div 
          className="border-2 border-dashed border-slate-600 hover:border-cyan-500 rounded-lg h-60 md:h-80 flex flex-col items-center justify-center cursor-pointer transition-colors group relative bg-[#0d1117]"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={48} className="text-slate-500 group-hover:text-cyan-500 mb-4 group-hover:-translate-y-2 transition-all" />
          <p className="text-slate-400 font-bold group-hover:text-white transition-colors">THẢ FILE CV VÀO ĐÂY</p>
          <p className="text-xs text-slate-600 mt-2">Hỗ trợ PDF, DOCX, Ảnh, Markdown</p>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        </div>
      ) : (
        <div className="relative flex-1 min-h-[200px] md:min-h-[320px] rounded-lg border border-cyan-500/30 bg-black flex items-center justify-center group overflow-hidden">
          {filePreview ? (
             <img src={filePreview} alt="CV Preview" className="h-full w-full object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
          ) : (
             <div className="flex flex-col items-center text-cyan-400">
                <FileText size={80} className="mb-4 opacity-80" />
                <p className="font-bold text-lg">{file.name}</p>
                <p className="text-sm opacity-60">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
             </div>
          )}
          
          {isScanning && (
            <>
              <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-[scan_2s_ease-in-out_infinite]" />
              <div className="absolute inset-0 bg-cyan-900/20 pointer-events-none" />
            </>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-col md:flex-row gap-4">
        {file && !isScanning && !reviewResult && !rewriteResult && (
          <>
            <button 
              onClick={() => startProcess('review')}
              className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-3 rounded-xl hover:from-red-500 hover:to-orange-500 transition-all flex justify-center items-center gap-2 active:scale-95 shadow-lg shadow-red-900/20 uppercase text-sm tracking-wider"
            >
              <Scan size={18} /> Khám Điền Thổ
            </button>
            <button 
              onClick={() => startProcess('rewrite')}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 rounded-xl hover:from-cyan-500 hover:to-blue-500 transition-all flex justify-center items-center gap-2 active:scale-95 shadow-lg shadow-cyan-900/20 uppercase text-sm tracking-wider"
            >
              <FileText size={18} /> Tự Viết Mới CV
            </button>
          </>
        )}
        {file && (
          <button 
            onClick={reset}
            disabled={isScanning}
            className="md:px-6 bg-[#1f2937] text-slate-300 font-bold py-3 rounded-xl hover:bg-[#374151] border border-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm"
          >
            Đổi CV Mới
          </button>
        )}
      </div>
    </div>
  );

  const renderReviewResult = () => {
    if (!reviewResult) return null;
    return (
      <div className="bg-[#0b0f19] border border-red-500/30 rounded-xl p-6 md:p-8 shadow-[0_0_40px_rgba(239,68,68,0.1)] flex flex-col animate-[fade-in_0.5s_ease-out] relative">
        <h3 className="text-xl font-black text-red-500 uppercase flex items-center gap-2 mb-6 border-b border-red-500/20 pb-4">
          <AlertTriangle /> BIÊN BẢN HẠ NHỤC CV
        </h3>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-center md:items-stretch">
           <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl flex flex-col items-center justify-center shrink-0 w-48 shadow-inner">
              <span className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-2">ĐIỂM CHUYÊN NGHIỆP</span>
              <span className="text-6xl font-black text-red-500">{reviewResult.score}<span className="text-2xl text-red-500/50">/100</span></span>
              <span className="mt-2 text-red-400 font-bold bg-red-500/20 px-3 py-1 rounded-full text-xs">Level: {reviewResult.level}</span>
           </div>
           
           <div className="flex-1 bg-[#161b22] border border-slate-800 rounded-2xl p-6">
              <h4 className="text-sm text-cyan-500 font-bold uppercase tracking-wider mb-2">ĐÁNH GIÁ TỔNG QUAN TỪ HR:</h4>
              <p className="text-slate-300 italic leading-relaxed text-lg">"{reviewResult.overall}"</p>
           </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
           <div>
               <h4 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-rose-500">
                 <AlertTriangle size={16} /> DANH SÁCH LỖI (CRITIQUES)
               </h4>
               <div className="space-y-3">
                 {reviewResult.critiques?.map((item, idx) => (
                   <div key={idx} className="bg-rose-950/20 border border-rose-900/50 p-4 rounded-xl">
                      <p className="text-rose-400 font-bold text-sm mb-1">{item.issue}</p>
                      <p className="text-slate-400 text-sm">💡 Fix: {item.advice}</p>
                   </div>
                 ))}
               </div>
           </div>
           <div>
               <h4 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-emerald-500">
                 <CheckCircle2 size={16} /> ĐIỂM SÁNG VỚT VÁT
               </h4>
               <div className="space-y-3">
                 {reviewResult.strengths?.map((item, idx) => (
                   <div key={idx} className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl flex items-start gap-3">
                      <span className="text-emerald-500 mt-1">•</span>
                      <p className="text-slate-300 text-sm leading-relaxed">{item}</p>
                   </div>
                 ))}
               </div>
           </div>
        </div>
      </div>
    );
  };

  const renderRewriteResult = () => {
    if (!rewriteResult) return null;
    return (
      <div className="bg-[#0b0f19] border border-cyan-500/30 rounded-xl shadow-[0_0_40px_rgba(34,211,238,0.1)] flex flex-col animate-[fade-in_0.5s_ease-out] overflow-hidden" style={{ minHeight: activeTab === 'preview' ? '800px' : '600px' }}>
        
        {/* Tab Header */}
        <div className="flex bg-[#161b22] border-b border-slate-800 shrink-0">
           <button 
             onClick={() => setActiveTab('preview')}
             className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'preview' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20' : 'text-slate-500 hover:bg-slate-800'}`}
           >
             <Eye size={18} /> Normal Mode (Sửa & In PDF)
           </button>
           <button 
             onClick={() => setActiveTab('raw')}
             className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'raw' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20' : 'text-slate-500 hover:bg-slate-800'}`}
           >
             <Code size={18} /> Dev Mode (Markdown)
           </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 bg-[#0d1117] h-full">
           {activeTab === 'preview' ? (
              <EditableCV data={rewriteResult} onChange={setRewriteResult} />
           ) : (
              <div className="flex flex-col md:flex-row h-full">
                  <div className="flex-1 border-r border-slate-800 min-h-[300px]">
                     <TextareaAutosize
                       value={devMarkdown}
                       onChange={(e) => setDevMarkdown(e.target.value)}
                       className="w-full h-full min-h-full bg-transparent text-cyan-100 font-mono p-6 resize-none focus:outline-none focus:ring-0 leading-relaxed text-sm lg:text-base placeholder-slate-700 custom-scrollbar"
                       placeholder="Nhập mã Markdown vào đây..."
                     />
                  </div>
                  <div className="flex-1 bg-slate-50 prose prose-slate p-8 text-slate-800 custom-scrollbar overflow-auto min-h-[300px]">
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>
                       {devMarkdown}
                     </ReactMarkdown>
                  </div>
              </div>
           )}
        </div>
        
        {/* Actions Footer - Only for Dev Mode */}
        {activeTab === 'raw' && (
           <div className="bg-[#161b22] p-4 border-t border-slate-800 flex justify-end gap-4 shrink-0">
              <button 
                onClick={() => {
                   navigator.clipboard.writeText(devMarkdown);
                   toast.success("Đã copy toàn bộ mã Markdown !");
                }}
                className="px-6 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 font-bold rounded-lg border border-cyan-500/50 transition-all text-sm"
              >
                📋 COPY TEXT CHUẨN MARKDOWN
              </button>
           </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 py-12 px-4 md:px-8 overflow-x-hidden">
       <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto">
         {/* HEADER */}
         <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-slate-400 hover:text-cyan-500 transition-colors p-3 bg-[#161b22] rounded-xl border border-slate-800 shadow-xl">
              <CornerUpLeft size={24} />
            </Link>
            <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase tracking-widest flex items-center gap-3">
              <File size={32} className="text-cyan-500 hidden md:block" /> CỨU RỖI CV CHẤP VÁ
            </h1>
          </div>
          <p className="text-slate-400 max-w-sm text-xs md:text-sm text-right border-r-4 border-cyan-500 pr-4 hidden md:block italic">
            "Sức mạnh AI phân tích và tự động viết lại chiếc CV phèn chúa của bạn thành tuyệt tác Thung lũng Silicon."
          </p>
        </div>

        <div className={`grid gap-8 transition-all duration-500 items-start ${reviewResult || rewriteResult ? 'lg:grid-cols-[1fr_2.5fr]' : 'max-w-3xl mx-auto'}`}>
           
           {/* CỘT UPLOADER (Trái) */}
           <div className={`flex flex-col gap-6 ${(!reviewResult && !rewriteResult) ? 'w-full' : 'sticky top-8'}`}>
              {renderUploader()}
              
              {/* Terminal Logs hiển thị khi đang scan */}
              {isScanning && (
                 <div className="bg-black border border-slate-800 rounded-xl p-4 font-mono text-sm shadow-xl animate-[fade-in_0.3s]">
                    <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
                       <div className="w-3 h-3 rounded-full bg-red-500" />
                       <div className="w-3 h-3 rounded-full bg-yellow-500" />
                       <div className="w-3 h-3 rounded-full bg-green-500" />
                       <span className="ml-2 text-slate-500 font-bold tracking-widest text-xs">HR_CONSOLE.exe</span>
                    </div>
                    <div className="text-green-400 space-y-1 h-32 overflow-y-auto text-xs">
                        {logs.map((L, i) => <div key={i}>{`> ${L}`}</div>)}
                        <div className="h-1 w-full bg-slate-900 rounded-full mt-3 overflow-hidden">
                           <div className="h-full bg-cyan-400 transition-all" style={{width: `${scanProgress}%`}} />
                        </div>
                    </div>
                 </div>
              )}
           </div>

           {/* CỘT KẾT QUẢ (Phải) */}
           {(reviewResult || rewriteResult) && (
              <div className="w-full">
                 {currentMode === 'review' ? renderReviewResult() : renderRewriteResult()}
              </div>
           )}

        </div>

      </div>
    </div>
  );
};
