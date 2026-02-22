export function UsersSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="rounded-sm border border-border-subtle overflow-hidden">
            {/* Table header skeleton */}
            <div className="bg-bg-elevated border-b border-border-subtle px-4 py-3 grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_2rem] gap-4">
                {['Người dùng', 'Role', 'Trạng thái', 'Loại TK', 'Ngày tạo', ''].map((_, i) => (
                    <div key={i} className="h-3 rounded-sm bg-border-subtle animate-pulse" />
                ))}
            </div>
            {/* Row skeletons */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div
                    key={rowIdx}
                    className="px-4 py-3.5 grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_2rem] gap-4 items-center border-b border-border-subtle last:border-0"
                >
                    {/* User info cell */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-border-subtle animate-pulse flex-shrink-0" />
                        <div className="space-y-1.5 flex-1">
                            <div className="h-3 w-24 rounded-sm bg-border-subtle animate-pulse" />
                            <div className="h-2.5 w-32 rounded-sm bg-border-subtle/60 animate-pulse" />
                        </div>
                    </div>
                    {/* Role badges */}
                    <div className="flex gap-1.5">
                        <div className="h-5 w-14 rounded-sm bg-border-subtle animate-pulse" />
                        <div className="h-5 w-10 rounded-sm bg-border-subtle/60 animate-pulse" />
                    </div>
                    {/* Status */}
                    <div className="h-3 w-20 rounded-sm bg-border-subtle animate-pulse" />
                    {/* Account type */}
                    <div className="h-3 w-12 rounded-sm bg-border-subtle animate-pulse" />
                    {/* Date */}
                    <div className="h-3 w-20 rounded-sm bg-border-subtle animate-pulse" />
                    {/* Action dots */}
                    <div className="h-4 w-4 rounded-sm bg-border-subtle animate-pulse" />
                </div>
            ))}
        </div>
    );
}
