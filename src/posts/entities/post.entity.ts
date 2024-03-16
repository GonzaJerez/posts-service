import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { Author } from 'src/authors/entities/author.entity';

@Schema({
  collection: 'posts',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Post {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  body: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Author',
  })
  author: Author;

  @Prop()
  image_url: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);
