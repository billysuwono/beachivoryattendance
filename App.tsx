
import React, { useState, useEffect, useRef } from 'react';
import { Player, AttendanceStatus, PaymentStatus, PaymentMethod, Session } from './types';
import { APP_NAME, RULES, SESSION_FEE, FINE_REGULAR, FINE_EVENT } from './constants';
import PlayerCard from './components/PlayerCard';
import { Trophy, Users, Clock, MapPin, Plus, AlertTriangle, MessageSquare, Send, Bell, HelpCircle, ListFilter, Check, X, Settings2, Share2, LogIn, LogOut, Key } from 'lucide-react';

const App: React.FC = () => {
  // --- STATE ---
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentSession, setCurrentSession] = useState<Session>({
    id: 'default',
    title: 'Saturday Night Ivory',
    date: 'Sabtu, 19:00 - 21:00',
    location: 'Galaxy Court, Jakarta',
    maxPlayers: 20
  });

  const [playerName, setPlayerName] = useState('');
  const [joinType, setJoinType] = useState<AttendanceStatus>(AttendanceStatus.FIX);
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [isEventMode, setIsEventMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);

  const isFirstLoad = useRef(true);

  // --- LOCAL PERSISTENCE ---

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedPlayers = localStorage.getItem('bi_players');
    const savedSession = localStorage.getItem('bi_session');
    const savedEventMode = localStorage.getItem('bi_event_mode');

    if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
    if (savedSession) setCurrentSession(JSON.parse(savedSession));
    if (savedEventMode) setIsEventMode(savedEventMode === 'true');
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    localStorage.setItem('bi_players', JSON.stringify(players));
    localStorage.setItem('bi_session', JSON.stringify(currentSession));
    localStorage.setItem('bi_event_mode', isEventMode.toString());
  }, [players, currentSession, isEventMode]);

  // --- HANDLERS ---

  const handleAdminAuth = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (adminPasscode === 'ivoryadmin') {
      setIsAdmin(true);
      setShowLoginModal(false);
      setAdminPasscode('');
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    
    const fixCount = players.filter(p => p.status === AttendanceStatus.FIX).length;
    let status = joinType;

    if (joinType === AttendanceStatus.FIX && fixCount >= currentSession.maxPlayers) {
      status = AttendanceStatus.WAITING_PUBLIC;
      alert("Slot FIX penuh! Kamu masuk WL.");
    }
    
    const newPlayer: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: playerName.trim(),
      status,
      paymentStatus: PaymentStatus.UNPAID,
      paymentMethod: PaymentMethod.NONE,
      joinedAt: Date.now(),
      isLateCancel: false
    };

    setPlayers(prev => [...prev, newPlayer]);
    setPlayerName('');
  };

  const handleCopyList = () => {
    const fixList = players
      .filter(p => p.status === AttendanceStatus.FIX)
      .map((p, i) => `${i + 1}. ${p.name} ${p.paymentStatus === PaymentStatus.PAID ? '✅' : '⏳'}`)
      .join('\n');
    
    const text = `🏀 BEACH IVORY SESSION 🏀\n🔥 ${currentSession.title}\n📅 ${currentSession.date}\n📍 ${currentSession.location}\n\nFIX LIST:\n${fixList || '- Belum ada -'}\n\nIsi absen di sini:\n${window.location.origin}${window.location.pathname}`;
    
    navigator.clipboard.writeText(text).then(() => alert("Daftar Absensi Berhasil Disalin!"));
  };

  // --- DERIVED DATA ---
  const fixPlayers = players.filter(p => p.status === AttendanceStatus.FIX);
  const raguPlayers = players.filter(p => p.status === AttendanceStatus.WAITING_5050);
  const wlPlayers = players.filter(p => p.status === AttendanceStatus.WAITING_PUBLIC || p.status === AttendanceStatus.WAITING_FIX);
  const cancelPlayers = players.filter(p => p.status === AttendanceStatus.CANCELLED);
  const isFull = fixPlayers.length >= currentSession.maxPlayers;

  return (
    <div className="min-h-screen pb-40 bg-slate-50 text-slate-900 font-sans">
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="bg-orange-600 p-8 text-white text-center">
              <Key size={32} className="mx-auto mb-3 opacity-80" />
              <h3 className="font-bold uppercase tracking-widest text-sm">Admin Access</h3>
            </div>
            <form onSubmit={handleAdminAuth} className="p-8 space-y-5">
              <input 
                autoFocus 
                type="password" 
                value={adminPasscode} 
                onChange={(e) => setAdminPasscode(e.target.value)} 
                placeholder="Passcode..." 
                className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-4 font-bold outline-none transition-all text-base ${loginError ? 'border-red-500 bg-red-50' : 'focus:border-orange-500'}`} 
              />
              <button type="submit" className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Unlock</button>
              <button type="button" onClick={() => setShowLoginModal(false)} className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest">Batal</button>
            </form>
          </div>
        </div>
      )}

      {/* Header Container */}
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <header className="bg-orange-600 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="px-8 pt-10 pb-12 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl shadow-inner backdrop-blur-md"><Trophy size={28} /></div>
                <div>
                  <h1 className="text-[10px] font-black tracking-widest uppercase opacity-80 mb-1">Beach Ivory Basketball</h1>
                  <h2 className="text-xl font-black uppercase tracking-tight leading-none">{currentSession.title}</h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isAdmin ? (
                  <button onClick={() => setShowLoginModal(true)} className="bg-white/20 p-3 rounded-2xl hover:bg-white/30 transition-all"><LogIn size={20} /></button>
                ) : (
                  <button onClick={() => setIsAdmin(false)} className="bg-white text-orange-600 p-3 rounded-2xl shadow-lg font-black text-[10px] uppercase flex items-center gap-2"><LogOut size={16} /> Logout</button>
                )}
              </div>
            </div>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/5 rounded-full"></div>
        </header>
      </div>

      <main className="max-w-2xl mx-auto px-6 mt-6 space-y-6">
        {/* Session Details */}
        <section className={`bg-white p-6 rounded-[2.5rem] shadow-xl border-2 transition-all ${isAdmin && isEditingSession ? 'border-orange-500' : 'border-white'}`}>
          {isAdmin && isEditingSession ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-orange-600 uppercase text-[10px] tracking-widest flex items-center gap-2"><Settings2 size={16} /> Pengaturan Sesi</h3>
                <button onClick={() => setIsEditingSession(false)} className="bg-orange-600 text-white px-5 py-2 rounded-xl font-bold text-[10px] shadow-lg">SIMPAN</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <input type="text" value={currentSession.title} onChange={(e) => setCurrentSession({...currentSession, title: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-sm" placeholder="Nama Sesi" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={currentSession.date} onChange={(e) => setCurrentSession({...currentSession, date: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-xs" placeholder="Waktu" />
                  <input type="text" value={currentSession.location} onChange={(e) => setCurrentSession({...currentSession, location: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-xs" placeholder="Lokasi" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-[8px] font-black text-slate-400 uppercase">Kuota</label>
                    <input type="number" value={currentSession.maxPlayers} onChange={(e) => setCurrentSession({...currentSession, maxPlayers: parseInt(e.target.value) || 0})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-sm" />
                  </div>
                  <button onClick={() => setIsEventMode(!isEventMode)} className={`rounded-xl font-black text-[10px] border-2 uppercase transition-all ${isEventMode ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                    {isEventMode ? 'Event (50K)' : 'Reguler (25K)'}
                  </button>
                </div>
                <button onClick={() => players.length > 0 && confirm("Hapus semua absensi?") && setPlayers([])} className="w-full py-3 text-red-500 font-bold text-[10px] uppercase border-2 border-red-50 rounded-xl hover:bg-red-50">Reset Absensi</button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-slate-700">
                    <div className="bg-orange-50 p-2.5 rounded-xl text-orange-500"><Clock size={20} /></div>
                    <span className="font-bold text-sm sm:text-base">{currentSession.date}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-700">
                    <div className="bg-orange-50 p-2.5 rounded-xl text-orange-500"><MapPin size={20} /></div>
                    <span className="font-bold text-sm sm:text-base">{currentSession.location}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={handleCopyList} title="Salin List ke WA" className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-slate-500 hover:bg-slate-100 transition-all shadow-sm"><Share2 size={22} /></button>
                  {isAdmin && <button onClick={() => setIsEditingSession(true)} className="bg-orange-50 p-3 rounded-2xl border border-orange-100 text-orange-600 hover:bg-orange-100 transition-all shadow-sm"><Settings2 size={22} /></button>}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                 <div className="flex items-center gap-4">
                   <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg"><Users size={20} /></div>
                   <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5 leading-none">Slot Terisi</span>
                    <span className={`font-black text-xl leading-none ${isFull ? 'text-red-500' : 'text-slate-800'}`}>{fixPlayers.length} / {currentSession.maxPlayers}</span>
                   </div>
                 </div>
              </div>
            </div>
          )}
        </section>

        {/* Join Section */}
        <section className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2"><Plus size={20} className="text-orange-600" /> Isi Absen</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-5 bg-slate-50 p-1.5 rounded-2xl">
            {[
              { id: AttendanceStatus.FIX, label: `FIX`, color: 'text-orange-600', icon: <Send size={14} /> },
              { id: AttendanceStatus.WAITING_5050, label: '50:50', color: 'text-blue-600', icon: <HelpCircle size={14} /> },
              { id: AttendanceStatus.WAITING_PUBLIC, label: 'WL', color: 'text-purple-600', icon: <Users size={14} /> }
            ].map(type => (
              <button 
                key={type.id}
                onClick={() => setJoinType(type.id as AttendanceStatus)} 
                className={`flex flex-col items-center gap-1 py-3 text-[10px] font-bold rounded-xl transition-all uppercase ${joinType === type.id ? 'bg-white shadow-md ' + type.color : 'text-slate-400'}`}
              >
                {type.icon} {type.label}
              </button>
            ))}
          </div>
          <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              value={playerName} 
              onChange={(e) => setPlayerName(e.target.value)} 
              placeholder="Nama kamu..." 
              className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-orange-500 outline-none font-bold text-slate-700 text-sm shadow-inner transition-all" 
            />
            <button type="submit" className={`px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all text-white ${joinType === AttendanceStatus.FIX ? 'bg-orange-600' : (joinType === AttendanceStatus.WAITING_5050 ? 'bg-blue-600' : 'bg-purple-600')}`}>
              SUBMIT
            </button>
          </form>
        </section>

        {/* Player Lists */}
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="font-bold text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2"><ListFilter size={18} className="text-orange-500" /> FIX LIST</h2>
              <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-[10px] font-bold">{fixPlayers.length}</span>
            </div>
            {fixPlayers.length === 0 ? (
              <div className="p-10 text-center text-slate-400 font-bold text-[10px] border-2 border-dashed rounded-[2.5rem] bg-slate-50/50 uppercase tracking-widest">Belum ada pemain fix</div>
            ) : (
              <div className="grid gap-4">
                {fixPlayers.map(p => (
                  <PlayerCard 
                    key={p.id} 
                    player={p} 
                    isAdmin={isAdmin} 
                    onCancel={(id) => setPlayers(prev => prev.map(pl => pl.id === id ? {...pl, status: AttendanceStatus.CANCELLED, cancelledAt: Date.now(), isLateCancel: true} : pl))} 
                    onTogglePayment={(id) => setPlayers(prev => prev.map(pl => pl.id === id ? {...pl, paymentStatus: pl.paymentStatus === PaymentStatus.PAID ? PaymentStatus.UNPAID : PaymentStatus.PAID} : pl))} 
                    onUpdatePaymentMethod={(id, m) => setPlayers(prev => prev.map(pl => pl.id === id ? {...pl, paymentMethod: m, paymentStatus: PaymentStatus.PAID} : pl))} 
                    onDelete={(id) => setPlayers(prev => prev.filter(pl => pl.id !== id))} 
                  />
                ))}
              </div>
            )}
          </div>

          {(wlPlayers.length > 0 || raguPlayers.length > 0) && (
            <div className="space-y-6 pt-6 border-t border-slate-200">
               {wlPlayers.length > 0 && (
                 <div className="space-y-4">
                    <h3 className="font-bold text-purple-600 uppercase text-[10px] px-2 tracking-[0.2em] flex items-center gap-2"><Users size={14} /> WAITING LIST ({wlPlayers.length})</h3>
                    <div className="grid gap-3">{wlPlayers.map(p => <PlayerCard key={p.id} player={p} isAdmin={isAdmin} onCancel={(id) => setPlayers(prev => prev.map(pl => pl.id === id ? {...pl, status: AttendanceStatus.CANCELLED} : pl))} onDelete={(id) => setPlayers(prev => prev.filter(pl => pl.id !== id))} onPromote={(id) => setPlayers(prev => prev.map(pl => pl.id === id ? {...pl, status: AttendanceStatus.FIX} : pl))} onTogglePayment={()=>{}} onUpdatePaymentMethod={()=>{}} />)}</div>
                 </div>
               )}
               {raguPlayers.length > 0 && (
                 <div className="space-y-4">
                    <h3 className="font-bold text-blue-600 uppercase text-[10px] px-2 tracking-[0.2em] flex items-center gap-2"><HelpCircle size={14} /> LIST 50:50 ({raguPlayers.length})</h3>
                    <div className="grid gap-3">{raguPlayers.map(p => <PlayerCard key={p.id} player={p} isAdmin={isAdmin} onCancel={(id) => setPlayers(prev => prev.map(pl => pl.id === id ? {...pl, status: AttendanceStatus.CANCELLED} : pl))} onDelete={(id) => setPlayers(prev => prev.filter(pl => pl.id !== id))} onPromote={(id) => setPlayers(prev => prev.map(pl => pl.id === id ? {...pl, status: AttendanceStatus.FIX} : pl))} onTogglePayment={()=>{}} onUpdatePaymentMethod={()=>{}} />)}</div>
                 </div>
               )}
            </div>
          )}

          {cancelPlayers.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-red-100">
              <h2 className="font-bold text-red-600 uppercase text-[10px] px-2 tracking-[0.2em] flex items-center gap-2"><AlertTriangle size={16} /> CANCEL LIST ({cancelPlayers.length})</h2>
              <div className="grid gap-3 opacity-90">{cancelPlayers.map(p => <PlayerCard key={p.id} player={p} isAdmin={isAdmin} onCancel={()=>{}} onTogglePayment={(id) => setPlayers(prev => prev.map(pl => pl.id === id ? {...pl, paymentStatus: pl.paymentStatus === PaymentStatus.PAID ? PaymentStatus.UNPAID : PaymentStatus.PAID} : pl))} onUpdatePaymentMethod={(id, m) => setPlayers(prev => prev.map(pl => pl.id === id ? {...pl, paymentMethod: m, paymentStatus: PaymentStatus.PAID} : pl))} onDelete={(id) => setPlayers(prev => prev.filter(pl => pl.id !== id))} />)}</div>
            </div>
          )}
        </div>

        {/* Small Notes/Rules Section */}
        <section className="bg-slate-100 p-8 rounded-[2.5rem] border border-slate-200">
          <h2 className="font-bold text-slate-500 mb-4 flex items-center gap-2 uppercase text-[10px] tracking-widest"><MessageSquare size={16} /> NOTES</h2>
          <ul className="space-y-2">
            {RULES.map((rule, idx) => (
              <li key={idx} className="text-[11px] text-slate-500 flex gap-3 items-start leading-relaxed font-medium uppercase tracking-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1 shrink-0" />
                {rule}
              </li>
            ))}
          </ul>
        </section>
      </main>

      {/* Floating Toolbar */}
      {isAdmin && (
        <footer className="fixed bottom-0 left-0 right-0 p-6 z-50">
          <div className="max-w-2xl mx-auto flex justify-end px-8">
            <button 
              onClick={() => alert("Menyiapkan pesan broadcast untuk Beach Ivory...")} 
              className="bg-orange-600 text-white p-4 rounded-2xl shadow-2xl shadow-orange-200 active:scale-90 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest"
            >
              <Bell size={22} />
              Broadcast
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
