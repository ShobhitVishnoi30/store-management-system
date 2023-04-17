import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { copyFile } from 'fs';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const currentToken = req.headers['authorization'].split(' ')[1];
    try {
      const user = await this.usersService.findOne(payload.username);

      if (user.revokedTokens == currentToken) {
        return { message: 'Token has been revoked' };
      }
      return {
        userId: payload.userId,
        userName: payload.username,
        role: user.role,
      };
    } catch (error) {
      return { message: 'Token has been revoked' };
    }
  }
}
