import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Download, Edit3, Mail, Phone, ExternalLink, MapPin } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';

export interface CVData {
  personalInfo: { fullName: string; title: string; email: string; phone: string; portfolio: string; summary: string };
  experience: { company: string; role: string; duration: string; description: string }[];
  education: { school: string; degree: string; duration: string; gpa: string }[];
  skills: string[];
  projects: { name: string; duration: string; description: string }[];
}

interface Props {
  data: CVData;
  onChange: (data: CVData) => void;
}

export const EditableCV: React.FC<Props> = ({ data, onChange }) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const updateField = (section: keyof CVData, field: string, value: string, index?: number) => {
    const newData = { ...data };
    if (section === 'personalInfo') {
      newData.personalInfo = { ...newData.personalInfo, [field]: value };
    } else if (section === 'experience' && index !== undefined) {
      newData.experience[index] = { ...newData.experience[index], [field]: value };
    } else if (section === 'education' && index !== undefined) {
      newData.education[index] = { ...newData.education[index], [field]: value };
    } else if (section === 'projects' && index !== undefined) {
      newData.projects[index] = { ...newData.projects[index], [field]: value };
    } else if (section === 'skills' && index !== undefined) {
      newData.skills[index] = value;
    }
    onChange(newData);
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    pageStyle: "@page { size: A4; margin: 0; } @media print { body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; } }"
  });

  // Base input styles for edit mode vs print mode
  const inputClass = "bg-transparent border-none outline-none focus:bg-slate-100 hover:bg-slate-50 transition-colors rounded-sm print:bg-transparent print:p-0";
  const textareaClass = "w-full bg-transparent border-none outline-none focus:bg-slate-100 hover:bg-slate-50 transition-colors resize-none rounded-sm leading-relaxed print:bg-transparent print:p-0";

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl relative">
      <div className="bg-[#161b22] p-4 flex justify-between items-center border-b border-slate-800 shrink-0">
        <h3 className="text-cyan-400 font-bold flex items-center gap-2">
          <Edit3 size={18} /> Giao diện Sửa CV Premium (Silicon Valley Style)
        </h3>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2.5 rounded-lg font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] text-sm transition-all active:scale-95 uppercase tracking-wider"
        >
          <Download size={16} /> TẢI XUỐNG PDF ĐẸP MẮT
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-slate-800 p-4 md:p-8 flex justify-center custom-scrollbar">
        {/* KHUNG A4 */}
        <div 
          ref={componentRef} 
          className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-800 shadow-2xl relative print:shadow-none print:m-0 font-sans"
        >
          {/* Header Area */}
          <div className="px-10 py-10 bg-[#f8fafc] border-b-4 border-slate-800 flex flex-col items-center text-center print:border-slate-800">
             <input 
               className={`text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter text-center w-full mb-2 ${inputClass} p-2`}
               value={data.personalInfo?.fullName || ''}
               onChange={(e) => updateField('personalInfo', 'fullName', e.target.value)}
               placeholder="NGUYỄN VĂN A"
             />
             <input 
               className={`text-xl font-medium text-emerald-700 tracking-widest uppercase mb-4 text-center w-full ${inputClass} p-1`}
               value={data.personalInfo?.title || ''}
               onChange={(e) => updateField('personalInfo', 'title', e.target.value)}
               placeholder="VỊ TRÍ ỨNG TUYỂN"
             />
             
             {/* Contact Grid */}
             <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-600">
               <div className="flex items-center gap-1.5"><Mail size={14} className="text-emerald-600"/> <input className={`${inputClass} w-[220px]`} value={data.personalInfo?.email || ''} onChange={(e) => updateField('personalInfo', 'email', e.target.value)} placeholder="Email address" /></div>
               <div className="flex items-center gap-1.5"><Phone size={14} className="text-emerald-600"/> <input className={`${inputClass} w-[140px]`} value={data.personalInfo?.phone || ''} onChange={(e) => updateField('personalInfo', 'phone', e.target.value)} placeholder="Phone number" /></div>
               <div className="flex items-center gap-1.5"><ExternalLink size={14} className="text-emerald-600"/> <input className={`${inputClass} min-w-[250px]`} value={data.personalInfo?.portfolio || ''} onChange={(e) => updateField('personalInfo', 'portfolio', e.target.value)} placeholder="LinkedIn / GitHub / Portfolio" /></div>
             </div>
          </div>

          <div className="p-10 grid grid-cols-1 md:grid-cols-[2.5fr_1.2fr] gap-x-12 gap-y-10">
            {/* CỘT CHÍNH (Kinh nghiệm & Dự án) */}
            <div className="flex flex-col gap-8">
              {/* Summary */}
              <section>
                <h2 className="text-sm font-bold uppercase text-slate-400 tracking-[0.2em] mb-3 border-b border-slate-200 pb-2">Professional Summary</h2>
                <TextareaAutosize 
                  className={`${textareaClass} text-[14.5px] text-slate-700 font-medium text-justify`}
                  value={data.personalInfo?.summary || ''}
                  onChange={(e) => updateField('personalInfo', 'summary', e.target.value)}
                  placeholder="Viết một đoạn ngắn giới thiệu bản thân siêu ngầu vào đây..."
                />
              </section>

               {/* Experience */}
               <section>
                <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
                  <h2 className="text-sm font-bold uppercase text-slate-400 tracking-[0.2em]">Experience</h2>
                  <button onClick={() => onChange({...data, experience: [...(data.experience || []), {company:'', role:'', duration:'', description:''}]})} className="text-emerald-600 text-[10px] font-bold uppercase hover:bg-emerald-50 px-2 py-1 rounded print:hidden">+ Add Job</button>
                </div>
                <div className="flex flex-col gap-6">
                  {data.experience?.map((exp, idx) => (
                    <div key={idx} className="relative group/item">
                      <button onClick={() => { const newExp = [...data.experience]; newExp.splice(idx, 1); onChange({...data, experience: newExp}); }} className="absolute -left-8 top-1 text-red-500 opacity-0 group-hover/item:opacity-100 print:hidden text-lg leading-none" title="Xoá">&times;</button>
                      
                      <div className="flex justify-between items-baseline mb-0.5">
                        <input className={`font-black uppercase text-slate-800 flex-1 text-[15px] ${inputClass}`} value={exp.role} onChange={(e) => updateField('experience', 'role', e.target.value, idx)} placeholder="Job Title" />
                        <input className={`text-xs font-bold text-slate-500 text-right w-36 ${inputClass}`} value={exp.duration} onChange={(e) => updateField('experience', 'duration', e.target.value, idx)} placeholder="MM/YY - MM/YY" />
                      </div>
                      
                      <input className={`text-[14px] font-bold text-emerald-700 mb-2 w-full uppercase ${inputClass}`} value={exp.company} onChange={(e) => updateField('experience', 'company', e.target.value, idx)} placeholder="Company Name" />
                      
                      <TextareaAutosize 
                        className={`${textareaClass} text-[13.5px] text-slate-700 whitespace-pre-line min-h-[40px]`}
                        value={exp.description} onChange={(e) => updateField('experience', 'description', e.target.value, idx)} placeholder="- Thành tựu 1 (Nên có số liệu rõ ràng)&#10;- Thành tựu 2"
                      />
                    </div>
                  ))}
                  {(!data.experience || data.experience.length === 0) && <p className="text-xs text-slate-400 italic">No experience added.</p>}
                </div>
              </section>

              {/* Projects */}
              <section>
                <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
                  <h2 className="text-sm font-bold uppercase text-slate-400 tracking-[0.2em]">Projects</h2>
                  <button onClick={() => onChange({...data, projects: [...(data.projects || []), {name:'', duration:'', description:''}]})} className="text-emerald-600 text-[10px] font-bold uppercase hover:bg-emerald-50 px-2 py-1 rounded print:hidden">+ Add Project</button>
                </div>
                <div className="flex flex-col gap-6">
                  {data.projects?.map((proj, idx) => (
                    <div key={idx} className="relative group/item">
                      <button onClick={() => { const newProj = [...data.projects]; newProj.splice(idx, 1); onChange({...data, projects: newProj}); }} className="absolute -left-8 top-1 text-red-500 opacity-0 group-hover/item:opacity-100 print:hidden text-lg leading-none" title="Xoá">&times;</button>
                      
                      <div className="flex justify-between items-baseline mb-1">
                        <input className={`font-bold text-slate-800 flex-1 text-[15px] ${inputClass}`} value={proj.name} onChange={(e) => updateField('projects', 'name', e.target.value, idx)} placeholder="Tên dự án nổi bật" />
                        <input className={`text-xs font-bold text-slate-500 text-right w-24 ${inputClass}`} value={proj.duration} onChange={(e) => updateField('projects', 'duration', e.target.value, idx)} placeholder="Timeline" />
                      </div>
                      
                      <TextareaAutosize 
                        className={`${textareaClass} text-[13.5px] text-slate-700 whitespace-pre-line min-h-[40px]`}
                        value={proj.description} onChange={(e) => updateField('projects', 'description', e.target.value, idx)} placeholder="- Hệ thống dùng tech gì...&#10;- Giải quyết bài toán gì..."
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* CỘT PHỤ (Học Vấn & Kỹ năng) */}
            <div className="flex flex-col gap-8">
               {/* Skills */}
               <section>
                <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
                  <h2 className="text-sm font-bold uppercase text-slate-400 tracking-[0.2em]">Skills</h2>
                  <button onClick={() => onChange({...data, skills: [...(data.skills || []), '']})} className="text-emerald-600 text-[10px] font-bold uppercase hover:bg-emerald-50 px-2 py-1 rounded print:hidden">+ Thêm</button>
                </div>
                <div className="flex flex-col gap-1.5">
                  {data.skills?.map((skill, idx) => (
                    <div key={idx} className="relative group/item flex items-start">
                      <span className="text-emerald-600 mr-2 mt-1.5 text-xs font-black">❯</span>
                      <TextareaAutosize className={`${textareaClass} flex-1 text-[13.5px] font-medium text-slate-700 -mt-0.5`} value={skill} onChange={(e) => updateField('skills', 'skill', e.target.value, idx)} placeholder="Eg: React.js, Node.js" />
                      <button onClick={() => { const newSkills = [...data.skills]; newSkills.splice(idx, 1); onChange({...data, skills: newSkills}); }} className="absolute -right-6 top-0 text-red-500 opacity-0 group-hover/item:opacity-100 print:hidden text-lg leading-none" title="Xoá">&times;</button>
                    </div>
                  ))}
                  {(!data.skills || data.skills.length === 0) && <p className="text-xs text-slate-400 italic">No skills added.</p>}
                </div>
              </section>

               {/* Education */}
               <section>
                <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
                  <h2 className="text-sm font-bold uppercase text-slate-400 tracking-[0.2em]">Education</h2>
                  <button onClick={() => onChange({...data, education: [...(data.education || []), {school:'', degree:'', duration:'', gpa:''}]})} className="text-emerald-600 text-[10px] font-bold uppercase hover:bg-emerald-50 px-2 py-1 rounded print:hidden">+ Thêm</button>
                </div>
                <div className="flex flex-col gap-5">
                  {data.education?.map((edu, idx) => (
                    <div key={idx} className="relative group/item">
                      <button onClick={() => { const newEdu = [...data.education]; newEdu.splice(idx, 1); onChange({...data, education: newEdu}); }} className="absolute -left-8 top-1 text-red-500 opacity-0 group-hover/item:opacity-100 print:hidden text-lg leading-none" title="Xoá">&times;</button>
                      <input className={`font-bold text-slate-800 text-[14px] w-full ${inputClass}`} value={edu.school} onChange={(e) => updateField('education', 'school', e.target.value, idx)} placeholder="University Name" />
                      <input className={`text-[13px] font-medium italic text-slate-600 w-full mb-1 ${inputClass}`} value={edu.degree} onChange={(e) => updateField('education', 'degree', e.target.value, idx)} placeholder="Degree / Major" />
                      <div className="text-[12px] text-slate-500 font-bold flex flex-col gap-0.5">
                        <input className={`${inputClass} w-full`} value={edu.duration} onChange={(e) => updateField('education', 'duration', e.target.value, idx)} placeholder="Timeline" />
                        <div className="flex items-center gap-1">GPA: <input className={`${inputClass} w-16`} value={edu.gpa} onChange={(e) => updateField('education', 'gpa', e.target.value, idx)} placeholder="4.0" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
