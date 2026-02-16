import { PrismaClient, PlayerTier, TeamMemberRole } from '../generated/prisma/client';

const prisma = new PrismaClient({});

async function main() {
  console.log('Seeding database...');

  // ─── Games ──────────────────────────────────────────────────────────
  const games = await Promise.all([
    prisma.game.upsert({
      where: { name: 'League of Legends' },
      update: {},
      create: {
        name: 'League of Legends',
        shortName: 'LoL',
        iconUrl: '/images/games/lol.svg',
        roles: ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
      },
    }),
    prisma.game.upsert({
      where: { name: 'Valorant' },
      update: {},
      create: {
        name: 'Valorant',
        shortName: 'VAL',
        iconUrl: '/images/games/val.svg',
        roles: ['Duelist', 'Controller', 'Initiator', 'Sentinel'],
      },
    }),
    prisma.game.upsert({
      where: { name: 'Dota 2' },
      update: {},
      create: {
        name: 'Dota 2',
        shortName: 'Dota2',
        iconUrl: '/images/games/dota2.svg',
        roles: ['Carry', 'Mid', 'Offlane', 'Support', 'Hard Support'],
      },
    }),
    prisma.game.upsert({
      where: { name: 'Counter-Strike 2' },
      update: {},
      create: {
        name: 'Counter-Strike 2',
        shortName: 'CS2',
        iconUrl: '/images/games/cs2.svg',
        roles: ['Entry', 'AWPer', 'Lurker', 'Support', 'IGL'],
      },
    }),
  ]);

  const [lol, val, dota2, cs2] = games;
  console.log(`  Created ${games.length} games`);

  // ─── Teams ──────────────────────────────────────────────────────────
  const teams = await Promise.all([
    prisma.team.upsert({
      where: { slug: 'team-alpha' },
      update: {},
      create: {
        slug: 'team-alpha',
        name: 'Team Alpha',
        tag: 'ALP',
        logoUrl: 'https://api.dicebear.com/9.x/identicon/svg?seed=alpha',
        region: 'VN',
      },
    }),
    prisma.team.upsert({
      where: { slug: 'phoenix-rising' },
      update: {},
      create: {
        slug: 'phoenix-rising',
        name: 'Phoenix Rising',
        tag: 'PHX',
        logoUrl: 'https://api.dicebear.com/9.x/identicon/svg?seed=phoenix',
        region: 'VN',
      },
    }),
    prisma.team.upsert({
      where: { slug: 'shadow-legion' },
      update: {},
      create: {
        slug: 'shadow-legion',
        name: 'Shadow Legion',
        tag: 'SHL',
        logoUrl: 'https://api.dicebear.com/9.x/identicon/svg?seed=shadow',
        region: 'VN',
      },
    }),
  ]);

  const [alpha, phoenix, shadow] = teams;
  console.log(`  Created ${teams.length} teams`);

  // ─── Players (no user accounts — pro profiles only) ─────────────────
  const playerData = [
    {
      slug: 'dragonslayer99',
      displayName: 'DragonSlayer99',
      realName: 'Nguyễn Minh Đức',
      nationality: 'VN',
      imageUrl:
        'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=dragonslayer',
      gameId: lol.id,
      teamId: alpha.id,
      role: 'Mid',
      rating: 9.8,
      aim: 96,
      gameIq: 94,
      clutch: 98,
      teamplay: 90,
      consistency: 95,
      totalRatings: 12450,
      tier: PlayerTier.S,
      rank: 1,
    },
    {
      slug: 'thunderace',
      displayName: 'ThunderAce',
      realName: 'Trần Hoàng Nam',
      nationality: 'VN',
      imageUrl:
        'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=thunderace',
      gameId: val.id,
      teamId: phoenix.id,
      role: 'Duelist',
      rating: 9.5,
      aim: 98,
      gameIq: 88,
      clutch: 92,
      teamplay: 85,
      consistency: 91,
      totalRatings: 9830,
      tier: PlayerTier.S,
      rank: 2,
    },
    {
      slug: 'kitsunepro',
      displayName: 'KitsunePro',
      realName: 'Lê Thị Hương',
      nationality: 'VN',
      imageUrl:
        'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=kitsunepro',
      gameId: dota2.id,
      teamId: shadow.id,
      role: 'Carry',
      rating: 9.3,
      aim: 89,
      gameIq: 97,
      clutch: 86,
      teamplay: 92,
      consistency: 94,
      totalRatings: 8200,
      tier: PlayerTier.S,
      rank: 3,
    },
    {
      slug: 'sakurawind',
      displayName: 'SakuraWind',
      realName: 'Phạm Anh Thư',
      nationality: 'VN',
      imageUrl:
        'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=sakurawind',
      gameId: cs2.id,
      teamId: alpha.id,
      role: 'AWPer',
      rating: 9.1,
      aim: 99,
      gameIq: 90,
      clutch: 88,
      teamplay: 82,
      consistency: 87,
      totalRatings: 7650,
      tier: PlayerTier.S,
      rank: 4,
    },
    {
      slug: 'shadowviper',
      displayName: 'ShadowViper',
      realName: 'Võ Quốc Huy',
      nationality: 'VN',
      imageUrl:
        'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=shadowviper',
      gameId: val.id,
      teamId: phoenix.id,
      role: 'Controller',
      rating: 8.7,
      aim: 82,
      gameIq: 95,
      clutch: 84,
      teamplay: 96,
      consistency: 90,
      totalRatings: 5420,
      tier: PlayerTier.A,
      rank: 5,
    },
    {
      slug: 'blazequeen',
      displayName: 'BlazeQueen',
      realName: 'Đặng Thùy Linh',
      nationality: 'VN',
      imageUrl:
        'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=blazequeen',
      gameId: lol.id,
      teamId: shadow.id,
      role: 'ADC',
      rating: 8.4,
      aim: 93,
      gameIq: 86,
      clutch: 80,
      teamplay: 88,
      consistency: 85,
      totalRatings: 4890,
      tier: PlayerTier.A,
      rank: 6,
    },
    {
      slug: 'ironwolf',
      displayName: 'IronWolf',
      realName: 'Bùi Đức Anh',
      nationality: 'VN',
      imageUrl:
        'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=ironwolf',
      gameId: dota2.id,
      teamId: alpha.id,
      role: 'Offlane',
      rating: 7.9,
      aim: 78,
      gameIq: 88,
      clutch: 82,
      teamplay: 90,
      consistency: 80,
      totalRatings: 3200,
      tier: PlayerTier.B,
      rank: 7,
    },
    {
      slug: 'neonrush',
      displayName: 'NeonRush',
      realName: 'Hoàng Văn Tùng',
      nationality: 'VN',
      imageUrl:
        'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=neonrush',
      gameId: cs2.id,
      teamId: phoenix.id,
      role: 'Entry',
      rating: 7.5,
      aim: 90,
      gameIq: 72,
      clutch: 78,
      teamplay: 75,
      consistency: 70,
      totalRatings: 2100,
      tier: PlayerTier.B,
      rank: 8,
    },
  ];

  const players: Record<string, { id: string }> = {};
  for (const data of playerData) {
    const player = await prisma.player.upsert({
      where: { slug: data.slug },
      update: {},
      create: data,
    });
    players[data.slug] = player;
  }
  console.log(`  Created ${playerData.length} players`);

  // ─── Team Members ───────────────────────────────────────────────────
  const memberLinks = [
    { teamId: alpha.id, slug: 'dragonslayer99', role: TeamMemberRole.captain },
    { teamId: alpha.id, slug: 'sakurawind', role: TeamMemberRole.player },
    { teamId: alpha.id, slug: 'ironwolf', role: TeamMemberRole.player },
    { teamId: phoenix.id, slug: 'thunderace', role: TeamMemberRole.captain },
    { teamId: phoenix.id, slug: 'shadowviper', role: TeamMemberRole.player },
    { teamId: phoenix.id, slug: 'neonrush', role: TeamMemberRole.player },
    { teamId: shadow.id, slug: 'kitsunepro', role: TeamMemberRole.captain },
    { teamId: shadow.id, slug: 'blazequeen', role: TeamMemberRole.player },
  ];

  // Delete existing team members to avoid duplicate issues on re-seed
  await prisma.teamMember.deleteMany();

  for (const link of memberLinks) {
    const playerId = players[link.slug].id;
    await prisma.teamMember.create({
      data: {
        teamId: link.teamId,
        playerId,
        role: link.role,
      },
    });
  }
  console.log(`  Created ${memberLinks.length} team members`);

  // ─── Ratings ────────────────────────────────────────────────────────
  // Delete existing ratings to avoid duplicates on re-seed
  await prisma.rating.deleteMany();

  const ratingsData = [
    {
      playerId: players['dragonslayer99'].id,
      userName: 'ProGamer_VN',
      userAvatar:
        'https://api.dicebear.com/9.x/avataaars/svg?seed=progamer',
      overall: 9.5,
      aim: 95,
      gameIq: 93,
      clutch: 97,
      teamplay: 89,
      consistency: 94,
      comment:
        'Chơi mid quá đỉnh! Mechanics cực kỳ clean, decision-making thuộc top đầu.',
      createdAt: new Date('2026-02-13T10:30:00Z'),
    },
    {
      playerId: players['dragonslayer99'].id,
      userName: 'EsportFan99',
      userAvatar:
        'https://api.dicebear.com/9.x/avataaars/svg?seed=esportfan',
      overall: 9.8,
      aim: 97,
      gameIq: 95,
      clutch: 99,
      teamplay: 91,
      consistency: 96,
      comment: 'Clutch king! Không có ai carry tốt hơn ở VN lúc này.',
      createdAt: new Date('2026-02-12T15:45:00Z'),
    },
    {
      playerId: players['thunderace'].id,
      userName: 'TacticalMind',
      userAvatar:
        'https://api.dicebear.com/9.x/avataaars/svg?seed=tactical',
      overall: 9.3,
      aim: 98,
      gameIq: 87,
      clutch: 91,
      teamplay: 84,
      consistency: 90,
      comment:
        'Aim thì không ai bàn cãi, nhưng game sense cần cải thiện thêm.',
      createdAt: new Date('2026-02-11T08:20:00Z'),
    },
    {
      playerId: players['kitsunepro'].id,
      userName: 'DotaLover',
      userAvatar:
        'https://api.dicebear.com/9.x/avataaars/svg?seed=dotalover',
      overall: 9.5,
      aim: 90,
      gameIq: 98,
      clutch: 87,
      teamplay: 93,
      consistency: 95,
      comment:
        'IQ game cao nhất server, luôn biết cách itemize và pick đúng lúc.',
      createdAt: new Date('2026-02-10T14:10:00Z'),
    },
    {
      playerId: players['dragonslayer99'].id,
      userName: 'MidLaneKing',
      userAvatar:
        'https://api.dicebear.com/9.x/avataaars/svg?seed=midlane',
      overall: 10.0,
      aim: 96,
      gameIq: 94,
      clutch: 98,
      teamplay: 90,
      consistency: 95,
      comment: 'GOAT của VN LoL, không cần bàn thêm!',
      createdAt: new Date('2026-02-09T20:00:00Z'),
    },
    {
      playerId: players['shadowviper'].id,
      userName: 'SmokeMaster',
      userAvatar:
        'https://api.dicebear.com/9.x/avataaars/svg?seed=smoke',
      overall: 8.8,
      aim: 83,
      gameIq: 96,
      clutch: 85,
      teamplay: 97,
      consistency: 91,
      comment: 'Controller tốt nhất VN, smoke timing luôn perfect.',
      createdAt: new Date('2026-02-08T11:30:00Z'),
    },
  ];

  for (const data of ratingsData) {
    await prisma.rating.create({ data });
  }
  console.log(`  Created ${ratingsData.length} ratings`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
