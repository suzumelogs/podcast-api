import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Exclude } from 'class-transformer';

export type ChapterDocument = Chapter & Document;

@Schema({ timestamps: true })
export class Chapter {
  @Exclude()
  _id: mongoose.Types.ObjectId;

  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, default: false })
  display: boolean;

  @Prop({ required: false, default: null })
  imageUrl: string | null;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  })
  categoryId: mongoose.Types.ObjectId;

  constructor(partial: Partial<Chapter>) {
    partial.id = partial._id.toString();
    Object.assign(this, partial);
  }
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter);
