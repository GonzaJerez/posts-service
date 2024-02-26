import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { ConfigService } from '@nestjs/config';
import { IAuthor } from './types/authors.types';
import { QueryFilterDto } from './dto/query-filter.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private readonly postsModel: Model<Post>,
    private readonly configService: ConfigService,
  ) {}

  async create(body: CreatePostDto) {
    const post = new this.postsModel(body);

    return this.postsModel.create(post);
  }

  async findAll(query: QueryFilterDto): Promise<Post[]> {
    const { relations, authors } = query;

    // Filter posts by authors ids from request
    const idsAuthors = authors?.split(',');
    const queryPosts: FilterQuery<Post> = {};
    if (idsAuthors?.length > 0) {
      queryPosts['author'] = { $in: idsAuthors };
    }

    let posts: Post[] = await this.postsModel.find(queryPosts).lean();

    if (relations?.includes('author')) {
      posts = await this.addAuthorsDataToPosts(posts);
    }

    return posts;
  }

  private async addAuthorsDataToPosts(posts: Post[]) {
    // Get authors ids to fitler request
    const authorsFromPosts = new Set(posts.map((post) => post.author));
    const authorsToGetData = Array.from(authorsFromPosts);

    // Get data from authors microservice
    let authors: IAuthor[] = [];
    try {
      let resp: {
        statusCode?: number;
        message?: string;
        authors?: IAuthor[];
      };
      if (this.configService.get('NODE_ENV') === 'prod') {
        resp = await this.invokeLambda(`authors=${authorsToGetData.join(',')}`);
      } else {
        resp = await fetch(
          `${this.configService.get(
            'AUTHORS_API_URL',
          )}?authors=${authorsToGetData.join(',')}`,
        ).then((res) => res.json());
      }

      if (!resp.authors)
        throw new InternalServerErrorException(
          'Error on get data from authors microservice',
        );

      authors = resp.authors;
    } catch (error) {
      console.log(error);
    }

    // If not recover data from authors microservice just return posts
    if (authors.length === 0) return posts;

    // Merge posts with their authors
    const postsWithAuthors: Post[] = posts.map((post) => {
      const author = authors.find((author) => author._id === post.author);
      delete post.author;
      return {
        ...post,
        author,
      };
    });

    return postsWithAuthors;
  }

  private async invokeLambda(queryString = '') {
    const client = new LambdaClient();
    const command = new InvokeCommand({
      FunctionName: this.configService.get('AUTHORS_FUNCTION_NAME'),
      Payload: JSON.stringify({
        version: '2.0',
        routeKey: '$default',
        rawPath: '/authors',
        rawQueryString: queryString,
        headers: {},
        requestContext: {
          http: {
            method: 'GET',
            path: `/authors?${queryString}`,
            protocol: 'HTTP/1.1',
          },
        },
      }),
      InvocationType: 'RequestResponse',
    });

    const resp = await client.send(command);
    const data = Buffer.from(resp.Payload).toString();
    const dataParsed = JSON.parse(data);
    return JSON.parse(dataParsed.body);
  }
}
