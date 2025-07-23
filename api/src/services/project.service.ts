import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../schemas/project.schema';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async createProject(websiteIdea: string): Promise<Project> {
    const sections = this.generateDummySections(websiteIdea);

    const createdProject = new this.projectModel({
      websiteIdea,
      sections,
    });

    return createdProject.save();
  }

  async getAllProjects(): Promise<Project[]> {
    return this.projectModel.find().sort({ createdAt: -1 }).exec();
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.projectModel.findById(id).exec();
  }

  private generateDummySections(idea: string): string[] {
    const sections = ['Hero', 'About', 'Contact'];

    if (idea.toLowerCase().includes('bakery')) {
      return [
        'Hero - Fresh Baked Goods',
        'Our Story',
        'Menu',
        'Location & Hours',
      ];
    } else if (idea.toLowerCase().includes('restaurant')) {
      return ['Hero - Fine Dining', 'About Chef', 'Menu', 'Reservations'];
    }

    return sections;
  }
}
