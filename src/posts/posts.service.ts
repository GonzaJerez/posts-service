import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Author } from 'src/authors/entities/author.entity';
import { AuthorsService } from 'src/authors/authors.service';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { IAuthUser } from './types/auth-user.interface';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private readonly postsModel: Model<Post>,
    private readonly configService: ConfigService,
    private readonly authorsService: AuthorsService,
  ) {}

  async create(
    body: CreatePostDto,
    file: Express.Multer.File,
    user: IAuthUser,
  ) {
    const post = new this.postsModel({ ...body, author: user._id });

    if (file) {
      const { url } = await this.uploadImage(file);
      post.image_url = url;
    }

    const postCreated = await this.postsModel.create(post);

    const postCreatedWithAuthorData = await postCreated.populate('author');

    await this.publishPost(postCreatedWithAuthorData);

    return postCreatedWithAuthorData;
  }

  async findAll(): Promise<Post[]> {
    return this.postsModel.find().lean().populate('author');
  }

  private async uploadImage(file: Express.Multer.File) {
    const client = new S3Client({
      region: this.configService.get('AWS_BUCKET_REGION'),
    });

    // Remove spaces from file name to url
    const formatedFileName = file.originalname.replace(/\s/g, '-');

    const command = new PutObjectCommand({
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: formatedFileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    const uploadResponse = await client.send(command);

    // Generate url because s3 not generate in response
    const url = `https://${this.configService.get(
      'AWS_BUCKET_NAME',
    )}.s3.${this.configService.get(
      'AWS_BUCKET_REGION',
    )}.amazonaws.com/${formatedFileName}`;

    return {
      ...uploadResponse,
      url,
    };
  }

  async handleMessage(authors: Author[]) {
    for (const author of authors) {
      await this.authorsService.putAuthors(author);
    }
  }

  async publishPost(post: Post) {
    const client = new SNSClient({});
    const command = new PublishCommand({
      Message: JSON.stringify(post),
      TopicArn: this.configService.get('SNS_TOPIC_ARN'),
      MessageAttributes: {
        operation: {
          DataType: 'String',
          StringValue: 'CREATE',
        },
      },
    });

    await client.send(command);
  }
}
