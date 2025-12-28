import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { InfrastructureModule } from '@/infrastructure/infrastructure.module';
import { PostsController } from './posts.controller';

@Module({
  imports: [InfrastructureModule],
  providers: [PostsService],
  controllers: [PostsController],
})
export class PostsModule {}
