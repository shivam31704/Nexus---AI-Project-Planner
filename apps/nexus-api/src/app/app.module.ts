import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AiProviderService } from './ai-provider.service';
import { PromptParserService } from './services/prompt-parser.service';
import { SpecPlannerService } from './services/spec-planner.service';
import { ProjectAssemblerService } from './services/project-assembler.service';
import { PatchService } from './services/patch.service';

import { ProjectGateway } from './gateway/project.gateway';

import { ProjectsController } from './controllers/projects.controller';
import { NodesController } from './controllers/nodes.controller';

import { ProjectArtifact, ProjectArtifactSchema } from './schemas/project-artifact.schema';

@Module({
  imports: [
    // Loads .env at the project root into process.env
    ConfigModule.forRoot({ isGlobal: true }),

    // Was previously an empty comment — the app had NO database connection.
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus'
    ),
    MongooseModule.forFeature([
      { name: ProjectArtifact.name, schema: ProjectArtifactSchema },
    ]),
  ],
  controllers: [
    AppController,
    ProjectsController, // was missing entirely — no route existed for project generation
    NodesController,    // was missing entirely — no route existed for self-healing patches
  ],
  providers: [
    AppService,
    AiProviderService,
    PromptParserService,
    SpecPlannerService,
    ProjectAssemblerService,
    PatchService,
    ProjectGateway, // was written but never registered — the WebSocket namespace never activated
  ],
})
export class AppModule {}
