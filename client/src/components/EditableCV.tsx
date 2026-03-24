import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Download, Edit3, Mail, Phone, ExternalLink, Info, LayoutTemplate, AlignLeft, PlusCircle } from 'lucide-react';
import ContentEditable from 'react-contenteditable';

export interface CVData {
  personalInfo: { fullName: string; title: string; email: string; phone: string; portfolio: string; summary: string };
  experience: { company: string; role: string; duration: string; description: string }[];
  education: { school: string; degree: string; duration: string; gpa: string }[];
  skills: string[];
  projects: { name: string; duration: string; description: string }[];
  customSections?: {
    id: string;
    title: string;
    items: { name: string; duration: string; description: string }[];
  }[];
}

interface Props {
  data: CVData;
  onChange: (data: CVData) => void;
}

type LayoutMode = '1-col' | '2-col';

export const EditableCV: React.FC<Props> = ({ data, onChange }) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<LayoutMode>('2-col');

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
        html, body { width: 210mm; min-height: 297mm; margin: 0; padding: 0; background: white; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
    `
  });

  const inputClass = "bg-transparent border-none outline-none focus:bg-slate-100/80 hover:bg-slate-50 transition-colors rounded-sm print:bg-transparent print:p-0";
  const rteClass = "w-full bg-transparent border-none outline-none focus:bg-slate-100/80 hover:bg-slate-50 transition-colors rounded-sm leading-[1.6] print:bg-transparent print:p-0 min-h-[20px] whitespace-pre-wrap";

  // --- Render Sections ---
  const renderSummary = () => (
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
  );

  const renderExperience = () => (
    <section>
      <div className="flex justify-between items-center mb-5 border-b-2 border-slate-100 pb-2">
        <h2 className="text-[14px] font-black uppercase text-slate-300 tracking-[0.25em] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/> EXPERIENCE
        </h2>
        <button onClick={() => onChange({...data, experience: [...(data.experience || []), {company:'', role:'', duration:'', description:''}]})} className="text-emerald-600 text-[10px] font-bold uppercase hover:bg-emerald-50 px-2 py-1 rounded print:hidden">+ Add Job</button>
      </div>
      <div className="flex flex-col gap-6">
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
  );

  const renderProjects = () => (
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
  );

  const renderCustomSections = () => {
    if (!data.customSections) return null;
    return (
      <>
        {data.customSections.map((section, sIdx) => (
          <section key={section.id}>
             <div className="flex justify-between items-center mb-5 border-b-2 border-slate-100 pb-2 relative group/sec transition-colors">
               <div className="flex items-center gap-2 flex-1">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0"/>
                 <input 
                   className={`text-[14px] font-black uppercase text-slate-300 tracking-[0.25em] bg-transparent border-none outline-none focus:bg-slate-50 w-full print:p-0 transition-colors rounded placeholder:font-black placeholder:text-slate-200 focus:text-slate-800`}
                   value={section.title}
                   onChange={(e) => {
                     const newData = [...data.customSections!];
                     newData[sIdx].title = e.target.value;
                     onChange({ ...data, customSections: newData });
                   }}
                   placeholder="SECTION TITLE"
                 />
               </div>
               <div className="flex items-center gap-2 opacity-0 group-hover/sec:opacity-100 print:hidden transition-opacity">
                  <button onClick={() => {
                     const newData = [...data.customSections!];
                     newData.splice(sIdx, 1);
                     onChange({ ...data, customSections: newData });
                  }} className="text-red-500 text-[10px] font-bold uppercase hover:bg-red-50 px-2 py-1 rounded border border-red-100">XÓA MỤC NÀY</button>
                  <button onClick={() => {
                     const newData = [...data.customSections!];
                     newData[sIdx].items.push({ name: '', duration: '', description: '' });
                     onChange({ ...data, customSections: newData });
                  }} className="text-emerald-600 text-[10px] font-bold uppercase hover:bg-emerald-50 px-2 py-1 rounded border border-emerald-100">+ Add Item</button>
               </div>
             </div>
             <div className="flex flex-col gap-6">
                {section.items.map((item, iIdx) => (
                   <div key={iIdx} className="relative group/item">
                      <button onClick={() => { 
                          const newData = [...data.customSections!];
                          newData[sIdx].items.splice(iIdx, 1);
                          onChange({ ...data, customSections: newData });
                      }} className="absolute -left-8 top-1 text-red-500 opacity-0 group-hover/item:opacity-100 print:hidden text-lg leading-none" title="Xoá">&times;</button>
                      
                      <div className="flex justify-between items-baseline mb-1">
                        <input className={`font-black text-slate-900 flex-1 text-[15px] ${inputClass}`} value={item.name} onChange={(e) => {
                           const newData = [...data.customSections!];
                           newData[sIdx].items[iIdx].name = e.target.value;
                           onChange({ ...data, customSections: newData });
                        }} placeholder="Headline" />
                        <input className={`text-[12px] font-bold text-slate-400 text-right w-36 ${inputClass}`} value={item.duration} onChange={(e) => {
                           const newData = [...data.customSections!];
                           newData[sIdx].items[iIdx].duration = e.target.value;
                           onChange({ ...data, customSections: newData });
                        }} placeholder="Sub-text / Timeline" />
                      </div>
                      
                      <ContentEditable 
                        html={item.description}
                        onChange={(e) => {
                           const newData = [...data.customSections!];
                           newData[sIdx].items[iIdx].description = e.target.value;
                           onChange({ ...data, customSections: newData });
                        }}
                        className={`${rteClass} text-[13.5px] text-slate-700 font-medium`}
                        tagName="div"
                      />
                   </div>
                ))}
             </div>
          </section>
        ))}
      </>
    );
  };

  const renderSkills = () => (
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
  );

  const renderEducation = () => (
    <section>
      <div className="flex justify-between items-center mb-4 border-b-2 border-slate-100 pb-2">
        <h2 className="text-[14px] font-black uppercase text-slate-300 tracking-[0.25em] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/> EDUCATION
        </h2>
        <button onClick={() => onChange({...data, education: [...(data.education || []), {school:'', degree:'', duration:'', gpa:''}]})} className="text-emerald-600 text-[10px] font-bold uppercase hover:bg-emerald-50 px-2 py-1 rounded print:hidden">+ Thêm</button>
      </div>
      <div className="flex flex-col gap-5">
        {data.education?.map((edu, idx) => (
          <div key={idx} className="relative group/item">
            <button onClick={() => { const newEdu = [...data.education]; newEdu.splice(idx, 1); onChange({...data, education: newEdu}); }} className="absolute -left-8 top-1 text-red-500 opacity-0 group-hover/item:opacity-100 print:hidden text-lg leading-none" title="Xoá">&times;</button>
            <div className="flex justify-between items-baseline mb-1">
               <input className={`font-black text-slate-900 text-[13.5px] flex-1 ${inputClass}`} value={edu.school} onChange={(e) => updateField('education', 'school', e.target.value, idx)} placeholder="University Name" />
               <input className={`text-[12px] font-bold text-slate-400 text-right w-24 ${inputClass}`} value={edu.duration} onChange={(e) => updateField('education', 'duration', e.target.value, idx)} placeholder="Timeline" />
            </div>
            <div className="flex items-center gap-2 text-[13px] font-bold italic text-slate-500">
               <input className={`flex-1 ${inputClass}`} value={edu.degree} onChange={(e) => updateField('education', 'degree', e.target.value, idx)} placeholder="Degree / Major" />
               <span className={`flex items-center gap-1 ${!edu.gpa ? 'print:hidden' : ''}`}>
                 GPA: <input className={`${inputClass} w-10 text-slate-800 not-italic`} value={edu.gpa} onChange={(e) => updateField('education', 'gpa', e.target.value, idx)} placeholder="4.0" />
               </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-[16px] overflow-hidden shadow-2xl relative">
      <div className="bg-[#161b22] px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 shrink-0 shadow-lg z-10">
        <div className="flex flex-col gap-1.5">
           <h3 className="text-cyan-400 font-bold flex items-center gap-2">
             <Edit3 size={18} /> Khám Điền Thổ 6.0 - Ultimate Freedom Format
           </h3>
           <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 opacity-80">
             <Info size={12} /> Bật Layout 1 cột để xem trọn vẹn. Bấm "+ Thêm Mục" ở dưới cùng CV.
           </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
           {/* Layout Toggle */}
           <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700/50">
             <button 
                onClick={() => setLayout('2-col')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${layout === '2-col' ? 'bg-slate-900 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
             >
                <LayoutTemplate size={14} /> 2-COL
             </button>
             <button 
                onClick={() => setLayout('1-col')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${layout === '1-col' ? 'bg-slate-900 text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
             >
                <AlignLeft size={14} /> 1-COL
             </button>
           </div>
           
           <button 
             onClick={handlePrint}
             className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white px-5 py-2 rounded-lg font-black shadow-[0_4px_20px_rgba(16,185,129,0.2)] text-sm transition-all active:scale-95 uppercase tracking-widest ml-auto md:ml-0"
           >
             <Download size={16} /> IN PDF
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-800 p-4 xl:p-12 flex justify-center custom-scrollbar">
        {/* KHUNG A4 VỚI KÍCH THƯỚC TUYỆT ĐỐI */}
        <div 
          ref={componentRef} 
          className="bg-white text-slate-800 shadow-2xl relative print:shadow-none font-sans mx-auto overflow-hidden pb-16"
          style={{ width: '210mm', minHeight: '297mm', maxWidth: '210mm' }}
        >
          {/* Header Area */}
          <div className="px-10 py-10 bg-slate-50 border-b-[4px] border-slate-900 flex flex-col items-center text-center">
             <input 
               className={`text-[36px] font-black text-slate-900 uppercase tracking-tighter text-center w-full mb-1 ${inputClass} p-1`}
               value={data.personalInfo?.fullName || ''}
               onChange={(e) => updateField('personalInfo', 'fullName', e.target.value)}
               placeholder="NGUYỄN VĂN A"
             />
             <input 
               className={`text-[16px] font-black text-emerald-700 tracking-[0.2em] uppercase mb-4 text-center w-full ${inputClass} p-0`}
               value={data.personalInfo?.title || ''}
               onChange={(e) => updateField('personalInfo', 'title', e.target.value)}
               placeholder="VỊ TRÍ ỨNG TUYỂN"
             />
             
             <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] font-semibold text-slate-600">
               <div className={`flex items-center gap-1.5 ${!data.personalInfo?.email && 'print:hidden'}`}><Mail size={12} className="text-emerald-600" strokeWidth={3}/> <input className={`${inputClass} w-[200px]`} value={data.personalInfo?.email || ''} onChange={(e) => updateField('personalInfo', 'email', e.target.value)} placeholder="Email" /></div>
               <div className={`flex items-center gap-1.5 ${!data.personalInfo?.phone && 'print:hidden'}`}><Phone size={12} className="text-emerald-600" strokeWidth={3}/> <input className={`${inputClass} w-[130px]`} value={data.personalInfo?.phone || ''} onChange={(e) => updateField('personalInfo', 'phone', e.target.value)} placeholder="Phone" /></div>
               <div className={`flex items-center gap-1.5 ${!data.personalInfo?.portfolio && 'print:hidden'}`}><ExternalLink size={12} className="text-emerald-600" strokeWidth={3}/> <input className={`${inputClass} min-w-[260px]`} value={data.personalInfo?.portfolio || ''} onChange={(e) => updateField('personalInfo', 'portfolio', e.target.value)} placeholder="LinkedIn / GitHub / Portfolio" /></div>
             </div>
          </div>

          <div className={`p-10 ${layout === '2-col' ? 'grid grid-cols-[2.5fr_1fr] gap-x-10' : 'flex flex-col gap-8'}`}>
            {layout === '2-col' ? (
              <>
                <div className="flex flex-col gap-8">
                  {renderSummary()}
                  {renderExperience()}
                  {renderProjects()}
                  {renderCustomSections()}
                </div>
                <div className="flex flex-col gap-8">
                  {renderSkills()}
                  {renderEducation()}
                </div>
              </>
            ) : (
              <>
                {renderSummary()}
                {renderExperience()}
                {renderProjects()}
                {renderSkills()}
                {renderEducation()}
                {renderCustomSections()}
              </>
            )}
            
            {/* Add Custom Section Button (Only unprinted & isolated from layout grids ideally, but safe here) */}
            <div className={`mt-8 flex justify-center print:hidden ${layout === '2-col' ? 'col-span-2' : ''}`}>
               <button 
                 onClick={() => {
                   const newSecs = data.customSections ? [...data.customSections] : [];
                   newSecs.push({ id: Math.random().toString(), title: 'NEW SECTION / SIDE PROJECTS', items: [{ name: '', duration: '', description: '' }] });
                   onChange({ ...data, customSections: newSecs });
                 }}
                 className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors px-6 py-3 border border-slate-300 hover:border-emerald-500 border-dashed rounded-lg"
               >
                 <PlusCircle size={16} /> Thêm Mục Tuỳ Chọn (Giải Thưởng, Tech Stack...)
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
