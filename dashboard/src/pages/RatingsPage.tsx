import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { RatingCard } from '@/components/ratings/RatingCard';
import { RejectDialog } from '@/components/ratings/RejectDialog';
import { mockRatings, games } from '@/data/mock-data';
import type { AdminRating } from '@/types/admin';

type RatingStatus = 'pending' | 'approved' | 'rejected';

const GAME_OPTIONS = [
  { value: '', label: 'Tat ca game' },
  ...games.map((g) => ({ value: g.shortName, label: g.name })),
];

export function RatingsPage() {
  const [ratings, setRatings] = useState<AdminRating[]>(mockRatings);
  const [activeTab, setActiveTab] = useState<RatingStatus>('pending');
  const [gameFilter, setGameFilter] = useState('');
  const [search, setSearch] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);

  const pendingCount = ratings.filter((r) => r.status === 'pending').length;

  function handleApprove(id: string) {
    setRatings((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' as const } : r))
    );
  }

  function handleRejectClick(id: string) {
    setRejectTargetId(id);
    setRejectDialogOpen(true);
  }

  function handleRejectConfirm(_reason: string) {
    if (rejectTargetId) {
      setRatings((prev) =>
        prev.map((r) =>
          r.id === rejectTargetId ? { ...r, status: 'rejected' as const } : r
        )
      );
      setRejectTargetId(null);
    }
    setRejectDialogOpen(false);
  }

  function handleApproveAll() {
    setRatings((prev) =>
      prev.map((r) => (r.status === 'pending' ? { ...r, status: 'approved' as const } : r))
    );
  }

  const filtered = ratings
    .filter((r) => r.status === activeTab)
    .filter((r) => (gameFilter ? r.playerGame === gameFilter || r.playerGame.includes(gameFilter) : true))
    .filter((r) =>
      search
        ? r.playerName.toLowerCase().includes(search.toLowerCase()) ||
          r.userName.toLowerCase().includes(search.toLowerCase())
        : true
    );

  return (
    <div>
      <PageHeader
        title="Danh gia"
        description="Duyet danh gia tu cong dong"
        actions={
          activeTab === 'pending' ? (
            <Button variant="primary" size="sm" onClick={handleApproveAll}>
              <CheckCircle className="w-4 h-4" />
              Duyet tat ca
            </Button>
          ) : undefined
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as RatingStatus)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="pending">
              Cho duyet {pendingCount > 0 && `(${pendingCount})`}
            </TabsTrigger>
            <TabsTrigger value="approved">Da duyet</TabsTrigger>
            <TabsTrigger value="rejected">Da tu choi</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex gap-2">
            <Select
              options={GAME_OPTIONS}
              value={gameFilter}
              onChange={setGameFilter}
              className="w-44"
            />
            <SearchInput
              placeholder="Tim kiem..."
              value={search}
              onChange={setSearch}
              className="w-52"
            />
          </div>
        </div>

        {(['pending', 'approved', 'rejected'] as RatingStatus[]).map((status) => (
          <TabsContent key={status} value={status}>
            <div className="flex flex-col gap-3">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-text-dim font-body text-sm">
                  Khong co danh gia nao.
                </div>
              ) : (
                filtered.map((rating) => (
                  <RatingCard
                    key={rating.id}
                    rating={rating}
                    onApprove={handleApprove}
                    onReject={handleRejectClick}
                    showActions={status === 'pending'}
                  />
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <RejectDialog
        open={rejectDialogOpen}
        onClose={() => {
          setRejectDialogOpen(false);
          setRejectTargetId(null);
        }}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
}
