import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        userName: username,
      },
    });
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
