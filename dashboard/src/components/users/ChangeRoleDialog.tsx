import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import type { AdminUser } from '@/types/admin';

const ROLE_OPTIONS = [
  { value: 'user', label: 'User' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'admin', label: 'Admin' },
];

interface ChangeRoleDialogProps {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (userId: string, newRole: string) => void;
}

export function ChangeRoleDialog({ user, open, onClose, onConfirm }: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<string>('user');

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  function handleConfirm() {
    if (!user) return;
    onConfirm(user.id, selectedRole);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Doi role nguoi dung</DialogTitle>
          {user && (
            <DialogDescription>
              Ban muon thay doi role cua <strong className="text-text-primary">{user.username}</strong>?
            </DialogDescription>
          )}
        </DialogHeader>

        <div>
          <label className="font-mono text-xs text-text-dim uppercase mb-1.5 block">
            Role moi
          </label>
          <Select
            options={ROLE_OPTIONS}
            value={selectedRole}
            onChange={setSelectedRole}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Huy
          </Button>
          <Button variant="primary" size="sm" onClick={handleConfirm}>
            Xac nhan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
