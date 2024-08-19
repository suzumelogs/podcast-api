import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Exclude } from 'class-transformer';

export type NumberDisplayDocument = NumberDisplay & Document;

@Schema({ timestamps: true })
export class NumberDisplay {
  @Exclude()
  _id: mongoose.Types.ObjectId;

  id: string;

  @Prop({ required: true })
  chapterCount: number;

  @Prop({ required: true })
  episodeCount: number;

  constructor(partial: Partial<NumberDisplay>) {
    partial.id = partial._id.toString();
    Object.assign(this, partial);
  }
}

export const NumberDisplaySchema = SchemaFactory.createForClass(NumberDisplay);
