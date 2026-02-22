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
  ): Promise<{ users: SafeUser[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        omit: { password: true },
      }),
      this.prisma.user.count(),
    ]);
    return { users, total, page, limit };
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
