import React, { useState, useEffect } from 'react';
import { getPets, deletePet } from '../api';
import { Trash2, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

export const Pets = () => {
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPets = async () => {
        try {
            setLoading(true);
            const data = await getPets();
            setPets(data);
        } catch (error) {
            console.error("Failed to fetch pets", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPets();
    }, []);

    const handleDelete = async (petId: number, petName: string) => {
        if (window.confirm(`⚠️ Nguy hiểm: Bạn có chắc chắn muốn XÓA VĨNH VIỄN sinh vật "${petName}" khỏi cơ sở dữ liệu? Hành động này không thể hoàn tác!`)) {
            try {
                await deletePet(petId);
                setPets(prev => prev.filter(p => p.id !== petId));
            } catch (error) {
                console.error("Failed to delete pet", error);
                alert("Lỗi khi xóa pet. Xem console.");
            }
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500 animate-pulse">Đang tải dữ liệu sinh vật...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                     <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="text-purple-500" /> Quản Lý Sinh Vật (Pet)
                     </h1>
                     <p className="text-slate-500 mt-1">Quản lý và giám sát tất cả sinh vật đang được nuôi dưỡng bởi user.</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                    Tổng cộng: {pets.length} Pet
                </div>
            </div>

            {pets.length === 0 ? (
                 <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
                     <AlertCircle className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                     <h3 className="text-lg font-medium text-slate-900 dark:text-white">Chưa có Sinh Vật Nào</h3>
                     <p className="text-slate-500">Chưa có người dùng nào ấp trứng sinh vật.</p>
                 </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pets.map((pet) => {
                        const stats = JSON.parse(pet.stats || '{}');
                        
                        return (
                            <div key={pet.id} className="relative group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 flex flex-col">
                                <div className="h-48 overflow-hidden bg-slate-100 dark:bg-slate-900 relative">
                                    {pet.imageData ? (
                                        <img src={pet.imageData} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                                    )}
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <span className="bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10 uppercase tracking-wider">
                                            {pet.rarity}
                                        </span>
                                        <span className="bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10 uppercase tracking-wider">
                                            Hệ {pet.element}
                                        </span>
                                    </div>
                                    
                                    {/* Action overlay */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <button 
                                            onClick={() => handleDelete(pet.id, pet.name)}
                                            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl flex justify-center items-center gap-2 text-sm font-bold shadow-lg"
                                        >
                                            <Trash2 size={16} /> Tịch thu / Xóa
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white truncate">{pet.name}</h3>
                                        <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold px-2 py-1 rounded-lg shrink-0">
                                            Lv.{pet.level}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">{pet.description}</p>
                                    
                                    <div className="mt-auto space-y-4">
                                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
                                             <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-200 dark:border-slate-700 pb-2">Chủ Sở Hữu</div>
                                             <div className="flex items-center gap-3">
                                                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
                                                     {pet.ownerNickname?.charAt(0) || '?'}
                                                 </div>
                                                 <div>
                                                     <div className="text-sm font-bold text-slate-900 dark:text-white">{pet.ownerNickname}</div>
                                                     <div className="text-xs text-slate-500 font-mono">{pet.ownerId}</div>
                                                 </div>
                                             </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className="bg-red-50 dark:bg-red-900/20 py-2 rounded-xl border border-red-100 dark:border-red-900/30">
                                                <div className="text-[10px] uppercase font-bold text-red-500">HP</div>
                                                <div className="font-black text-slate-800 dark:text-slate-200">{stats.hp || 0}</div>
                                            </div>
                                            <div className="bg-orange-50 dark:bg-orange-900/20 py-2 rounded-xl border border-orange-100 dark:border-orange-900/30">
                                                <div className="text-[10px] uppercase font-bold text-orange-500">ATK</div>
                                                <div className="font-black text-slate-800 dark:text-slate-200">{stats.atk || 0}</div>
                                            </div>
                                            <div className="bg-blue-50 dark:bg-blue-900/20 py-2 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                                <div className="text-[10px] uppercase font-bold text-blue-500">DEF</div>
                                                <div className="font-black text-slate-800 dark:text-slate-200">{stats.def || 0}</div>
                                            </div>
                                        </div>
                                        
                                        <div className="text-xs text-slate-400 text-center uppercase tracking-widest font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
                                             Hatched: {new Date(pet.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
