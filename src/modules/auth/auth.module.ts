import { ROLE_READER_PORT } from '@/modules/auth/application/ports/role-reader.port';
import { Module } from '@nestjs/common';
import { AuthController } from './presentation/http/auth.controller';
import { InfrastructureModule } from '@/infrastructure';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterUserHandler } from '@/modules/auth/application/handlers/register-user.handler';
import { PrismaRoleReader } from '@/modules/auth/infrastructure/prisma/prisma-role.reader';
import { AUTH_USER_REPOSITORY } from '@/modules/auth/domain/repositories/auth-user.repository';
import { PrismaAuthUserRepository } from '@/modules/auth/infrastructure/prisma/prisma-auth-user.repository';

@Module({
  controllers: [AuthController],
  imports: [InfrastructureModule, CqrsModule],
  providers: [
    RegisterUserHandler,
    {
      provide: AUTH_USER_REPOSITORY,
      useClass: PrismaAuthUserRepository,
    },
    {
      provide: ROLE_READER_PORT,
      useClass: PrismaRoleReader,
    },
  ],
})
export class AuthModule {}
