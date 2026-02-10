import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Cuenta desactivada');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Token inválido');
      }

      const newPayload = { sub: user.id, email: user.email, role: user.role };
      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: '7d',
      });

      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Token de refresco inválido o expirado');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  getCookieOptions(isProduction: boolean) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || '';
    let domain: string | undefined;

    if (isProduction && frontendUrl) {
      try {
        const url = new URL(frontendUrl);
        const hostname = url.hostname;
        // Detectar TLDs de segundo nivel (.com.ar, .com.uy, etc.)
        const parts = hostname.split('.');
        if (parts.length >= 3) {
          domain = '.' + parts.slice(-3).join('.');
        } else if (parts.length >= 2) {
          domain = '.' + parts.slice(-2).join('.');
        }
      } catch {
        // Si no se puede parsear, no setear domain
      }
    }

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
      ...(domain && { domain }),
    };
  }
}
