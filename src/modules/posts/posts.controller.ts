import { PostsService } from '@/modules/posts/posts.service';
import { Controller, Get } from '@nestjs/common';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  @Get()
  async getPosts() {
    return this.postsService.findAll();
  }
}
