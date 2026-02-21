import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
    siblingCount?: number;
}

const DOTS = '...';

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className,
    siblingCount = 1,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    // Generate page numbers to show
    const getPageNumbers = () => {
        const totalPageNumbers = siblingCount + 5;

        // Case 1: Total pages < total pages we want to show
        if (totalPageNumbers >= totalPages) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
        const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

        const firstPageIndex = 1;
        const lastPageIndex = totalPages;

        // Case 2: No left dots to show, but right dots to be shown
        if (!shouldShowLeftDots && shouldShowRightDots) {
            const leftItemCount = 3 + 2 * siblingCount;
            const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
            return [...leftRange, DOTS, totalPages];
        }

        // Case 3: No right dots to show, but left dots to be shown
        if (shouldShowLeftDots && !shouldShowRightDots) {
            const rightItemCount = 3 + 2 * siblingCount;
            const rightRange = Array.from(
                { length: rightItemCount },
                (_, i) => totalPages - rightItemCount + i + 1
            );
            return [firstPageIndex, DOTS, ...rightRange];
        }

        // Case 4: Both left and right dots to be shown
        if (shouldShowLeftDots && shouldShowRightDots) {
            const middleRange = Array.from(
                { length: rightSiblingIndex - leftSiblingIndex + 1 },
                (_, i) => leftSiblingIndex + i
            );
            return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
        }

        return [];
    };

    const pages = getPageNumbers();

    return (
        <nav
            role="navigation"
            aria-label="pagination"
            className={cn('mx-auto flex w-full justify-center', className)}
        >
            <ul className="flex flex-row items-center gap-1">
                <li>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        aria-label="Go to previous page"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </li>
                {pages.map((pageNumber, idx) => {
                    if (pageNumber === DOTS) {
                        return (
                            <li key={`dots-${idx}`} className="flex h-8 w-8 items-center justify-center">
                                <MoreHorizontal className="h-4 w-4 text-text-dim" />
                            </li>
                        );
                    }

                    const isCurrent = pageNumber === currentPage;
                    return (
                        <li key={`page-${pageNumber}`}>
                            <Button
                                variant={isCurrent ? 'outline' : 'ghost'}
                                size="icon"
                                className={cn(
                                    "h-8 w-8",
                                    isCurrent && "border-accent-acid text-accent-acid hover:text-accent-acid hover:bg-bg-elevated font-medium"
                                )}
                                onClick={() => onPageChange(pageNumber as number)}
                                aria-label={`Go to page ${pageNumber}`}
                                aria-current={isCurrent ? 'page' : undefined}
                            >
                                {pageNumber}
                            </Button>
                        </li>
                    );
                })}
                <li>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        aria-label="Go to next page"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </li>
            </ul>
        </nav>
    );
}
