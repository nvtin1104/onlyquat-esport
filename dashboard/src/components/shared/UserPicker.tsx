import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { getUsers } from '@/lib/users.api';
import { cn } from '@/lib/utils';
import type { AdminUser } from '@/types/admin';

export interface UserPickerValue {
    id: string;
    username: string;
    name?: string | null;
    email?: string;
    avatar?: string | null;
}

export interface UserPickerProps {
    /** Label hiển thị phía trên */
    label?: string;
    /** User đang được chọn */
    value: UserPickerValue | null;
    /** Callback khi chọn/xóa user */
    onChange: (user: UserPickerValue | null) => void;
    /** Cho phép xóa selection (nullable) */
    nullable?: boolean;
    /** Placeholder ô tìm kiếm */
    placeholder?: string;
    className?: string;
}

const DEBOUNCE_MS = 350;

export function UserPicker({
    label,
    value,
    onChange,
    nullable = false,
    placeholder = 'Tìm người dùng...',
    className,
}: UserPickerProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<AdminUser[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [defaultLoaded, setDefaultLoaded] = useState(false);

    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Load default list (latest 8 users) once on first focus
    const loadDefaults = useCallback(async () => {
        if (defaultLoaded) return;
        setLoading(true);
        try {
            const res = await getUsers({ limit: 8, page: 1 });
            setResults(res.data);
            setDefaultLoaded(true);
        } finally {
            setLoading(false);
        }
    }, [defaultLoaded]);

    function handleFocus() {
        setOpen(true);
        loadDefaults();
    }

    function handleQueryChange(v: string) {
        setQuery(v);
        if (timer.current) clearTimeout(timer.current);

        if (!v.trim()) {
            // Restore default list
            setResults([]);
            setDefaultLoaded(false);
            timer.current = setTimeout(() => loadDefaults(), 0);
            return;
        }

        timer.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await getUsers({ search: v.trim(), limit: 8 });
                setResults(res.data);
                setOpen(true);
            } finally {
                setLoading(false);
            }
        }, DEBOUNCE_MS);
    }

    function pick(user: AdminUser) {
        onChange({
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
        });
        setQuery('');
        setOpen(false);
    }

    function clear() {
        onChange(null);
        setQuery('');
        setDefaultLoaded(false);
        setTimeout(() => inputRef.current?.focus(), 50);
    }

    return (
        <div className={cn('space-y-1.5', className)}>
            {label && (
                <label className="font-mono text-xs text-text-dim uppercase tracking-wide block">
                    {label}
                </label>
            )}

            {/* ── Selected pill — always shown when value exists ─────────── */}
            {value && (
                <div className="flex items-center gap-3 px-3 py-2.5 bg-bg-elevated border border-border-subtle rounded-sm">
                    <Avatar
                        src={value.avatar ?? undefined}
                        alt={value.username}
                        fallback={value.username}
                        size="sm"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                            {value.name ?? value.username}
                        </p>
                        <p className="text-xs text-text-dim truncate">{value.email ?? value.username}</p>
                    </div>
                    {/* X always visible when a value is selected */}
                    <button
                        type="button"
                        onClick={clear}
                        aria-label="Xóa chọn"
                        className="shrink-0 p-1 rounded-sm text-text-dim hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* ── Search — always visible ─────────────────────────────────── */}
            <div ref={wrapperRef} className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim pointer-events-none" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        onFocus={handleFocus}
                        placeholder={value ? `Thay đổi ${label?.toLowerCase() ?? 'người dùng'}...` : placeholder}
                        className={cn(
                            'w-full bg-bg-elevated border border-border-subtle rounded-sm',
                            'pl-8 pr-8 py-2 text-sm text-text-primary placeholder:text-text-dim',
                            'focus:outline-none focus:border-accent-acid transition-colors',
                        )}
                    />
                    {loading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim animate-spin" />
                    )}
                </div>

                {/* Dropdown */}
                {open && (
                    <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-bg-card border border-border-subtle rounded-sm shadow-xl py-1 max-h-56 overflow-y-auto">
                        {results.length > 0 ? (
                            results.map((u) => (
                                <button
                                    key={u.id}
                                    type="button"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        pick(u);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-bg-elevated transition-colors text-left cursor-pointer"
                                >
                                    <Avatar
                                        src={u.avatar ?? undefined}
                                        alt={u.username}
                                        fallback={u.username}
                                        size="sm"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-text-primary font-medium truncate">
                                            {u.name ?? u.username}
                                        </p>
                                        <p className="text-xs text-text-dim truncate">{u.email}</p>
                                    </div>
                                </button>
                            ))
                        ) : !loading ? (
                            <p className="px-4 py-3 text-xs text-text-dim text-center">
                                {query.trim() ? 'Không tìm thấy người dùng' : 'Không có dữ liệu'}
                            </p>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}
