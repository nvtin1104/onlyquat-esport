import { useState } from 'react';
import { mockTeams, games } from '@/data/mock-data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';

interface CreateMatchFormData {
  gameId: string;
  teamAId: string;
  teamBId: string;
  tournament: string;
  scheduledAt: string;
}

interface CreateMatchDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMatchFormData) => void;
}

const gameOptions = games.map((g) => ({ value: g.id, label: g.name }));
const teamOptions = mockTeams.map((t) => ({ value: t.id, label: `[${t.tag}] ${t.name}` }));

export function CreateMatchDialog({ open, onClose, onSubmit }: CreateMatchDialogProps) {
  const [gameId, setGameId] = useState('');
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  const [tournament, setTournament] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const teamBOptions = teamOptions.filter((t) => t.value !== teamAId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ gameId, teamAId, teamBId, tournament, scheduledAt });
    handleReset();
  }

  function handleReset() {
    setGameId('');
    setTeamAId('');
    setTeamBId('');
    setTournament('');
    setScheduledAt('');
  }

  function handleClose() {
    handleReset();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogClose />
        <DialogHeader>
          <DialogTitle>Tao tran dau moi</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Game */}
          <div className="space-y-1.5">
            <Label htmlFor="game-select">Game</Label>
            <Select
              id="game-select"
              options={gameOptions}
              placeholder="Chon game..."
              value={gameId}
              onChange={setGameId}
            />
          </div>

          {/* Team A */}
          <div className="space-y-1.5">
            <Label htmlFor="team-a-select">Doi A</Label>
            <Select
              id="team-a-select"
              options={teamOptions}
              placeholder="Chon doi A..."
              value={teamAId}
              onChange={(val) => {
                setTeamAId(val);
                if (val === teamBId) setTeamBId('');
              }}
            />
          </div>

          {/* Team B */}
          <div className="space-y-1.5">
            <Label htmlFor="team-b-select">Doi B</Label>
            <Select
              id="team-b-select"
              options={teamBOptions}
              placeholder="Chon doi B..."
              value={teamBId}
              onChange={setTeamBId}
              disabled={!teamAId}
            />
          </div>

          {/* Tournament */}
          <div className="space-y-1.5">
            <Label htmlFor="tournament-input">Giai dau</Label>
            <Input
              id="tournament-input"
              placeholder="Ten giai dau..."
              value={tournament}
              onChange={(e) => setTournament(e.target.value)}
            />
          </div>

          {/* Scheduled time */}
          <div className="space-y-1.5">
            <Label htmlFor="time-input">Thoi gian</Label>
            <Input
              id="time-input"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>
              Huy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!gameId || !teamAId || !teamBId || !tournament || !scheduledAt}
            >
              Tao tran dau
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
