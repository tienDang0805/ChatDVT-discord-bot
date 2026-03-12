import React, { useState, useEffect } from 'react';
import { getPets, deletePet, addCoin, getInventory } from '../api';
import { Trash2, ShieldAlert, Sparkles, AlertCircle, Info, X, Coins, Zap, Shield, Heart } from 'lucide-react';

export const Pets = () => {
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPet, setSelectedPet] = useState<any>(null);
    const [inventoryInfo, setInventoryInfo] = useState<{money: number, items: any[]}>({ money: 0, items: [] });
    const [addCoinAmount, setAddCoinAmount] = useState<number>(1000);
    const [isAddingCoin, setIsAddingCoin] = useState(false);

    const openPetModal = async (pet: any) => {
        setSelectedPet(pet);
        try {
            const inv = await getInventory(pet.ownerId);
            setInventoryInfo(inv);
        } catch (error) {
            console.error("Failed to fetch inventory", error);
        }
    };
    
    const closePetModal = () => {
        setSelectedPet(null);
    };

    const handleAddCoin = async () => {
        if (!selectedPet) return;
        setIsAddingCoin(true);
        try {
            const res = await addCoin(selectedPet.ownerId, addCoinAmount);
            if (res.success) {
                setInventoryInfo(prev => ({ ...prev, money: res.money }));
                alert(`Đã thêm thành công! Tổng số dư mới: ${res.money} Coins`);
            }
        } catch (error) {
            console.error("Failed to add coin", error);
            alert("Lỗi khi thêm coin");
        } finally {
            setIsAddingCoin(false);
        }
    };

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
                                     <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col gap-2">
                                         <button 
                                             onClick={() => openPetModal(pet)}
                                             className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl flex justify-center items-center gap-2 text-sm font-bold shadow-lg"
                                         >
                                             <Info size={16} /> Xem Chi Tiết
                                         </button>
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

            {/* Pet Details Modal */}
            {selectedPet && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row">
                        {/* Left Side: Pet Image & Owner Info */}
                        <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-800 p-6 flex flex-col gap-6">
                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700">
                                {selectedPet.imageData ? (
                                    <img src={selectedPet.imageData} alt={selectedPet.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                        <ShieldAlert size={48} className="mb-2 opacity-50" />
                                        <span>No Image</span>
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                    <span className="bg-black/60 text-white px-3 py-1 text-xs font-bold uppercase rounded-lg backdrop-blur-md">
                                        {selectedPet.rarity}
                                    </span>
                                    <span className="bg-black/60 text-white px-3 py-1 text-xs font-bold uppercase rounded-lg backdrop-blur-md">
                                        Hệ {selectedPet.element}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Thông tin Chủ Sở Hữu</h4>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                        {selectedPet.ownerNickname?.charAt(0) || '?'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="font-bold text-slate-900 dark:text-white truncate">{selectedPet.ownerNickname}</div>
                                        <div className="text-xs text-slate-500 font-mono truncate">{selectedPet.ownerId}</div>
                                    </div>
                                </div>
                                
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl border border-yellow-100 dark:border-yellow-900/30 flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500 font-bold">
                                        <Coins size={18} /> Số dư:
                                    </div>
                                    <span className="text-lg font-black text-yellow-600 dark:text-yellow-400">{inventoryInfo.money}</span>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Nạp Coin cho User</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="number" 
                                            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 rounded-xl text-sm border-none focus:ring-2 focus:ring-purple-500"
                                            value={addCoinAmount}
                                            onChange={(e) => setAddCoinAmount(Number(e.target.value))}
                                        />
                                        <button 
                                            onClick={handleAddCoin}
                                            disabled={isAddingCoin}
                                            className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors shadow-md shadow-purple-500/20"
                                        >
                                            {isAddingCoin ? 'Đang nạp...' : 'Nạp'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Stats & Skills */}
                        <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col relative">
                            <button 
                                onClick={closePetModal}
                                className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="mb-6 pr-12">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{selectedPet.name}</h2>
                                <div className="flex items-center gap-3 text-sm font-bold">
                                    <span className="text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-lg">Cấp {selectedPet.level}</span>
                                    <span className="text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-lg">Tiến hóa Bậc {selectedPet.evolutionStage}</span>
                                    <span className="text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">EXP: {selectedPet.exp}</span>
                                </div>
                            </div>

                            <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed italic border-l-4 border-slate-200 dark:border-slate-700 pl-4">
                                "{selectedPet.lore || selectedPet.description}"
                            </p>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {(() => {
                                    const stats = JSON.parse(selectedPet.stats || '{}');
                                    return (
                                        <>
                                            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 mb-1 lg:mb-2 uppercase tracking-wide"><Heart size={14} /> HP Max</div>
                                                <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.hp || 0}</div>
                                            </div>
                                            <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/20">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500 mb-1 lg:mb-2 uppercase tracking-wide"><Zap size={14} /> Sát Thương</div>
                                                <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.atk || 0}</div>
                                            </div>
                                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500 mb-1 lg:mb-2 uppercase tracking-wide"><Shield size={14} /> Phòng Thủ</div>
                                                <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.def || 0}</div>
                                            </div>
                                            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 mb-1 lg:mb-2 uppercase tracking-wide"><Sparkles size={14} /> Tốc Độ</div>
                                                <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.spd || 0}</div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">⚔️ Kỹ Năng Đang Có</h3>
                                    <div className="space-y-3">
                                        {JSON.parse(selectedPet.skills || '[]').map((skill: any, idx: number) => (
                                            <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-slate-900 dark:text-white">{skill.name}</span>
                                                    <span className="text-xs font-black bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-lg border border-red-200 dark:border-red-900/50">DMG: {skill.power}</span>
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{skill.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">🧬 Nội Tại Thừa Kế</h3>
                                    <div className="space-y-3">
                                        {JSON.parse(selectedPet.traits || '[]').map((trait: any, idx: number) => (
                                            <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                                <div className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">{trait.name}</div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{trait.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
