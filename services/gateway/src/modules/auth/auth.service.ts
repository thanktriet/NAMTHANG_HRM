import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface JwtPayload {
  sub: string;
  username: string;
  roles: string[];
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly pool: Pool;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1@localhost:5432/namthang_hrm',
    });
  }

  async validateUser(username: string, password: string): Promise<any> {
    const result = await this.pool.query(
      'SELECT id, username, password_hash, status FROM users WHERE username = $1 AND deleted_at IS NULL',
      [username],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      status: user.status,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    await this.pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const tokens = await this.generateTokens(user);

    this.logger.log(`User ${user.username} đăng nhập thành công`);

    return {
      data: {
        user: {
          id: user.id,
          username: user.username,
          fullName: user.username,
          role: 'admin',
        },
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      message: 'Đăng nhập thành công',
    };
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.pool.query(
      'SELECT id FROM users WHERE username = $1 AND deleted_at IS NULL',
      [registerDto.username],
    );

    if (existing.rows.length > 0) {
      throw new ConflictException('Tên đăng nhập đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const result = await this.pool.query(
      'INSERT INTO users (username, password_hash, status) VALUES ($1, $2, $3) RETURNING id, username',
      [registerDto.username, hashedPassword, 'active'],
    );

    const newUser = result.rows[0];
    const tokens = await this.generateTokens(newUser);

    this.logger.log(`User ${newUser.username} đăng ký thành công`);

    return {
      data: {
        user: { id: newUser.id, username: newUser.username },
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      message: 'Đăng ký thành công',
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token không được cung cấp');
    }

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'nam-thang-hrm-refresh-secret-key-2026',
      });

      const result = await this.pool.query(
        'SELECT id, username FROM users WHERE id = $1 AND deleted_at IS NULL',
        [payload.sub],
      );

      if (result.rows.length === 0) {
        throw new UnauthorizedException('User không tồn tại');
      }

      const tokens = await this.generateTokens(result.rows[0]);

      return {
        data: { token: tokens.accessToken, refreshToken: tokens.refreshToken },
        message: 'Làm mới token thành công',
      };
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }

  async getProfile(userId: string) {
    const result = await this.pool.query(
      'SELECT id, username, status, last_login FROM users WHERE id = $1 AND deleted_at IS NULL',
      [userId],
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedException('User không tồn tại');
    }

    return {
      data: result.rows[0],
      message: 'Lấy thông tin thành công',
    };
  }

  private async generateTokens(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      roles: ['admin'],
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'nam-thang-hrm-refresh-secret-key-2026',
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
