import { useState } from 'react';
import { mockMatches } from '@/data/mock-data';
import type { AdminMatch } from '@/types/admin';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { MatchesTable } from '@/components/matches/MatchesTable';
import { CreateMatchDialog } from '@/components/matches/CreateMatchDialog';
import { UpdateResultDialog } from '@/components/matches/UpdateResultDialog';
import { Plus } from 'lucide-react';

export function MatchesPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [resultMatch, setResultMatch] = useState<AdminMatch | null>(null);

  function handleCreateSubmit(data: {
    gameId: string;
    teamAId: string;
    teamBId: string;
    tournament: string;
    scheduledAt: string;
  }) {
    console.log('Create match:', data);
    setCreateOpen(false);
  }

  function handleUpdateResult(winner: string, scoreA: number, scoreB: number) {
    console.log('Update result:', { matchId: resultMatch?.id, winner, scoreA, scoreB });
    setResultMatch(null);
  }

  function handleDelete(id: string) {
    console.log('Delete match:', id);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Tran dau"
        description="Quan ly tran dau"
        actions={
          <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" />
            + Tao tran dau moi
          </Button>
        }
      />

      <div className="bg-bg-card border border-border-subtle rounded-sm overflow-hidden">
        <MatchesTable
          matches={mockMatches}
          onUpdateResult={setResultMatch}
          onDelete={handleDelete}
        />
      </div>

      <CreateMatchDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <UpdateResultDialog
        match={resultMatch}
        open={resultMatch !== null}
        onClose={() => setResultMatch(null)}
        onSubmit={handleUpdateResult}
      />
    </div>
  );
}
