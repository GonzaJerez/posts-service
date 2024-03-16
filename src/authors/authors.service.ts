import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Author } from './entities/author.entity';
import { Model } from 'mongoose';
import { Post } from 'src/posts/entities/post.entity';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectModel(Author.name)
    private readonly authorsModel: Model<Post>,
  ) {}

  async putAuthor(dataAuthor: Author) {
    let author = await this.authorsModel.findByIdAndUpdate(
      dataAuthor._id,
      dataAuthor,
      {
        new: true,
      },
    );

    if (!author) {
      author = await this.authorsModel.create(dataAuthor);
    }

    return author;
  }
}
