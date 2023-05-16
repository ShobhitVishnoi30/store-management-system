import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { JWTExpiry } from 'src/users/entities/jwt-expiry.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(JWTExpiry)
    private readonly jwtExpiryRepository: Repository<JWTExpiry>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    console.log('26');
    const currentToken = req.headers['authorization'].split(' ')[1];
    try {
      const tokenDetails = await this.jwtExpiryRepository.findOne({
        where: {
          jwtToken: currentToken,
        },
      });
      const user = await this.userRepository.findOne({
        where: {
          userName: tokenDetails.userName,
        },
      });

      if (!tokenDetails.status) {
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
