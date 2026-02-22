import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, PlayerTier, TeamMemberRole, UserRole, UserStatus, OrganizationType } from '../generated/prisma/client';
import { seedPermissions } from './seeds/permissions.seed';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // ─── Admin Account ───────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  await prisma.user.upsert({
    where: { email: 'admin@onlyquat.com' },
    update: {},
    create: {
      email: 'admin@onlyquat.com',
      password: adminPassword,
      username: 'admin',
      name: 'Super Admin',
      accountType: 0,
      role: [UserRole.ADMIN],
      status: UserStatus.ACTIVE,
    },
  });
  console.log('  Created admin account: admin@onlyquat.com / Admin@123456');

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
        regionTag: 'VN',
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
        regionTag: 'VN',
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
        regionTag: 'VN',
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

  // ─── Regions ────────────────────────────────────────────────────────
  const regions = await Promise.all([
    prisma.region.upsert({
      where: { code: 'HN' },
      update: {},
      create: {
        name: 'Hà Nội',
        code: 'HN',
        logo: '/images/regions/hanoi.svg',
      },
    }),
    prisma.region.upsert({
      where: { code: 'HCM' },
      update: {},
      create: {
        name: 'Hồ Chí Minh',
        code: 'HCM',
        logo: '/images/regions/hochiminh.svg',
      },
    }),
    prisma.region.upsert({
      where: { code: 'DN' },
      update: {},
      create: {
        name: 'Đà Nẵng',
        code: 'DN',
        logo: '/images/regions/danang.svg',
      },
    }),
    prisma.region.upsert({
      where: { code: 'VN' },
      update: {},
      create: {
        name: 'Vietnam',
        code: 'VN',
        logo: '/images/regions/vietnam.svg',
      },
    }),
    prisma.region.upsert({
      where: { code: 'SEA' },
      update: {},
      create: {
        name: 'Southeast Asia',
        code: 'SEA',
        logo: '/images/regions/sea.svg',
      },
    }),
  ]);

  const [regionHN, regionHCM, regionDN, regionVN] = regions;
  console.log(`  Created ${regions.length} regions`);

  // ─── Organizations ───────────────────────────────────────────────────
  // Re-fetch admin user for ownerId
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@onlyquat.com' } });
  if (!adminUser) throw new Error('Admin user not found — run seed again');

  const orgs = await Promise.all([
    prisma.organization.upsert({
      where: { name: 'GAM Esports' },
      update: {},
      create: {
        name: 'GAM Esports',
        shortName: 'GAM',
        logo: 'https://api.dicebear.com/9.x/initials/svg?seed=GAM',
        website: 'https://gamesports.vn',
        description: 'Câu lạc bộ esports hàng đầu Việt Nam, nổi tiếng ở đấu trường Liên Minh Huyền Thoại.',
        descriptionI18n: {
          en: "Vietnam's premier esports organization, renowned in the League of Legends competitive scene.",
          vi: 'Câu lạc bộ esports hàng đầu Việt Nam, nổi tiếng ở đấu trường Liên Minh Huyền Thoại.',
        },
        roles: [OrganizationType.ORGANIZER, OrganizationType.CLUB],
        mediaLinks: [
          { url: 'https://www.facebook.com/GAMesports', description: 'Facebook' },
          { url: 'https://www.youtube.com/@GAMesports', description: 'YouTube' },
        ],
        ownerId: adminUser.id,
        regionId: regionHCM.id,
      },
    }),
    prisma.organization.upsert({
      where: { name: 'Team Flash' },
      update: {},
      create: {
        name: 'Team Flash',
        shortName: 'Flash',
        logo: 'https://api.dicebear.com/9.x/initials/svg?seed=Flash',
        website: 'https://teamflash.vn',
        description: 'Tổ chức esports đa bộ môn lớn nhất Việt Nam, vô địch nhiều giải đấu quốc tế.',
        descriptionI18n: {
          en: "Vietnam's largest multi-title esports organization with multiple international championship titles.",
          vi: 'Tổ chức esports đa bộ môn lớn nhất Việt Nam, vô địch nhiều giải đấu quốc tế.',
        },
        roles: [OrganizationType.ORGANIZER, OrganizationType.CLUB],
        mediaLinks: [
          { url: 'https://www.facebook.com/teamflashvn', description: 'Facebook' },
        ],
        ownerId: adminUser.id,
        regionId: regionHN.id,
      },
    }),
    prisma.organization.upsert({
      where: { name: 'Saigon Buffalo' },
      update: {},
      create: {
        name: 'Saigon Buffalo',
        shortName: 'SGB',
        logo: 'https://api.dicebear.com/9.x/initials/svg?seed=SGB',
        website: 'https://saigonbuffalo.com',
        description: 'Đội tuyển LMHT đại diện Việt Nam tại giải đấu quốc tế LCS.',
        descriptionI18n: {
          en: 'Vietnamese League of Legends team competing in the international LCS championship.',
          vi: 'Đội tuyển LMHT đại diện Việt Nam tại giải đấu quốc tế LCS.',
        },
        roles: [OrganizationType.CLUB],
        mediaLinks: [
          { url: 'https://www.facebook.com/saigonbuffalo', description: 'Facebook' },
        ],
        ownerId: adminUser.id,
        regionId: regionHCM.id,
      },
    }),
    prisma.organization.upsert({
      where: { name: 'Vietnam Pro Esports' },
      update: {},
      create: {
        name: 'Vietnam Pro Esports',
        shortName: 'VPE',
        logo: 'https://api.dicebear.com/9.x/initials/svg?seed=VPE',
        website: 'https://vpe.vn',
        description: 'Đơn vị tổ chức giải đấu esports chuyên nghiệp tại Việt Nam.',
        descriptionI18n: {
          en: 'Professional esports tournament organizer in Vietnam, hosting premier domestic competitions.',
          vi: 'Đơn vị tổ chức giải đấu esports chuyên nghiệp tại Việt Nam.',
        },
        roles: [OrganizationType.ORGANIZER],
        mediaLinks: [],
        ownerId: adminUser.id,
        regionId: regionVN.id,
      },
    }),
    prisma.organization.upsert({
      where: { name: 'Da Nang Storm' },
      update: {},
      create: {
        name: 'Da Nang Storm',
        shortName: 'DNS',
        logo: 'https://api.dicebear.com/9.x/initials/svg?seed=DNS',
        description: 'Tổ chức esports khu vực miền Trung, đại diện cho Đà Nẵng tại các giải đấu toàn quốc.',
        descriptionI18n: {
          en: 'Central Vietnam esports organization representing Da Nang in national competitions.',
          vi: 'Tổ chức esports khu vực miền Trung, đại diện cho Đà Nẵng tại các giải đấu toàn quốc.',
        },
        roles: [OrganizationType.CLUB, OrganizationType.ORGANIZER],
        mediaLinks: [],
        ownerId: adminUser.id,
        regionId: regionDN.id,
      },
    }),
  ]);

  console.log(`  Created ${orgs.length} organizations`);

  // ─── Permissions ────────────────────────────────────────────────────
  await seedPermissions(prisma);

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
