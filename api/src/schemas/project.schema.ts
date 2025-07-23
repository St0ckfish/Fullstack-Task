import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  websiteIdea: string;

  @Prop({ type: [String], required: true })
  sections: string[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
