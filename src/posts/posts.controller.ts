import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { memoryStorage } from 'multer';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryFilterDto } from './dto/query-filter.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
    }),
  )
  create(
    @Body() body: CreatePostDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          // In kb
          new MaxFileSizeValidator({ maxSize: 1024 * 250 }),
          new FileTypeValidator({ fileType: 'jpeg|jpg|png' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.postsService.create(body, file);
  }

  @Get()
  async findAll(@Query() query: QueryFilterDto) {
    const posts = await this.postsService.findAll(query);
    return { posts };
  }
}
