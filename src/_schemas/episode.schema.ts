import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Exclude } from 'class-transformer';

export type EpisodeDocument = Episode & Document;

@Schema({ timestamps: true })
export class Episode {
  @Exclude()
  _id: mongoose.Types.ObjectId;

  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, default: false })
  display: boolean;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true,
  })
  chapterId: mongoose.Types.ObjectId;

  constructor(partial: Partial<Episode>) {
    partial.id = partial._id.toString();
    Object.assign(this, partial);
  }
}

export const EpisodeSchema = SchemaFactory.createForClass(Episode);
