import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PermissionsService } from '../permissions/permissions.service';
import { CreateUserDto, LoginDto, TokenResponseDto } from '../dtos';
import { UserRole } from '@app/common';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly usersService: UsersService,
    private readonly permissionsService: PermissionsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<TokenResponseDto> {
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, this.SALT_ROUNDS);

    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role as UserRole[]);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        roles: user.role,
        status: user.status,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    this.logger.log(`Login attempt for: ${loginDto.email}`);

    // Step 1: Find user
    const user = await this.usersService.findByEmailWithPassword(loginDto.email);
    if (!user) {
      this.logger.warn(`Login failed: User not found - ${loginDto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    this.logger.debug(`User found: ${user.email} (ID: ${user.id})`);

    // Step 2: Verify password
    if (!user.password) {
      this.logger.error(`Login failed: No password set for user - ${loginDto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password - ${loginDto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    this.logger.debug(`Password verified for: ${user.email}`);

    // Step 3: Build permissions
    try {
      await this.permissionsService.buildUserPermissions(user.id);
      this.logger.debug(`Permissions built for: ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to build permissions for ${user.email}:`, error.message);
      // Continue login even if permissions fail
    }

    // Step 4: Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role as UserRole[]);
    this.logger.log(`Login successful: ${user.email}`);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        roles: user.role,
        status: user.status,
      },
    };
  }

  async adminLogin(loginDto: LoginDto): Promise<TokenResponseDto> {
    this.logger.log(`Admin login attempt for: ${loginDto.email}`);

    // Step 1: Find user
    const user = await this.usersService.findByEmailWithPassword(loginDto.email);
    if (!user) {
      this.logger.warn(`Admin login failed: User not found - ${loginDto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    this.logger.debug(`User found: ${user.email} (ID: ${user.id})`);

    // Step 2: Check account type
    if (user.accountType !== 0) {
      this.logger.warn(`Admin login failed: Invalid account type - ${loginDto.email} (type: ${user.accountType})`);
      throw new ForbiddenException('Access denied: admin only');
    }
    this.logger.debug(`Account type valid: ${user.accountType}`);

    // Step 3: Verify password
    if (!user.password) {
      this.logger.error(`Admin login failed: No password set for user - ${loginDto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Admin login failed: Invalid password - ${loginDto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    this.logger.debug(`Password verified for: ${user.email}`);

    // Step 4: Build permissions
    try {
      await this.permissionsService.buildUserPermissions(user.id);
      this.logger.debug(`Permissions built for: ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to build permissions for ${user.email}:`, error.message);
      // Continue login even if permissions fail
    }

    // Step 5: Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role as UserRole[]);
    this.logger.log(`Admin login successful: ${user.email}`);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        roles: user.role,
        status: user.status,
      },
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
      const permissions = await this.permissionsService.buildUserPermissions(payload.sub);

      const accessToken = this.jwtService.sign(
        {
          sub: payload.sub,
          email: payload.email,
          roles: user.role,
          permissions,
        },
        { expiresIn: '15m' },
      );

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateToken(token: string): Promise<{ valid: boolean; payload?: any }> {
    try {
      const payload = this.jwtService.verify(token);
      return {
        valid: true,
        payload: { userId: payload.sub, email: payload.email },
      };
    } catch {
      return { valid: false };
    }
  }

  private async generateTokens(userId: string, email: string, roles: UserRole[]) {
    let permissions: string[] = [];
    
    try {
      permissions = await this.permissionsService.getCachedPermissions(userId);
      this.logger.debug(`Loaded ${permissions.length} permissions for user ${userId}`);
    } catch (error) {
      this.logger.warn(`Failed to load permissions for user ${userId}: ${error.message}`);
      permissions = [];
    }

    const payload = { sub: userId, email, roles, permissions };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    const refreshToken = this.jwtService.sign(
      { sub: userId, email },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );

    return { accessToken, refreshToken };
  }
}
