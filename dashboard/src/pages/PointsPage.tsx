import { useState } from 'react';
import { Gift, Coins, TrendingUp, Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataCard } from '@/components/shared/DataCard';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { TransactionsTable } from '@/components/points/TransactionsTable';
import { PointsCharts } from '@/components/points/PointsCharts';
import { GiftPointsDialog } from '@/components/points/GiftPointsDialog';
import { mockTransactions, mockUsers } from '@/data/mock-data';

const sortedByPoints = [...mockUsers].sort((a, b) => b.points - a.points).slice(0, 20);

export function PointsPage() {
  const [giftDialogOpen, setGiftDialogOpen] = useState(false);

  function handleGiftSubmit(_userId: string, _amount: number, _reason: string) {
    // In a real app, dispatch to API
    setGiftDialogOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Diem thuong"
        description="Quan ly diem thuong"
        actions={
          <Button variant="primary" size="sm" onClick={() => setGiftDialogOpen(true)}>
            <Gift className="w-4 h-4" />
            Tang diem
          </Button>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <DataCard
          icon={Coins}
          value="1,200,000"
          label="Tong diem da phat"
          change={23.1}
        />
        <DataCard
          icon={TrendingUp}
          value="850,000"
          label="Dang luu hanh"
          change={5.4}
        />
        <DataCard
          icon={Users}
          value="245"
          label="TB diem/user"
          change={8.2}
        />
      </div>

      <Tabs defaultValue="transactions">
        <TabsList className="mb-4">
          <TabsTrigger value="transactions">Giao dich</TabsTrigger>
          <TabsTrigger value="charts">Bieu do</TabsTrigger>
          <TabsTrigger value="leaderboard">BXH diem</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <TransactionsTable transactions={mockTransactions} />
        </TabsContent>

        <TabsContent value="charts">
          <PointsCharts />
        </TabsContent>

        <TabsContent value="leaderboard">
          <div className="rounded-sm border border-border-subtle overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Nguoi dung</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Diem</TableHead>
                  <TableHead>Danh gia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedByPoints.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <span className="font-mono text-text-dim">{index + 1}</span>
                    </TableCell>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell className="text-text-dim text-xs">{user.email}</TableCell>
                    <TableCell>
                      <span className="font-mono font-bold text-accent-acid">
                        {user.points.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-text-secondary">{user.ratingsCount}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <GiftPointsDialog
        open={giftDialogOpen}
        onClose={() => setGiftDialogOpen(false)}
        onSubmit={handleGiftSubmit}
      />
    </div>
  );
}
