import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import type { AdminUser } from '@/types/admin';

interface BanUserDialogProps {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (userId: string, reason: string) => void;
}

export function BanUserDialog({ user, open, onClose, onConfirm }: BanUserDialogProps) {
  const [reason, setReason] = useState('');

  function handleConfirm() {
    if (!user) return;
    onConfirm(user.id, reason);
    setReason('');
    onClose();
  }

  function handleClose() {
    setReason('');
    onClose();
  }

  const isBanning = user?.isActive ?? true;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isBanning ? 'Cam nguoi dung' : 'Bo cam nguoi dung'}</DialogTitle>
          {user && (
            <DialogDescription>
              Ban muon {isBanning ? 'cam' : 'bo cam'}{' '}
              <strong className="text-text-primary">{user.username}</strong>?
            </DialogDescription>
          )}
        </DialogHeader>

        {isBanning && (
          <div>
            <label className="font-mono text-xs text-text-dim uppercase mb-1.5 block">
              Ly do
            </label>
            <Textarea
              placeholder="Nhap ly do cam nguoi dung..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Huy
          </Button>
          <Button variant="destructive" size="sm" onClick={handleConfirm}>
            {isBanning ? 'Xac nhan cam' : 'Xac nhan bo cam'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
