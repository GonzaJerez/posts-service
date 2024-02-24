import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IAuthor } from '../types/authors.types';

@Schema({
  collection: 'posts',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Post {
  @Prop()
  title: string;

  @Prop()
  body: string;

  @Prop({
    type: String,
  })
  author: string | IAuthor;
}

export const PostSchema = SchemaFactory.createForClass(Post);
