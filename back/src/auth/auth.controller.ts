import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = this.authService.getCookieOptions(isProduction);

    res.cookie('access_token', result.accessToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    res.cookie('refresh_token', result.refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    });

    return { user: result.user };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return { authenticated: false };
    }

    const result = await this.authService.refresh(refreshToken);
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = this.authService.getCookieOptions(isProduction);

    res.cookie('access_token', result.accessToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { authenticated: true };
  }

  @Public()
  @Get('check')
  async check(@Req() req: Request) {
    const token = req.cookies?.access_token;
    if (!token) {
      return { authenticated: false, user: null };
    }

    try {
      const { JwtService } = await import('@nestjs/jwt');
      const jwtService = new JwtService({
        secret: process.env.JWT_SECRET,
      });
      const payload = jwtService.verify(token);
      return {
        authenticated: true,
        user: { id: payload.sub, email: payload.email, role: payload.role },
      };
    } catch {
      return { authenticated: false, user: null };
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = this.authService.getCookieOptions(isProduction);

    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);

    return { message: 'Sesión cerrada' };
  }

  @Get('me')
  async me(@Req() req: Request) {
    const user = (req as any).user;
    return this.authService.getProfile(user.id);
  }
}
