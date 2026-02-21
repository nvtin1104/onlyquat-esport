import { useState, useEffect } from 'react';
import type { AdminMatch } from '@/types/admin';
import { cn } from '@/lib/utils';
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
import { Label } from '@/components/ui/Label';

interface UpdateResultDialogProps {
  match: AdminMatch | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (winner: string, scoreA: number, scoreB: number) => void;
}

export function UpdateResultDialog({ match, open, onClose, onSubmit }: UpdateResultDialogProps) {
  const [winner, setWinner] = useState('');
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);

  // Reset form when match changes
  useEffect(() => {
    if (match) {
      setWinner(match.winner ?? '');
      setScoreA(match.scoreA ?? 0);
      setScoreB(match.scoreB ?? 0);
    }
  }, [match]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!winner) return;
    onSubmit(winner, scoreA, scoreB);
    onClose();
  }

  function handleClose() {
    onClose();
  }

  if (!match) return null;

  const tagA = match.teamA.tag;
  const tagB = match.teamB.tag;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogClose />
        <DialogHeader>
          <DialogTitle>Cap nhat ket qua</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Match display */}
          <div className="text-center">
            <p className="font-body font-bold text-text-primary text-base">
              <span>[{tagA}] {match.teamA.name}</span>
              <span className="text-text-dim mx-2">vs</span>
              <span>[{tagB}] {match.teamB.name}</span>
            </p>
          </div>

          {/* Winner select */}
          <div className="space-y-2">
            <Label>Doi chien thang</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWinner(tagA)}
                className={cn(
                  'px-4 py-2.5 rounded-sm border font-mono text-sm font-bold transition-all duration-150',
                  winner === tagA
                    ? 'border-accent-acid bg-accent-acid/10 text-accent-acid shadow-[0_0_12px_rgba(204,255,0,0.2)]'
                    : 'border-border-subtle text-text-secondary hover:border-border-hover hover:text-text-primary'
                )}
              >
                [{tagA}] {match.teamA.name}
              </button>
              <button
                type="button"
                onClick={() => setWinner(tagB)}
                className={cn(
                  'px-4 py-2.5 rounded-sm border font-mono text-sm font-bold transition-all duration-150',
                  winner === tagB
                    ? 'border-accent-acid bg-accent-acid/10 text-accent-acid shadow-[0_0_12px_rgba(204,255,0,0.2)]'
                    : 'border-border-subtle text-text-secondary hover:border-border-hover hover:text-text-primary'
                )}
              >
                [{tagB}] {match.teamB.name}
              </button>
            </div>
          </div>

          {/* Score */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="score-a">Diem [{tagA}]</Label>
              <Input
                id="score-a"
                type="number"
                min={0}
                max={99}
                value={scoreA}
                onChange={(e) => setScoreA(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="score-b">Diem [{tagB}]</Label>
              <Input
                id="score-b"
                type="number"
                min={0}
                max={99}
                value={scoreB}
                onChange={(e) => setScoreB(Number(e.target.value))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>
              Huy
            </Button>
            <Button type="submit" variant="primary" disabled={!winner}>
              Luu ket qua
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
