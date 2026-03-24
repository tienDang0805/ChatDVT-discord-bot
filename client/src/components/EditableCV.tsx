import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Download, Edit3 } from 'lucide-react';
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
    pageStyle: "@page { size: auto; margin: 0mm; } @media print { body { -webkit-print-color-adjust: exact; } }"
  });

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl relative">
      <div className="bg-[#161b22] p-4 flex justify-between items-center border-b border-slate-800 shrink-0">
        <h3 className="text-cyan-400 font-bold flex items-center gap-2">
          <Edit3 size={18} /> Giao diện Sửa CV Trực Quan
        </h3>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg text-sm transition-all active:scale-95"
        >
          <Download size={16} /> TẢI XUỐNG PDF
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-slate-800 p-4 md:p-8 flex justify-center custom-scrollbar">
        {/* Bản CV A4 */}
        <div 
          ref={componentRef} 
          className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-800 p-8 md:p-12 shadow-2xl relative print:shadow-none print:m-0"
        >
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-6 mb-6">
            <input 
              className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight bg-transparent border-none outline-none w-full focus:bg-slate-100/50 hover:bg-slate-100/30 transition-colors"
              value={data.personalInfo?.fullName || ''}
              onChange={(e) => updateField('personalInfo', 'fullName', e.target.value)}
              placeholder="TÊN CỦA BẠN"
            />
            <input 
              className="text-xl md:text-2xl font-medium text-cyan-600 mt-2 tracking-wide bg-transparent border-none outline-none w-full focus:bg-slate-100/50 hover:bg-slate-100/30 transition-colors"
              value={data.personalInfo?.title || ''}
              onChange={(e) => updateField('personalInfo', 'title', e.target.value)}
              placeholder="Vị trí ứng tuyển"
            />
            <div className="flex flex-wrap gap-4 mt-4 text-sm font-medium text-slate-600">
              <input 
                className="bg-transparent border-none outline-none min-w-[200px] focus:bg-slate-100/50 hover:bg-slate-100/30 transition-colors"
                value={data.personalInfo?.email || ''} onChange={(e) => updateField('personalInfo', 'email', e.target.value)} placeholder="Email"
              />
              <input 
                className="bg-transparent border-none outline-none min-w-[150px] focus:bg-slate-100/50 hover:bg-slate-100/30 transition-colors"
                value={data.personalInfo?.phone || ''} onChange={(e) => updateField('personalInfo', 'phone', e.target.value)} placeholder="Số điện thoại"
              />
              <input 
                className="bg-transparent border-none outline-none min-w-[200px] focus:bg-slate-100/50 hover:bg-slate-100/30 transition-colors flex-1"
                value={data.personalInfo?.portfolio || ''} onChange={(e) => updateField('personalInfo', 'portfolio', e.target.value)} placeholder="Link Portfolio/LinkedIn"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-10">
            {/* Cột chính */}
            <div className="flex flex-col gap-8">
              {/* Summary */}
              <section>
                <h2 className="text-lg font-black uppercase text-slate-900 border-b border-slate-300 pb-2 mb-3 tracking-widest">Summary</h2>
                <TextareaAutosize 
                  className="w-full text-sm leading-relaxed text-slate-700 bg-transparent border-none outline-none focus:bg-slate-100/50 hover:bg-slate-100/30 p-1 -ml-1 resize-none"
                  value={data.personalInfo?.summary || ''}
                  onChange={(e) => updateField('personalInfo', 'summary', e.target.value)}
                  placeholder="Giới thiệu bản thân rực rỡ vào..."
                />
              </section>

               {/* Experience */}
               <section>
                <div className="flex justify-between items-end border-b border-slate-300 pb-2 mb-4">
                  <h2 className="text-lg font-black uppercase text-slate-900 tracking-widest">Experience</h2>
                  <button onClick={() => onChange({...data, experience: [...(data.experience || []), {company:'', role:'', duration:'', description:''}]})} className="text-cyan-600 text-xs font-bold hover:underline print:hidden">+ Thêm Cty</button>
                </div>
                <div className="flex flex-col gap-6">
                  {data.experience?.map((exp, idx) => (
                    <div key={idx} className="relative group/item">
                      <button onClick={() => {
                        const newExp = [...data.experience]; newExp.splice(idx, 1); onChange({...data, experience: newExp});
                      }} className="absolute -left-6 top-1 text-red-500 opacity-0 group-hover/item:opacity-100 print:hidden text-lg leading-none" title="Xoá">&times;</button>
                      <div className="flex justify-between items-baseline mb-1">
                        <input className="font-bold text-slate-900 bg-transparent outline-none flex-1 text-[15px] focus:bg-slate-100 p-1 -ml-1 mr-2" value={exp.role} onChange={(e) => updateField('experience', 'role', e.target.value, idx)} placeholder="Chức vụ" />
                        <input className="text-sm font-semibold text-cyan-600 text-right bg-transparent outline-none w-32 focus:bg-slate-100 p-1 -mr-1" value={exp.duration} onChange={(e) => updateField('experience', 'duration', e.target.value, idx)} placeholder="MM/YY - MM/YY" />
                      </div>
                      <input className="text-sm font-medium text-slate-600 mb-2 w-full bg-transparent outline-none focus:bg-slate-100 p-1 -ml-1" value={exp.company} onChange={(e) => updateField('experience', 'company', e.target.value, idx)} placeholder="Tên Công ty" />
                      <TextareaAutosize 
                        className="w-full text-[13px] leading-relaxed text-slate-700 bg-transparent border-none outline-none focus:bg-slate-100/50 hover:bg-slate-100/30 p-1 -ml-1 resize-none min-h-[40px]"
                        value={exp.description} onChange={(e) => updateField('experience', 'description', e.target.value, idx)} placeholder="- Thành tựu 1&#10;- Thành tựu 2"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Projects */}
              <section>
                <div className="flex justify-between items-end border-b border-slate-300 pb-2 mb-4">
                  <h2 className="text-lg font-black uppercase text-slate-900 tracking-widest">Projects</h2>
                  <button onClick={() => onChange({...data, projects: [...(data.projects || []), {name:'', duration:'', description:''}]})} className="text-cyan-600 text-xs font-bold hover:underline print:hidden">+ Thêm Dự án</button>
                </div>
                <div className="flex flex-col gap-6">
                  {data.projects?.map((proj, idx) => (
                    <div key={idx} className="relative group/item">
                      <button onClick={() => {
                        const newProj = [...data.projects]; newProj.splice(idx, 1); onChange({...data, projects: newProj});
                      }} className="absolute -left-6 top-1 text-red-500 opacity-0 group-hover/item:opacity-100 print:hidden text-lg leading-none" title="Xoá">&times;</button>
                      <div className="flex justify-between items-baseline mb-1">
                        <input className="font-bold text-slate-900 bg-transparent outline-none flex-1 text-[15px] focus:bg-slate-100 p-1 -ml-1 mr-2" value={proj.name} onChange={(e) => updateField('projects', 'name', e.target.value, idx)} placeholder="Tên dự án" />
                        <input className="text-sm font-semibold text-cyan-600 text-right bg-transparent outline-none w-32 focus:bg-slate-100 p-1 -mr-1" value={proj.duration} onChange={(e) => updateField('projects', 'duration', e.target.value, idx)} placeholder="Timeline" />
                      </div>
                      <TextareaAutosize 
                        className="w-full text-[13px] leading-relaxed text-slate-700 bg-transparent border-none outline-none focus:bg-slate-100/50 hover:bg-slate-100/30 p-1 -ml-1 resize-none min-h-[40px]"
                        value={proj.description} onChange={(e) => updateField('projects', 'description', e.target.value, idx)} placeholder="- Mô tả ngắn, mảng tech dùng..."
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Cột Trái (Phụ) */}
            <div className="flex flex-col gap-8">
               {/* Skills */}
               <section>
                <div className="flex justify-between items-end border-b border-slate-300 pb-2 mb-3">
                  <h2 className="text-lg font-black uppercase text-slate-900 tracking-widest">Skills</h2>
                  <button onClick={() => onChange({...data, skills: [...(data.skills || []), '']})} className="text-cyan-600 text-xs font-bold hover:underline print:hidden">+ Thêm</button>
                </div>
                <div className="flex flex-col gap-2">
                  {data.skills?.map((skill, idx) => (
                    <div key={idx} className="flex relative group/item">
                      <span className="text-cyan-600 mr-2 mt-1 font-bold">•</span>
                      <TextareaAutosize className="flex-1 text-sm font-semibold text-slate-700 bg-transparent outline-none focus:bg-slate-100 p-1 resize-none" value={skill} onChange={(e) => updateField('skills', 'skill', e.target.value, idx)} placeholder="Skill..." />
                      <button onClick={() => {
                        const newSkills = [...data.skills]; newSkills.splice(idx, 1); onChange({...data, skills: newSkills});
                      }} className="absolute -right-4 top-1 text-red-500 opacity-0 group-hover/item:opacity-100 print:hidden text-lg leading-none" title="Xoá">&times;</button>
                    </div>
                  ))}
                </div>
              </section>

               {/* Education */}
               <section>
                <div className="flex justify-between items-end border-b border-slate-300 pb-2 mb-4">
                  <h2 className="text-lg font-black uppercase text-slate-900 tracking-widest">Education</h2>
                  <button onClick={() => onChange({...data, education: [...(data.education || []), {school:'', degree:'', duration:'', gpa:''}]})} className="text-cyan-600 text-xs font-bold hover:underline print:hidden">+ Thêm</button>
                </div>
                <div className="flex flex-col gap-5">
                  {data.education?.map((edu, idx) => (
                    <div key={idx} className="relative group/item">
                      <button onClick={() => {
                        const newEdu = [...data.education]; newEdu.splice(idx, 1); onChange({...data, education: newEdu});
                      }} className="absolute -left-6 top-1 text-red-500 opacity-0 group-hover/item:opacity-100 print:hidden text-lg leading-none" title="Xoá">&times;</button>
                      <input className="font-bold text-slate-900 text-sm bg-transparent outline-none w-full focus:bg-slate-100 p-1 -ml-1" value={edu.school} onChange={(e) => updateField('education', 'school', e.target.value, idx)} placeholder="Tên Trường Đại Học" />
                      <input className="text-[13px] font-medium text-slate-700 bg-transparent outline-none w-full focus:bg-slate-100 p-1 -ml-1" value={edu.degree} onChange={(e) => updateField('education', 'degree', e.target.value, idx)} placeholder="Bằng cấp / Chuyên ngành" />
                      <div className="flex justify-between items-center text-[13px] text-slate-600 mt-1">
                        <input className="bg-transparent outline-none flex-1 focus:bg-slate-100 p-1 -ml-1 mr-2" value={edu.duration} onChange={(e) => updateField('education', 'duration', e.target.value, idx)} placeholder="Timeline" />
                        <input className="bg-transparent outline-none w-16 text-right focus:bg-slate-100 p-1 -mr-1" value={edu.gpa} onChange={(e) => updateField('education', 'gpa', e.target.value, idx)} placeholder="GPA" />
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
