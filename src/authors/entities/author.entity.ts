import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  collection: 'authors',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Author {
  @Prop({ type: String })
  _id: Types.ObjectId;

  @Prop()
  name: string;

  @Prop()
  last_name: string;

  @Prop()
  image_url?: string;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);
