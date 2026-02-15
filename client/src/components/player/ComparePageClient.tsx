'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown, Trophy, Minus } from 'lucide-react';
import type { Player } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { RadarChart } from '@/components/charts/RadarChart';
import { CompareChart } from '@/components/charts/CompareChart';
import { RatingNumber } from '@/components/ui/RatingNumber';
import { cn, TIER_COLORS, formatRating } from '@/lib/utils';
import { STAT_LABELS } from '@/lib/constants';

interface ComparePageClientProps {
  players: Player[];
}

const GAME_SHORT: Record<string, string> = {
  g1: 'LoL',
  g2: 'VAL',
  g3: 'Dota2',
  g4: 'CS2',
};

function PlayerSelector({
  label,
  color,
  selected,
  search,
  onSearch,
  players,
  onSelect,
  onClear,
}: {
  label: string;
  color: 'acid' | 'lava';
  selected: Player | null;
  search: string;
  onSearch: (v: string) => void;
  players: Player[];
  onSelect: (p: Player) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const accentColor = color === 'acid' ? '#CCFF00' : '#FF4D00';
  const filtered = players.filter((p) =>
    p.displayName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 min-w-0" ref={ref}>
      <span
        className="font-mono text-[10px] uppercase tracking-[0.2em] mb-3 block"
        style={{ color: accentColor }}
      >
        {label}
      </span>

      {selected ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-bg-elevated border rounded-sm overflow-hidden"
          style={{ borderColor: `${accentColor}66` }}
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-bg-surface">
            <Image
              src={selected.imageUrl}
              alt={selected.displayName}
              fill
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-bg-elevated to-transparent" />
            <button
              onClick={onClear}
              className="absolute top-3 right-3 z-10 w-7 h-7 bg-bg-base/80 border border-border-subtle rounded-sm flex items-center justify-center hover:border-accent-lava transition-colors"
            >
              <X className="w-3.5 h-3.5 text-text-secondary" />
            </button>
            <Badge tier={selected.tier} className="absolute top-3 left-3 z-10" />
          </div>
          <div className="p-4">
            <h3 className="font-display font-bold text-lg text-text-primary">
              {selected.displayName}
            </h3>
            <p className="font-mono text-[10px] uppercase tracking-wider text-text-dim mt-0.5">
              {selected.role} &middot; {GAME_SHORT[selected.gameId] ?? selected.gameId}
            </p>
            <div className="flex items-baseline gap-1 mt-3">
              <RatingNumber value={selected.rating} size="md" />
              <span className="font-mono text-xs text-text-dim">/10</span>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
            <input
              value={search}
              onChange={(e) => {
                onSearch(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Tìm tuyển thủ..."
              className={cn(
                'w-full bg-bg-surface border border-border-subtle rounded-sm pl-10 pr-10 py-3',
                'font-body text-sm text-text-primary placeholder:text-text-dim',
                'focus:outline-none transition-colors duration-300'
              )}
              style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false);
              }}
            />
            <ChevronDown
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim transition-transform duration-200',
                open && 'rotate-180'
              )}
            />
          </div>

          <AnimatePresence>
            {open && filtered.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute z-20 left-0 right-0 mt-1 bg-bg-elevated border border-border-subtle rounded-sm overflow-hidden shadow-xl max-h-64 overflow-y-auto"
              >
                {filtered.map((p) => (
                  <li key={p.id}>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg-surface transition-colors text-left group"
                      onClick={() => {
                        onSelect(p);
                        onSearch('');
                        setOpen(false);
                      }}
                    >
                      <div className="w-8 h-8 rounded-sm overflow-hidden bg-bg-surface shrink-0 relative">
                        <Image src={p.imageUrl} alt={p.displayName} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm text-text-primary group-hover:text-accent-acid truncate transition-colors">
                          {p.displayName}
                        </p>
                        <p className="font-mono text-[10px] text-text-dim uppercase">
                          {p.role} &middot; {GAME_SHORT[p.gameId] ?? p.gameId}
                        </p>
                      </div>
                      <span
                        className="font-mono text-sm font-bold shrink-0"
                        style={{ color: TIER_COLORS[p.tier] }}
                      >
                        {formatRating(p.rating)}
                      </span>
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export function ComparePageClient({ players }: ComparePageClientProps) {
  const [selectedA, setSelectedA] = useState<Player | null>(null);
  const [selectedB, setSelectedB] = useState<Player | null>(null);
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');

  const bothSelected = selectedA !== null && selectedB !== null;

  const statKeys = ['aim', 'gameIq', 'clutch', 'teamplay', 'consistency'] as const;

  const winsA = bothSelected
    ? statKeys.filter((k) => selectedA.stats[k] > selectedB!.stats[k]).length
    : 0;
  const winsB = bothSelected
    ? statKeys.filter((k) => selectedB!.stats[k] > selectedA.stats[k]).length
    : 0;

  const totalDiff = bothSelected
    ? Math.abs(
        statKeys.reduce((sum, k) => sum + selectedA.stats[k] - selectedB!.stats[k], 0)
      )
    : 0;

  const verdict: 'A' | 'B' | 'tie' = bothSelected
    ? winsA > winsB
      ? 'A'
      : winsB > winsA
      ? 'B'
      : 'tie'
    : 'tie';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Page header */}
      <div className="mb-10">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-acid mb-2 block">
          So sánh
        </span>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-text-primary">
          Head-to-Head
        </h1>
        <p className="font-body text-text-secondary mt-2">
          Chọn hai tuyển thủ để so sánh chỉ số trực tiếp.
        </p>
      </div>

      {/* Selector row */}
      <div className="flex items-start gap-4 md:gap-8">
        <PlayerSelector
          label="Tuyển thủ A"
          color="acid"
          selected={selectedA}
          search={searchA}
          onSearch={setSearchA}
          players={players.filter((p) => p.id !== selectedB?.id)}
          onSelect={setSelectedA}
          onClear={() => setSelectedA(null)}
        />

        <div className="flex flex-col items-center justify-center pt-8 shrink-0">
          <span className="font-display font-bold text-2xl md:text-3xl text-text-dim">VS</span>
        </div>

        <PlayerSelector
          label="Tuyển thủ B"
          color="lava"
          selected={selectedB}
          search={searchB}
          onSearch={setSearchB}
          players={players.filter((p) => p.id !== selectedA?.id)}
          onSelect={setSelectedB}
          onClear={() => setSelectedB(null)}
        />
      </div>

      {/* Comparison content */}
      <AnimatePresence>
        {bothSelected && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="mt-12 space-y-8"
          >
            {/* Radar Chart */}
            <div className="bg-bg-elevated border border-border-subtle rounded-sm p-6">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-dim mb-6">
                Radar Thống Kê
              </h2>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                <span className="font-display font-semibold text-sm" style={{ color: '#CCFF00' }}>
                  — {selectedA.displayName}
                </span>
                <span className="font-display font-semibold text-sm" style={{ color: '#FF4D00' }}>
                  — {selectedB.displayName}
                </span>
              </div>
              <RadarChart stats={selectedA.stats} compareStats={selectedB.stats} />
            </div>

            {/* Bar comparison */}
            <div className="bg-bg-elevated border border-border-subtle rounded-sm p-6">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-dim mb-6">
                So Sánh Chỉ Số
              </h2>
              <CompareChart
                statsA={selectedA.stats}
                statsB={selectedB.stats}
                nameA={selectedA.displayName}
                nameB={selectedB.displayName}
              />
            </div>

            {/* Stat breakdown table */}
            <div className="bg-bg-elevated border border-border-subtle rounded-sm overflow-hidden">
              <div className="p-6 border-b border-border-subtle">
                <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-dim">
                  Chi Tiết Chỉ Số
                </h2>
              </div>
              <div className="divide-y divide-border-subtle">
                {statKeys.map((key) => {
                  const valA = selectedA.stats[key];
                  const valB = selectedB.stats[key];
                  const aWins = valA > valB;
                  const bWins = valB > valA;
                  return (
                    <div key={key} className="flex items-center px-6 py-4">
                      <span
                        className="font-mono text-base font-bold w-12 text-right"
                        style={{ color: aWins ? '#CCFF00' : '#555555' }}
                      >
                        {valA}
                      </span>
                      <div className="flex-1 flex items-center justify-center px-4">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-text-dim">
                          {STAT_LABELS[key]}
                        </span>
                        {aWins && (
                          <span className="ml-2 font-mono text-[10px] text-accent-acid">◄</span>
                        )}
                        {bWins && (
                          <span className="ml-2 font-mono text-[10px] text-accent-lava">►</span>
                        )}
                        {!aWins && !bWins && (
                          <Minus className="ml-2 w-3 h-3 text-text-dim" />
                        )}
                      </div>
                      <span
                        className="font-mono text-base font-bold w-12"
                        style={{ color: bWins ? '#FF4D00' : '#555555' }}
                      >
                        {valB}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verdict */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-bg-elevated border border-border-subtle rounded-sm p-8 text-center"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-dim mb-4 block">
                Kết Luận
              </span>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
                <div className="text-center">
                  <div
                    className="font-display font-bold text-xl"
                    style={{ color: verdict === 'A' ? '#CCFF00' : '#555555' }}
                  >
                    {selectedA.displayName}
                  </div>
                  <div className="font-mono text-4xl font-bold mt-1" style={{ color: '#CCFF00' }}>
                    {winsA}
                  </div>
                  <div className="font-mono text-[10px] text-text-dim uppercase tracking-wider mt-1">
                    chỉ số thắng
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  {verdict !== 'tie' ? (
                    <Trophy
                      className="w-8 h-8 mb-2"
                      style={{ color: verdict === 'A' ? '#CCFF00' : '#FF4D00' }}
                    />
                  ) : (
                    <Minus className="w-8 h-8 mb-2 text-text-dim" />
                  )}
                  <span className="font-mono text-xs text-text-dim">
                    {verdict === 'tie'
                      ? 'Hòa'
                      : `${verdict === 'A' ? selectedA.displayName : selectedB.displayName} thắng`}
                  </span>
                  <span className="font-mono text-[10px] text-text-dim mt-1">
                    cách biệt {totalDiff} điểm
                  </span>
                </div>

                <div className="text-center">
                  <div
                    className="font-display font-bold text-xl"
                    style={{ color: verdict === 'B' ? '#FF4D00' : '#555555' }}
                  >
                    {selectedB.displayName}
                  </div>
                  <div className="font-mono text-4xl font-bold mt-1" style={{ color: '#FF4D00' }}>
                    {winsB}
                  </div>
                  <div className="font-mono text-[10px] text-text-dim uppercase tracking-wider mt-1">
                    chỉ số thắng
                  </div>
                </div>
              </div>

              {/* Summary sentence */}
              <p className="font-body text-text-secondary mt-6">
                {verdict === 'tie' ? (
                  <>
                    <span className="text-accent-acid">{selectedA.displayName}</span> và{' '}
                    <span style={{ color: '#FF4D00' }}>{selectedB.displayName}</span> hòa nhau{' '}
                    <span className="text-text-primary font-semibold">
                      {winsA}/{statKeys.length}
                    </span>{' '}
                    chỉ số.
                  </>
                ) : verdict === 'A' ? (
                  <>
                    <span className="text-accent-acid font-semibold">{selectedA.displayName}</span>{' '}
                    thắng{' '}
                    <span className="text-text-primary font-semibold">
                      {winsA}/{statKeys.length}
                    </span>{' '}
                    chỉ số.
                  </>
                ) : (
                  <>
                    <span style={{ color: '#FF4D00' }} className="font-semibold">
                      {selectedB.displayName}
                    </span>{' '}
                    thắng{' '}
                    <span className="text-text-primary font-semibold">
                      {winsB}/{statKeys.length}
                    </span>{' '}
                    chỉ số.
                  </>
                )}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!bothSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 border border-border-subtle rounded-sm mb-4">
            <span className="font-display font-bold text-2xl text-text-dim">VS</span>
          </div>
          <p className="font-body text-text-secondary">
            {!selectedA && !selectedB
              ? 'Chọn hai tuyển thủ để bắt đầu so sánh.'
              : 'Chọn thêm một tuyển thủ để so sánh.'}
          </p>
        </motion.div>
      )}
    </div>
  );
}
