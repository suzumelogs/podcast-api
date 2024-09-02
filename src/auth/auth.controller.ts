import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthUser } from '../common/decorator/decorator.auth_user';
import { AccessTokenGuard } from '../common/gaurds/gaurd.access_token';
import { RefreshTokenGuard } from '../common/gaurds/gaurd.refresh_token';
import { AuthDto } from '../_dtos/auth.dto';
import { CreateUserDto } from '../_dtos/create_user.dto';
import { AuthService } from './auth.service';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post('signin')
  signin(@Body() data: AuthDto) {
    return this.authService.signIn(data);
  }

  @Get('logout')
  logout(@AuthUser('sub') sub: string) {
    return this.authService.logout(sub);
  }
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(
    @AuthUser('sub') sub: string,
    @AuthUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(sub, refreshToken);
  }

  @Get('me')
  getMe(@Req() req: any) {
    const userId = req.user.sub;
    return this.authService.getMe(userId);
  }
}
