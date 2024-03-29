import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from './guards/auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image'))
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
  async findAll() {
    const posts = await this.postsService.findAll();
    return { posts };
  }
}
