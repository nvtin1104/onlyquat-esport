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
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { mockUsers } from '@/data/mock-data';
import type { AdminUser } from '@/types/admin';

interface GiftPointsDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (userId: string, amount: number, reason: string) => void;
}

export function GiftPointsDialog({ open, onClose, onSubmit }: GiftPointsDialogProps) {
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const matchedUsers = userSearch.length > 0
    ? mockUsers.filter((u) =>
        u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
      )
    : [];

  function handleSelectUser(user: AdminUser) {
    setSelectedUser(user);
    setUserSearch(user.username);
    setShowDropdown(false);
  }

  function handleSubmit() {
    if (!selectedUser) return;
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount < 1 || numAmount > 10000) return;
    onSubmit(selectedUser.id, numAmount, reason);
    handleClose();
  }

  function handleClose() {
    setUserSearch('');
    setSelectedUser(null);
    setAmount('');
    setReason('');
    setShowDropdown(false);
    onClose();
  }

  const isValid =
    selectedUser !== null &&
    parseInt(amount, 10) >= 1 &&
    parseInt(amount, 10) <= 10000;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tang diem thuong</DialogTitle>
          <DialogDescription>
            Tang diem cho nguoi dung cu the.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* User search */}
          <div className="relative">
            <label className="font-mono text-xs text-text-dim uppercase mb-1.5 block">
              Nguoi dung
            </label>
            <Input
              placeholder="Tim kiem username hoac email..."
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                setSelectedUser(null);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />
            {showDropdown && matchedUsers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-bg-card border border-border-subtle rounded-sm shadow-lg overflow-hidden">
                {matchedUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm font-body text-text-primary hover:bg-bg-elevated transition-colors"
                    onClick={() => handleSelectUser(user)}
                  >
                    <span className="font-medium">{user.username}</span>
                    <span className="text-text-dim ml-2 text-xs">{user.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="font-mono text-xs text-text-dim uppercase mb-1.5 block">
              So diem (1-10000)
            </label>
            <Input
              type="number"
              placeholder="Nhap so diem..."
              value={amount}
              min={1}
              max={10000}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Reason */}
          <div>
            <label className="font-mono text-xs text-text-dim uppercase mb-1.5 block">
              Ly do
            </label>
            <Textarea
              placeholder="Ly do tang diem..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Huy
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!isValid}
          >
            Xac nhan tang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
