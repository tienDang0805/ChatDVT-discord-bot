import React, { useState, useEffect } from 'react';
import { getUsers, deleteUser, addCoin } from '../api';
import { Trash2, Users, Coins, ShieldAlert, X, Shield, Search, Zap, Heart, Info, Sparkles } from 'lucide-react';

export const UserManagement = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [addCoinAmount, setAddCoinAmount] = useState<number>(1000);
    const [isAddingCoin, setIsAddingCoin] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string, nickname: string) => {
        if (!confirm(`CẢNH BÁO: Xóa user "${nickname}" sẽ xóa TẤT CẢ Thú cưng, Túi đồ và dữ liệu cày cuốc. Bạn có chắc chắn không?`)) return;
        try {
            await deleteUser(userId);
            setUsers(users.filter(u => u.userId !== userId));
            if (selectedUser?.userId === userId) setSelectedUser(null);
            alert("Đã xóa User thành công.");
        } catch (error) {
            console.error("Failed to delete user", error);
            alert("Xóa User thất bại.");
        }
    };

    const handleAddCoin = async () => {
        if (!selectedUser) return;
        setIsAddingCoin(true);
        try {
            const res = await addCoin(selectedUser.userId, addCoinAmount);
            if (res.success) {
                // Update local state
                setUsers(users.map(u => u.userId === selectedUser.userId ? { ...u, money: res.money } : u));
                setSelectedUser({ ...selectedUser, money: res.money });
                alert(`Đã thêm thành công! Tổng số dư mới của ${selectedUser.nickname}: ${res.money} Coins`);
            }
        } catch (error) {
            console.error("Failed to add coin", error);
            alert("Lỗi khi thêm coin");
        } finally {
            setIsAddingCoin(false);
        }
    };

    const filteredUsers = users.filter(u => 
        u.nickname.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.userId.includes(searchTerm)
    );

    return (
        <div className="space-y-6 md:space-y-8 pb-12 w-full max-w-[100vw] overflow-x-hidden p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-3">
                        <Users className="text-blue-400" /> Quản Lý Người Chơi
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Theo dõi tài sản, số lượng Pet và thao tác toàn quyền trên tài khoản.</p>
                </div>
                
                <div className="relative w-full md:w-64 focus-within:w-full md:focus-within:w-80 transition-all">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Tìm nickname hoặc ID..." 
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-bold border-b border-slate-200 dark:border-slate-800">Người Chơi</th>
                                    <th className="p-4 font-bold border-b border-slate-200 dark:border-slate-800">Tài Sản</th>
                                    <th className="p-4 font-bold border-b border-slate-200 dark:border-slate-800">Quản lý Thú Cưng</th>
                                    <th className="p-4 relative border-b border-slate-200 dark:border-slate-800"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.userId} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                                                    {user.nickname.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        {user.nickname}
                                                        {user.pets.length > 0 && (
                                                            <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                                                Trainer
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-500 font-mono mt-0.5">{user.userId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 font-black">
                                                <Coins size={16} /> {user.money.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {user.pets.length > 0 ? (
                                                <div className="flex -space-x-3 hover:space-x-1 transition-all">
                                                    {user.pets.map((pet: any, idx: number) => (
                                                        idx < 3 && (
                                                            <img 
                                                                key={pet.id} 
                                                                src={pet.imageData || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"} 
                                                                alt={pet.name} 
                                                                className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 object-cover bg-slate-200 dark:bg-slate-700 relative z-10 hover:z-20 hover:scale-110 transition-transform shadow-md"
                                                                title={`${pet.name} (Lv.${pet.level})`}
                                                            />
                                                        )
                                                    ))}
                                                    {user.pets.length > 3 && (
                                                        <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 relative z-10">
                                                            +{user.pets.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Chưa sở hữu Pet</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => setSelectedUser(user)}
                                                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30 inline-flex items-center gap-2 text-sm font-medium"
                                            >
                                                <Info size={16} /> Chi Tiết
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(user.userId, user.nickname)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/30 inline-flex items-center gap-2 text-sm font-medium"
                                            >
                                                <Trash2 size={16} /> WIPE
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                     <tr>
                                         <td colSpan={4} className="p-8 text-center text-slate-500">
                                            Không tìm thấy User nào phù hợp.
                                         </td>
                                     </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* User Detail & Pet Management Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row relative">
                         
                         <button 
                             onClick={() => setSelectedUser(null)}
                             className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full transition-colors z-10"
                         >
                             <X size={20} />
                         </button>

                         {/* Left Side: General Info & Economics */}
                         <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-800/50 p-6 md:p-8 border-r border-slate-200 dark:border-slate-800">
                             <div className="flex flex-col items-center mb-8">
                                 <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-black text-4xl shadow-xl mb-4 border-4 border-white dark:border-slate-900">
                                     {selectedUser.nickname.charAt(0).toUpperCase() || '?'}
                                 </div>
                                 <h2 className="text-2xl font-black text-slate-900 dark:text-white text-center pb-1">{selectedUser.nickname}</h2>
                                 <span className="text-slate-500 font-mono text-xs mb-2">ID: {selectedUser.userId}</span>
                                 {selectedUser.signature && <p className="text-sm italic text-slate-600 dark:text-slate-400 text-center max-w-[200px]">"{selectedUser.signature}"</p>}
                             </div>

                             <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
                                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Tài Tính & Kinh Tế</h3>
                                 <div className="flex justify-between items-center mb-4">
                                     <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Số dư hiện tại</span>
                                     <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-500 font-black text-xl">
                                         <Coins size={20} /> {selectedUser.money.toLocaleString()}
                                     </div>
                                 </div>
                                 
                                 <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                                     <label className="block text-xs font-bold text-slate-500 mb-2">Bơm Tiền Trực Tiếp</label>
                                     <div className="flex gap-2">
                                         <input 
                                             type="number" 
                                             className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                             value={addCoinAmount}
                                             onChange={(e) => setAddCoinAmount(Number(e.target.value))}
                                         />
                                         <button 
                                             onClick={handleAddCoin}
                                             disabled={isAddingCoin}
                                             className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-blue-500/20 text-sm shrink-0"
                                         >
                                             {isAddingCoin ? 'Đang Xử Lý...' : 'Nạp'}
                                         </button>
                                     </div>
                                 </div>
                             </div>
                         </div>

                         {/* Right Side: Pets Display */}
                         <div className="w-full md:w-2/3 p-6 md:p-8 bg-white dark:bg-slate-900">
                             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                 <Sparkles className="text-yellow-500" /> Bộ Sưu Tập Sinh Vật ({selectedUser.pets.length})
                             </h3>
                             
                             {selectedUser.pets.length === 0 ? (
                                 <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                                     <ShieldAlert size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                     <p className="text-slate-500">Người chơi này chưa ấp nở bất kỳ sinh vật nào.</p>
                                 </div>
                             ) : (
                                 <div className="grid grid-cols-1 gap-4">
                                     {selectedUser.pets.map((pet: any) => {
                                         const stats = JSON.parse(pet.stats || '{}');
                                         return (
                                             <div key={pet.id} className="group relative flex flex-col sm:flex-row gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all overflow-hidden">
                                                 
                                                 {/* Pet Image Base */}
                                                 <div className="relative w-full sm:w-32 h-32 shrink-0 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-900">
                                                     {pet.imageData ? (
                                                         <img src={pet.imageData} alt={pet.name} className="w-full h-full object-cover" />
                                                     ) : (
                                                         <div className="w-full h-full flex items-center justify-center">No Image</div>
                                                     )}
                                                     <div className="absolute inset-x-0 bottom-0 py-1 bg-black/70 backdrop-blur-sm text-center">
                                                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">{pet.rarity}</span>
                                                     </div>
                                                 </div>

                                                 {/* Pet Details */}
                                                 <div className="flex-1 flex flex-col justify-center">
                                                     <div className="flex justify-between items-start mb-1">
                                                         <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                                            {pet.name}
                                                            <span className="text-xs font-bold px-2 py-0.5 roundedbg-slate-200 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Lv.{pet.level}</span>
                                                         </h4>
                                                     </div>
                                                     <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 truncate line-clamp-1">{pet.description}</p>
                                                     
                                                     {/* Mini Stats Grid */}
                                                     <div className="grid grid-cols-4 gap-2 text-center">
                                                          <div className="bg-red-50 dark:bg-red-500/10 rounded-lg p-1.5 border border-red-100 dark:border-red-500/20">
                                                              <div className="text-[10px] font-bold text-red-500 uppercase flex items-center justify-center gap-1"><Heart size={10}/> HP</div>
                                                              <div className="text-xs font-black text-slate-900 dark:text-white">{stats.hp || 0}</div>
                                                          </div>
                                                          <div className="bg-orange-50 dark:bg-orange-500/10 rounded-lg p-1.5 border border-orange-100 dark:border-orange-500/20">
                                                              <div className="text-[10px] font-bold text-orange-500 uppercase flex items-center justify-center gap-1"><Zap size={10}/> ATK</div>
                                                              <div className="text-xs font-black text-slate-900 dark:text-white">{stats.atk || 0}</div>
                                                          </div>
                                                          <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-1.5 border border-blue-100 dark:border-blue-500/20">
                                                              <div className="text-[10px] font-bold text-blue-500 uppercase flex items-center justify-center gap-1"><Shield size={10}/> DEF</div>
                                                              <div className="text-xs font-black text-slate-900 dark:text-white">{stats.def || 0}</div>
                                                          </div>
                                                          <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-lg p-1.5 border border-emerald-100 dark:border-emerald-500/20">
                                                              <div className="text-[10px] font-bold text-emerald-500 uppercase flex items-center justify-center gap-1"><Sparkles size={10}/> SPD</div>
                                                              <div className="text-xs font-black text-slate-900 dark:text-white">{stats.spd || 0}</div>
                                                          </div>
                                                     </div>
                                                 </div>
                                             </div>
                                         );
                                     })}
                                 </div>
                             )}
                         </div>

                    </div>
                </div>
            )}

        </div>
    );
};
