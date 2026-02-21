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

interface RejectDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function RejectDialog({ open, onClose, onConfirm }: RejectDialogProps) {
  const [reason, setReason] = useState('');

  function handleConfirm() {
    onConfirm(reason);
    setReason('');
    onClose();
  }

  function handleClose() {
    setReason('');
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tu choi danh gia</DialogTitle>
          <DialogDescription>
            Vui long nhap ly do tu choi danh gia nay.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          placeholder="Ly do tu choi..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
        />

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Huy
          </Button>
          <Button variant="destructive" size="sm" onClick={handleConfirm}>
            Xac nhan tu choi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
