import React from 'react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm?: () => void;
    cancelText?: string;
    onCancel?: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    confirmText = '確認',
    onConfirm,
    cancelText,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-all duration-300">
            {/* Modal Container: RPG HUD Style aligned with Demo */}
            <div className="relative w-full max-w-md animate-unlock-reveal">

                {/* Decorative "Magic" Glow behind modal */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition duration-500"></div>

                {/* Main Card: RPG-Modal-Bg with 4px border */}
                <div className="relative flex flex-col items-center bg-[#102216] bg-runes border-4 border-[#354f3e] rounded-2xl shadow-2xl overflow-visible">

                    {/* Interior Decorative Frame (Subtle) */}
                    <div className="absolute inset-1 border border-primary/5 rounded-xl pointer-events-none"></div>

                    {/* Floating Header Banner (RPG Ribbon style - Rounded) */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary border-4 border-[#0a4d26] text-[#0a4d26] px-10 py-2 rounded-full shadow-[0_8px_0px_0px_rgba(0,0,0,0.4)] z-20 flex items-center gap-2 whitespace-nowrap">
                        <span className="material-symbols-outlined text-[20px] font-bold animate-rune-glow">notifications_active</span>
                        <span className="text-sm font-display font-black tracking-widest uppercase text-glow">系統諭示</span>
                    </div>

                    {/* Close Button (RPG Wax Seal style - Red) */}
                    <button
                        onClick={onClose}
                        className="absolute -top-4 -right-4 size-11 bg-[#e74c3c] hover:bg-[#c0392b] text-white rounded-full border-4 border-[#7e1e15] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.4)] transition-all hover:scale-110 hover:rotate-90 z-30 cursor-pointer group"
                    >
                        <span className="material-symbols-outlined text-2xl font-bold group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">close</span>
                    </button>

                    {/* Content Body */}
                    <div className="px-8 pb-10 pt-14 text-center w-full">
                        {/* Title: Gold/Metal aesthetic from Dark Fantasy theme */}
                        <h3 className="text-secondary text-2xl font-display font-black mb-4 tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] uppercase">
                            {title}
                        </h3>

                        {/* Message Box: Darkened Well */}
                        <div className="bg-[#0a1610]/60 rounded-xl p-5 border-2 border-[#28392f] mb-8 relative group">
                            {/* Mystical Corner Accents */}
                            <div className="absolute top-2 left-2 size-2 border-t border-l border-primary/20"></div>
                            <div className="absolute bottom-2 right-2 size-2 border-b border-r border-primary/20"></div>

                            <p className="text-gray-300 text-sm leading-relaxed font-body">
                                {message}
                            </p>
                        </div>

                        {/* Action Buttons: RPG Physical Style */}
                        <div className="flex flex-col gap-4 w-full px-2">
                            {onConfirm && (
                                <button
                                    onClick={onConfirm}
                                    className="group/btn relative w-full bg-primary hover:bg-primary-dark text-[#052e16] font-black text-lg py-3 rounded-xl shadow-[0_8px_0px_0px_rgba(0,0,0,0.4)] hover:shadow-[0_4px_0px_0px_rgba(0,0,0,0.4)] hover:translate-y-[4px] transition-all duration-100 flex items-center justify-center gap-3 overflow-hidden"
                                >
                                    {/* Shimmer Effect */}
                                    <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] group-hover/btn:animate-shimmer"></div>

                                    <span className="material-symbols-outlined text-2xl group-hover/btn:scale-110 transition-transform">check_circle</span>
                                    <span className="font-display tracking-widest uppercase">{confirmText}</span>
                                </button>
                            )}

                            {cancelText && onCancel && (
                                <button
                                    onClick={onCancel}
                                    className="w-full text-gray-400 hover:text-white font-display font-bold text-sm py-2 hover:bg-[#28392f]/50 rounded-xl transition-all border-2 border-transparent hover:border-[#354f3e] uppercase"
                                >
                                    {cancelText}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Decorative Corner Runes (HUD accents) */}
                    <div className="absolute bottom-3 left-3 size-2 border-b-2 border-l-2 border-primary/30 rounded-bl-sm"></div>
                    <div className="absolute bottom-3 right-3 size-2 border-b-2 border-r-2 border-primary/30 rounded-br-sm"></div>
                    <div className="absolute top-10 left-3 size-2 border-l-2 border-primary/10"></div>
                    <div className="absolute top-10 right-3 size-2 border-r-2 border-primary/10"></div>

                    {/* Sigil Overlays (Subtle) */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-primary/10 select-none opacity-40">𐔰 𐔱 𐔲 𐔳</div>
                </div>

                {/* Submersion Effect Shadow */}
                <div className="mx-auto w-[90%] h-4 bg-black/40 blur-lg rounded-full mt-4"></div>
            </div>
        </div>
    );
};
