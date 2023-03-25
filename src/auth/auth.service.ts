import { Injectable } from '@nestjs/common';
import { Users } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  //constructor(private readonly userRepository: Repository<Users>) {}
  async validateUser(username: string, pass: string): Promise<any> {
    // // const user = await this.userRepository.findOne({
    // //   where: {
    // //     userName: username,
    // //   },
    // // });
    // let correctPassword = await bcrypt.compare(pass, user.password);
    // if (user && correctPassword) {
    //   const { password, ...result } = user;
    //   return result;
    // }
    // return null;
  }
}
