import { PrismaService } from '@/infrastructure/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return await this.prismaService.posts.findMany();
  }
  async create(content: string) {
    await this.prismaService.posts.create({
      data: {
        content,
      },
    });
  }
}
