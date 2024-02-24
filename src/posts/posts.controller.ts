import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryFilterDto } from './dto/query-filter.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() body: CreatePostDto) {
    return this.postsService.create(body);
  }

  @Get()
  async findAll(@Query() query: QueryFilterDto) {
    const posts = await this.postsService.findAll(query);
    return { posts };
  }
}
