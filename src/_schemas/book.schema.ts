import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Exclude } from 'class-transformer';

export type BookDocument = Book & Document;

@Schema({ timestamps: true })
export class Book {
  @Exclude()
  _id: mongoose.Types.ObjectId;

  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  // Image
  @Prop({ required: false })
  url: string;

  constructor(partial: Partial<Book>) {
    partial.id = partial._id.toString();
    Object.assign(this, partial);
  }
}

export const BookSchema = SchemaFactory.createForClass(Book);
