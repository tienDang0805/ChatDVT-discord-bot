import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Download, Edit3, Mail, Phone, ExternalLink, Info } from 'lucide-react';
import ContentEditable from 'react-contenteditable';

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
    pageStyle: `
      @page { size: A4 portrait; margin: 0; }
      @media print { 
        html, body { width: 210mm; height: 297mm; margin: 0; padding: 0; background: white; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
    `
  });

  const inputClass = "bg-transparent border-none outline-none focus:bg-slate-100/80 hover:bg-slate-50 transition-colors rounded-sm print:bg-transparent print:p-0";
  const rteClass = "w-full bg-transparent border-none outline-none focus:bg-slate-100/80 hover:bg-slate-50 transition-colors rounded-sm leading-[1.6] print:bg-transparent print:p-0 min-h-[20px] whitespace-pre-wrap";

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-[16px] overflow-hidden shadow-2xl relative">
      <div className="bg-[#161b22] px-6 py-4 flex justify-between items-center border-b border-slate-800 shrink-0">
        <div className="flex flex-col gap-1">
           <h3 className="text-cyan-400 font-bold flex items-center gap-2">
             <Edit3 size={18} /> Khám Điền Thổ 4.0 - Rich Text Resume
           </h3>
           <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 opacity-80">
             <Info size={12} /> Bôi đen chữ rồi ấn <b>Ctrl+B</b> hoặc <b>Ctrl+I</b> để định dạng chuyên nghiệp!
           </p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white px-6 py-2.5 rounded-lg font-black shadow-[0_4px_20px_rgba(16,185,129,0.2)] text-sm transition-all active:scale-95 uppercase tracking-widest"
        >
          <Download size={16} /> DOWNLOAD PDF
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-slate-800 p-4 xl:p-12 flex justify-center custom-scrollbar">
        {/* KHUNG A4 VỚI KÍCH THƯỚC TUYỆT ĐỐI */}
        <div 
          ref={componentRef} 
          className="bg-white text-slate-800 shadow-2xl relative print:shadow-none font-sans mx-auto overflow-hidden"
          style={{ width: '210mm', minHeight: '297mm', maxWidth: '210mm' }}
        >
          {/* Header Area */}
          <div className="px-12 py-12 bg-slate-50 border-b-[5px] border-slate-900 flex flex-col items-center text-center">
             <input 
               className={`text-[42px] font-black text-slate-900 uppercase tracking-tighter text-center w-full mb-1 ${inputClass} p-1`}
               value={data.personalInfo?.fullName || ''}
               onChange={(e) => updateField('personalInfo', 'fullName', e.target.value)}
               placeholder="NGUYỄN VĂN A"
             />
             <input 
               className={`text-[17px] font-black text-emerald-700 tracking-[0.2em] uppercase mb-5 text-center w-full ${inputClass} p-1`}
               value={data.personalInfo?.title || ''}
               onChange={(e) => updateField('personalInfo', 'title', e.target.value)}
               placeholder="VỊ TRÍ ỨNG TUYỂN"
             />
             
             <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13.5px] font-semibold text-slate-600">
               <div className="flex items-center gap-1.5"><Mail size={13} className="text-emerald-600" strokeWidth={3}/> <input className={`${inputClass} w-[200px]`} value={data.personalInfo?.email || ''} onChange={(e) => updateField('personalInfo', 'email', e.target.value)} placeholder="Email" /></div>
               <div className="flex items-center gap-1.5"><Phone size={13} className="text-emerald-600" strokeWidth={3}/> <input className={`${inputClass} w-[130px]`} value={data.personalInfo?.phone || ''} onChange={(e) => updateField('personalInfo', 'phone', e.target.value)} placeholder="Phone" /></div>
               <div className="flex items-center gap-1.5"><ExternalLink size={13} className="text-emerald-600" strokeWidth={3}/> <input className={`${inputClass} min-w-[260px]`} value={data.personalInfo?.portfolio || ''} onChange={(e) => updateField('personalInfo', 'portfolio', e.target.value)} placeholder="LinkedIn / GitHub / Portfolio" /></div>
             </div>
          </div>

          <div className="p-12 grid grid-cols-[2.6fr_1fr] gap-x-12">
            {/* CỘT CHÍNH */}
            <div className="flex flex-col gap-9">
              {/* Summary */}
              <section>
                <h2 className="text-[14px] font-black uppercase text-slate-300 tracking-[0.25em] mb-3 border-b-2 border-slate-100 pb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/> SUMMARY
                </h2>
                <ContentEditable 
                  html={data.personalInfo?.summary || ''}
                  onChange={(e) => updateField('personalInfo', 'summary', e.target.value)}
                  className={`${rteClass} text-[14px] text-slate-800 font-medium text-justify`}
                  tagName="div"
                />
              </section>

               {/* Experience */}
               <section>
                <div className="flex justify-between items-center mb-5 border-b-2 border-slate-100 pb-2">
                  <h2 className="text-[14px] font-black uppercase text-slate-300 tracking-[0.25em] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/> EXPERIENCE
                  </h2>
                  <button onClick={() => onChange({...data, experience: [...(data.experience || []), {company:'', role:'', duration:'', description:''}]})} className="text-emerald-600 text-[10px] font-bold uppercase hover:bg-emerald-50 px-2 py-1 rounded print:hidden">+ Add Job</button>
                </div>
                <div className="flex flex-col gap-7">
                  {data.experience?.map((exp, idx) => (
                    <div key={idx} className="relative group/item">
                      <button onClick={() => { const newExp = [...data.experience]; newExp.splice(idx, 1); onChange({...data, experience: newExp}); }} className="absolute -left-8 top-1 text-red-500 opacity-0 group-hover/item:opacity-100 print:hidden text-lg leading-none" title="Xoá">&times;</button>
                      
                      <div className="flex justify-between items-baseline mb-0.5">
                        <input className={`font-black uppercase text-slate-900 flex-1 text-[15px] ${inputClass}`} value={exp.role} onChange={(e) => updateField('experience', 'role', e.target.value, idx)} placeholder="Job Title" />
                        <input className={`text-[12px] font-bold text-slate-400 text-right w-36 ${inputClass}`} value={exp.duration} onChange={(e) => updateField('experience', 'duration', e.target.value, idx)} placeholder="MM/YYYY - MM/YYYY" />
                      </div>
                      
                      <input className={`text-[14px] font-bold text-emerald-700 mb-2.5 w-full ${inputClass}`} value={exp.company} onChange={(e) => updateField('experience', 'company', e.target.value, idx)} placeholder="Company Name" />
                      
                      <ContentEditable 
                        html={exp.description}
                        onChange={(e) => updateField('experience', 'description', e.target.value, idx)}
                        className={`${rteClass} text-[13.5px] text-slate-700 font-medium`}
                        tagName="div"
                      />
                    </div>
                  ))}
                  {(!data.experience || data.experience.length === 0) && <p className="text-xs text-slate-400 italic">No experience added.</p>}
                </div>
              </section>

              {/* Projects */}
              <section>
                <div className="flex justify-between items-center mb-5 border-b-2 border-slate-100 pb-2">
                  <h2 className="text-[14px] font-black uppercase text-slate-300 tracking-[0.25em] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/> PROJECTS
                  </h2>
                  <button onClick={() => onChange({...data, projects: [...(data.projects || []), {name:'', duration:'', description:''}]})} className="text-emerald-600 text-[10px] font-bold uppercase hover:bg-emerald-50 px-2 py-1 rounded print:hidden">+ Add Project</button>
                </div>
                <div className="flex flex-col gap-6">
                  {data.projects?.map((proj, idx) => (
                    <div key={idx} className="relative group/item">
                      <button onClick={() => { const newProj = [...data.projects]; newProj.splice(idx, 1); onChange({...data, projects: newProj}); }} className="absolute -left-8 top-1 text-red-500 opacity-0 group-hover/item:opacity-100 print:hidden text-lg leading-none" title="Xoá">&times;</button>
                      
                      <div className="flex justify-between items-baseline mb-1">
                        <input className={`font-black text-slate-900 flex-1 text-[15px] ${inputClass}`} value={proj.name} onChange={(e) => updateField('projects', 'name', e.target.value, idx)} placeholder="Project Name" />
                        <input className={`text-[12px] font-bold text-slate-400 text-right w-24 ${inputClass}`} value={proj.duration} onChange={(e) => updateField('projects', 'duration', e.target.value, idx)} placeholder="Timeline" />
                      </div>
                      
                      <ContentEditable 
                        html={proj.description}
                        onChange={(e) => updateField('projects', 'description', e.target.value, idx)}
                        className={`${rteClass} text-[13.5px] text-slate-700 font-medium`}
                        tagName="div"
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* CỘT PHỤ */}
            <div className="flex flex-col gap-9">
               {/* Skills */}
               <section>
                <div className="flex justify-between items-center mb-4 border-b-2 border-slate-100 pb-2">
                  <h2 className="text-[14px] font-black uppercase text-slate-300 tracking-[0.25em] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/> SKILLS
                  </h2>
                  <button onClick={() => onChange({...data, skills: [...(data.skills || []), '']})} className="text-emerald-600 text-[10px] font-bold uppercase hover:bg-emerald-50 px-2 py-1 rounded print:hidden">+ Thêm</button>
                </div>
                <div className="flex flex-col gap-2">
                  {data.skills?.map((skill, idx) => (
                    <div key={idx} className="relative group/item flex items-start">
                      <span className="text-emerald-600 mr-2 mt-1 text-[10px] font-black">▶</span>
                      <ContentEditable 
                        html={skill}
                        onChange={(e) => updateField('skills', 'skill', e.target.value, idx)}
                        className={`${rteClass} flex-1 text-[13.5px] font-bold text-slate-800 -mt-0.5`}
                        tagName="div"
                      />
                      <button onClick={() => { const newSkills = [...data.skills]; newSkills.splice(idx, 1); onChange({...data, skills: newSkills}); }} className="absolute -right-6 top-0 text-red-500 opacity-0 group-hover/item:opacity-100 print:hidden text-lg leading-none" title="Xoá">&times;</button>
                    </div>
                  ))}
                  {(!data.skills || data.skills.length === 0) && <p className="text-[12px] text-slate-400 italic">No skills added.</p>}
                </div>
              </section>

               {/* Education */}
               <section>
                <div className="flex justify-between items-center mb-4 border-b-2 border-slate-100 pb-2">
                  <h2 className="text-[14px] font-black uppercase text-slate-300 tracking-[0.25em] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/> EDUCATION
                  </h2>
                  <button onClick={() => onChange({...data, education: [...(data.education || []), {school:'', degree:'', duration:'', gpa:''}]})} className="text-emerald-600 text-[10px] font-bold uppercase hover:bg-emerald-50 px-2 py-1 rounded print:hidden">+ Thêm</button>
                </div>
                <div className="flex flex-col gap-6">
                  {data.education?.map((edu, idx) => (
                    <div key={idx} className="relative group/item">
                      <button onClick={() => { const newEdu = [...data.education]; newEdu.splice(idx, 1); onChange({...data, education: newEdu}); }} className="absolute -left-8 top-1 text-red-500 opacity-0 group-hover/item:opacity-100 print:hidden text-lg leading-none" title="Xoá">&times;</button>
                      <input className={`font-black text-slate-900 text-[13.5px] w-full ${inputClass}`} value={edu.school} onChange={(e) => updateField('education', 'school', e.target.value, idx)} placeholder="University Name" />
                      <input className={`text-[13px] font-bold italic text-slate-500 w-full mb-1.5 ${inputClass}`} value={edu.degree} onChange={(e) => updateField('education', 'degree', e.target.value, idx)} placeholder="Degree / Major" />
                      <div className="text-[12px] text-slate-400 font-bold flex flex-col gap-0.5">
                        <input className={`${inputClass} w-full`} value={edu.duration} onChange={(e) => updateField('education', 'duration', e.target.value, idx)} placeholder="Timeline" />
                        <div className="flex items-center gap-1.5">GPA: <input className={`${inputClass} w-16 text-slate-800`} value={edu.gpa} onChange={(e) => updateField('education', 'gpa', e.target.value, idx)} placeholder="4.0" /></div>
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
