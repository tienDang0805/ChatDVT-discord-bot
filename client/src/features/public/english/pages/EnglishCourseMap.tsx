import { Link } from 'react-router-dom';
import { PageShell } from '../../../../shared/components/PageShell';
import { COURSE_SKELETON, loadPreloadedUnit } from '../utils/courseGenerator';
import { getCourseState, getUnitProgress } from '../utils/courseState';
import { CheckCircle, Lock, Play, RotateCcw } from 'lucide-react';

export const EnglishCourseMap = () => {
  const state = getCourseState();

  return (
    <PageShell title="Lộ Trình Học Tập" subtitle="Học lại từ đầu với AI" backTo="/english" icon="🗺️">
      <div className="max-w-md mx-auto space-y-6 fade-up py-4">
        {COURSE_SKELETON.map((unit, index) => {
          const isCompleted = state.completedUnits.includes(unit.id);
          const isUnlocked = state.unlockedUnits.includes(unit.id);

          return (
            <div key={unit.id} className="relative">
              {index !== COURSE_SKELETON.length - 1 && (
                <div className={`absolute top-full left-8 w-1 h-6 -my-1 ${isCompleted ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
              )}
              
              <div className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all ${isUnlocked ? (isCompleted ? 'bg-orange-50 dark:bg-orange-500/5 border-orange-500' : 'bg-white dark:bg-[#1f2937] border-orange-400 shadow-md scale-105') : 'bg-slate-50 dark:bg-[#131923] border-slate-200 dark:border-slate-800 opacity-70 grayscale'}`}>
                
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isCompleted ? 'bg-orange-500 text-white' : (isUnlocked ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400')}`}>
                  {isCompleted ? <CheckCircle size={24} /> : (isUnlocked ? <Play size={24} className="ml-1" /> : <Lock size={20} />)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Unit {index + 1}</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">{unit.level}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${loadPreloadedUnit(unit.id) ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>{loadPreloadedUnit(unit.id) ? 'Local' : 'AI'}</span>
                  </div>
                  <h3 className={`font-black text-lg ${isUnlocked ? 'text-slate-800 dark:text-white' : 'text-slate-500'}`}>{unit.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{unit.topic}</p>
                  {isUnlocked && (() => {
                    const up = getUnitProgress(unit.id);
                    const done = [up.vocabDone, up.readingDone, up.grammarDone, up.conversationRead].filter(Boolean).length;
                    return done > 0 ? (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex gap-1">
                          {[up.vocabDone, up.readingDone, up.grammarDone, up.conversationRead].map((d, j) => (
                            <div key={j} className={`w-2 h-2 rounded-full ${d ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">{done}/4</span>
                      </div>
                    ) : null;
                  })()}
                  
                  {isUnlocked && (
                    <>
                      <Link to={`/english/course/${unit.id}`} className={`mt-4 block text-center py-2.5 rounded-xl font-bold transition-all active:scale-95 ${isCompleted ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600' : 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm'}`}>
                        {isCompleted ? 'Ôn tập lại' : 'Bắt đầu học'}
                      </Link>
                      {isCompleted && (() => {
                        const completedAt = state.completedAt?.[unit.id];
                        if (!completedAt) return null;
                        const daysSince = Math.floor((Date.now() - completedAt) / 86400000);
                        if (daysSince < 3) return null;
                        return (
                          <div className="flex items-center gap-1.5 mt-2 text-amber-500">
                            <RotateCcw size={12} />
                            <span className="text-[10px] font-bold">Cần ôn lại ({daysSince} ngày trước)</span>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
};

export default EnglishCourseMap;
