import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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

  @Prop()
  author: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);
