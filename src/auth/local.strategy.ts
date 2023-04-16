import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user) {
      let correctPassword = await bcrypt.compare(password, user.password);
      if (correctPassword) {
        const { password, ...result } = user;
        return result;
      } else {
        throw new UnauthorizedException();
      }
    }
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
