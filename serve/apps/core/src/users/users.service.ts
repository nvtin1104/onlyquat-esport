import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService, UserRole, UserStatus } from '@app/common';
import type { User } from '@app/common';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto, UpdateRoleDto, AdminCreateUserDto } from '../dtos';

type SafeUser = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Validate that accountType = 0 for ROOT, ADMIN, STAFF roles
   */
  private validateRoleAccountType(roles: UserRole[], accountType: number): void {
    const adminRoles: UserRole[] = [UserRole.ROOT, UserRole.ADMIN, UserRole.STAFF];
    const hasAdminRole = roles.some((role) => adminRoles.includes(role));

    if (hasAdminRole && accountType !== 0) {
      throw new BadRequestException('errors.ADMIN_ROLE_ACCOUNT_TYPE_MISMATCH');
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException('errors.EMAIL_ALREADY_EXISTS');
    }

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: createUserDto.password,
        username: createUserDto.username,
        name: createUserDto.name,
        role: [UserRole.USER],
        accountType: 1,
      },
    });
  }

  async adminCreate(adminCreateUserDto: AdminCreateUserDto): Promise<SafeUser> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: adminCreateUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException('errors.EMAIL_ALREADY_EXISTS');
    }

    const existingUsername = await this.prisma.user.findFirst({
      where: { username: adminCreateUserDto.username },
    });
    if (existingUsername) {
      throw new ConflictException('errors.USERNAME_ALREADY_EXISTS');
    }

    // Validate accountType for admin roles
    this.validateRoleAccountType(adminCreateUserDto.roles, adminCreateUserDto.accountType);

    const hashedPassword = await bcrypt.hash(adminCreateUserDto.password, this.SALT_ROUNDS);

    return this.prisma.user.create({
      data: {
        email: adminCreateUserDto.email,
        password: hashedPassword,
        username: adminCreateUserDto.username,
        name: adminCreateUserDto.name,
        role: adminCreateUserDto.roles,
        accountType: adminCreateUserDto.accountType,
      },
      omit: { password: true },
    });
  }

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
    role?: string,
    status?: string,
  ): Promise<{ data: SafeUser[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const skip = (page - 1) * limit;
    const params: any[] = [];

    // Build WHERE conditions dynamically
    const conditions: string[] = [];

    // Accent-insensitive search using unaccent() extension
    // unaccent('Nguyên') matches 'Nguyễn', 'Nguyen', etc.
    if (search?.trim()) {
      const term = search.trim();
      params.push(`%${term}%`);
      const p = params.length;
      conditions.push(`(
        unaccent(u.username) ILIKE unaccent($${p}) OR
        unaccent(u.email)    ILIKE unaccent($${p}) OR
        unaccent(COALESCE(u.name, '')) ILIKE unaccent($${p})
      )`);
    }

    // Role filter — check PostgreSQL array contains
    if (role?.trim()) {
      params.push(role.trim());
      conditions.push(`$${params.length}::text = ANY(u.role::text[])`);
    }

    // Status filter
    if (status?.trim()) {
      params.push(status.trim());
      conditions.push(`u.status::text = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Data query — all columns except password
    const dataParams = [...params, limit, skip];
    const limitP = dataParams.length - 1;
    const offsetP = dataParams.length;

    const dataQuery = `
      SELECT
        u.id, u.email, u.username, u.name, u."accountType",
        array_to_json(u.role)::text AS role,
        u.status::text AS status,
        u.avatar, u."ggId", u.bio,
        u."suspendedAt", u."suspendedUntil", u."suspensionReason",
        u."createdAt", u."updatedAt"
      FROM users u
      ${whereClause}
      ORDER BY u."createdAt" DESC
      LIMIT $${limitP} OFFSET $${offsetP}
    `;

    // Count query — reuse same WHERE
    const countQuery = `SELECT COUNT(*)::int AS count FROM users u ${whereClause}`;

    const [rows, countRows] = await Promise.all([
      this.prisma.$queryRawUnsafe<any[]>(dataQuery, ...dataParams),
      this.prisma.$queryRawUnsafe<{ count: number }[]>(countQuery, ...params),
    ]);

    // Parse role from JSON string back to array (raw queries return JSON as string)
    const data: SafeUser[] = rows.map((row) => ({
      ...row,
      role: typeof row.role === 'string' ? JSON.parse(row.role) : (row.role ?? []),
    }));

    const total = Number(countRows[0]?.count ?? 0);
    const totalPages = Math.ceil(total / limit);

    return { data, meta: { total, page, limit, totalPages } };
  }

  async findById(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      omit: { password: true },
    });
    if (!user) {
      throw new NotFoundException('errors.USER_NOT_FOUND');
    }
    return user;
  }

  async findByEmail(email: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { email },
      omit: { password: true },
    });
  }

  /** Internal use only - returns password field for auth verification */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('errors.USER_NOT_FOUND');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
      omit: { password: true },
    });
  }

  async delete(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('errors.USER_NOT_FOUND');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.UNACTIVE },
    });
    return { message: 'errors.USER_DEACTIVATED' };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('errors.USER_NOT_FOUND');
    }

    const isOldPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('errors.OLD_PASSWORD_INCORRECT');
    }

    const hashedPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      this.SALT_ROUNDS,
    );
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'errors.PASSWORD_CHANGED' };
  }

  async updateRole(
    userId: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('errors.USER_NOT_FOUND');
    }

    // Validate accountType for admin roles
    this.validateRoleAccountType(updateRoleDto.roles, user.accountType);

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: updateRoleDto.roles },
      omit: { password: true },
    });
  }
}
