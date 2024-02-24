import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private readonly postsModel: Model<Post>,
  ) {}

  async create(body: CreatePostDto) {
    const post = new this.postsModel(body);

    return this.postsModel.create(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postsModel.find().lean();
  }
}
