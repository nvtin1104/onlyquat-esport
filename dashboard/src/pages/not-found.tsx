import { Home, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-bg-base flex items-center justify-center p-6">
            <div className="flex flex-col items-center text-center max-w-md w-full">
                {/* Glitch 404 */}
                <div className="relative mb-6 select-none">
                    <span
                        className="font-display font-black text-[120px] leading-none text-accent-acid opacity-10 absolute inset-0 flex items-center justify-center translate-x-[3px] translate-y-[-2px]"
                        aria-hidden="true"
                    >
                        404
                    </span>
                    <span
                        className="font-display font-black text-[120px] leading-none text-accent-fire opacity-10 absolute inset-0 flex items-center justify-center translate-x-[-3px] translate-y-[2px]"
                        aria-hidden="true"
                    >
                        404
                    </span>
                    <span className="font-display font-black text-[120px] leading-none text-text-primary relative">
                        404
                    </span>
                </div>

                {/* Divider */}
                <div className="w-24 h-[2px] bg-accent-acid mb-6 rounded-full" />

                {/* Message */}
                <h1 className="font-display font-bold text-2xl text-text-primary mb-2 tracking-wide">
                    Trang không tồn tại
                </h1>
                <p className="font-body text-sm text-text-secondary mb-8 leading-relaxed">
                    Đường dẫn bạn truy cập không hợp lệ hoặc đã bị xoá.
                    <br />
                    Kiểm tra lại URL hoặc quay về trang chủ.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-border-hover text-text-primary hover:bg-bg-elevated transition-colors font-body text-sm font-medium"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Quay lại
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-accent-acid text-bg-base hover:opacity-90 transition-opacity font-body text-sm font-bold"
                    >
                        <Home className="w-4 h-4" />
                        Trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
}
