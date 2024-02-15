import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './entities/post.entity';
import { Model } from 'mongoose';
import { PostQueryFilter } from './dto/query-filter.dto';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Post.name)
    private readonly postsModel: Model<Post>,
  ) {}

  async create(body: CreatePostDto) {
    const post = new this.postsModel(body);

    return this.postsModel.create(post);
  }

  async findAll(filters: PostQueryFilter): Promise<Post[]> {
    const idsAuthors = filters.authors?.split(',');

    const query = {};

    if (idsAuthors?.length > 0) {
      query['author'] = { $in: idsAuthors };
    }

    return this.postsModel.find(query).lean();
  }

  async findOne(id: number) {
    return `This action returns a #${id} post`;
  }
}
