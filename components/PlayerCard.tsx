
import React, { useState, useRef, useEffect } from 'react';
import { Player, PaymentStatus, AttendanceStatus, PaymentMethod } from '../types';
import { XCircle, DollarSign, Trash2, BellRing, Loader2, ArrowUpCircle, CreditCard, Banknote, MoreVertical, CheckCircle2, AlertCircle } from 'lucide-react';
import { SESSION_FEE, FINE_REGULAR, FINE_EVENT } from '../constants';
import { generateReminderMessage } from '../services/geminiService';

interface PlayerCardProps {
  player: Player;
  isAdmin: boolean;
  onTogglePayment: (id: string) => void;
  onUpdatePaymentMethod: (id: string, method: PaymentMethod) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  onPromote?: (id: string) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  isAdmin,
  onTogglePayment, 
  onUpdatePaymentMethod,
  onCancel, 
  onDelete, 
  onPromote 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const isFix = player.status === AttendanceStatus.FIX;
  const isCancelled = player.status === AttendanceStatus.CANCELLED;
  const is5050 = player.status === AttendanceStatus.WAITING_5050;
  const isWL = player.status === AttendanceStatus.WAITING_PUBLIC || player.status === AttendanceStatus.WAITING_FIX;
  
  const isPaid = player.paymentStatus === PaymentStatus.PAID;
  const needsPayment = isFix || isCancelled;

  const activeFine = localStorage.getItem('beach-ivory-event-mode') === 'true' ? FINE_EVENT : FINE_REGULAR;
  const amount = isFix ? SESSION_FEE : (isCancelled ? activeFine : 0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRemind = async () => {
    setIsGenerating(true);
    setIsMenuOpen(false);
    try {
      const message = await generateReminderMessage(player.name, amount, isCancelled);
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = () => {
    if (isFix) return 'bg-orange-500';
    if (isCancelled) return 'bg-red-400';
    if (is5050) return 'bg-blue-400';
    if (isWL) return 'bg-purple-500';
    return 'bg-slate-400';
  };

  const getCardStyle = () => {
    if (isFix) return 'bg-white border-slate-100';
    if (isCancelled) return 'bg-red-50 border-red-100 shadow-sm';
    if (is5050) return 'bg-blue-50 border-blue-100';
    if (isWL) return 'bg-purple-50 border-purple-100';
    return 'bg-white border-slate-100';
  };

  return (
    <div className={`p-4 rounded-2xl border-2 transition-all relative ${getCardStyle()}`}>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-inner ${getStatusColor()}`}>
              {player.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                {player.name}
                {isCancelled && <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full uppercase font-black">Cancelled</span>}
              </h3>
              {needsPayment && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs font-black text-slate-600">
                    Rp {amount.toLocaleString()}
                  </p>
                  {isPaid ? (
                    <span className="flex items-center gap-0.5 text-[9px] font-black text-green-600 uppercase bg-green-100 px-1.5 py-0.5 rounded-md">
                      <CheckCircle2 size={10} /> Lunas
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[9px] font-black text-yellow-700 uppercase bg-yellow-100 px-1.5 py-0.5 rounded-md">
                      <AlertCircle size={10} /> Unpaid
                    </span>
                  )}
                </div>
              )}
              {(is5050 || isWL) && (
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  {is5050 ? '50:50' : 'WL Public'}
                </p>
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"
                aria-label="More actions"
              >
                <MoreVertical size={20} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2 overflow-hidden animate-in fade-in zoom-in duration-150">
                  {needsPayment && (
                    <>
                      <button
                        onClick={handleRemind}
                        disabled={isGenerating}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <BellRing size={16} />}
                        Kirim Reminder
                      </button>
                      <button
                        onClick={() => { onTogglePayment(player.id); setIsMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <DollarSign size={16} />
                        {isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                      </button>
                    </>
                  )}
                  
                  {(isWL || is5050) && onPromote && (
                    <button
                      onClick={() => { onPromote(player.id); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-green-600 hover:bg-green-50 transition-colors"
                    >
                      <ArrowUpCircle size={16} />
                      Promote to Fix
                    </button>
                  )}

                  {(isFix || is5050 || isWL) && (
                    <button
                      onClick={() => { onCancel(player.id); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-orange-600 hover:bg-orange-50 transition-colors"
                    >
                      <XCircle size={16} />
                      Cancel Absensi
                    </button>
                  )}

                  <button
                    onClick={() => { onDelete(player.id); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                    Hapus Data
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {needsPayment && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-50">
            <div className="flex items-center gap-1.5">
              <button
                disabled={!isAdmin}
                onClick={() => onUpdatePaymentMethod(player.id, PaymentMethod.TRANSFER)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
                  player.paymentMethod === PaymentMethod.TRANSFER 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                } ${!isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <CreditCard size={12} />
                Transfer
              </button>
              <button
                disabled={!isAdmin}
                onClick={() => onUpdatePaymentMethod(player.id, PaymentMethod.CASH)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
                  player.paymentMethod === PaymentMethod.CASH 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                } ${!isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <Banknote size={12} />
                Cash
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={!isAdmin}
                onClick={() => onTogglePayment(player.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
                  isPaid 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-100' 
                    : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 shadow-lg shadow-yellow-100'
                } ${!isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isPaid ? <CheckCircle2 size={14} /> : <DollarSign size={14} />}
                {isPaid ? 'Lunas' : 'Bayar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
