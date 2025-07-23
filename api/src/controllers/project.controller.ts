import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ProjectService } from '../services/project.service';

@Controller('api/projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async createProject(@Body() body: { websiteIdea: string }) {
    try {
      const project = await this.projectService.createProject(body.websiteIdea);
      return {
        success: true,
        data: project,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  @Get()
  async getAllProjects() {
    try {
      const projects = await this.projectService.getAllProjects();
      return {
        success: true,
        data: projects,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  @Get(':id')
  async getProject(@Param('id') id: string) {
    try {
      const project = await this.projectService.getProjectById(id);
      return {
        success: true,
        data: project,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }
}
