import { Global, Module } from '@nestjs/common';
import { CasesController } from './cases.controller';
import { AuthorsController, BlogPostsController } from './editorial.controller';
import {
  EcosystemsController,
  HomeBlogLinksController,
  PopupsController,
  SlidesController,
} from './home-content.controller';
import {
  AboutMediaController,
  CareersController,
  ClientStoriesController,
  PartnersController,
  ServiceItemsController,
} from './misc.controller';
import { PagesController } from './pages.controller';
import { ResourceService } from './resource.service';

@Global()
@Module({
  controllers: [
    AuthorsController,
    BlogPostsController,
    SlidesController,
    PopupsController,
    EcosystemsController,
    HomeBlogLinksController,
    ClientStoriesController,
    CasesController,
    AboutMediaController,
    PartnersController,
    CareersController,
    ServiceItemsController,
    PagesController,
  ],
  providers: [ResourceService],
  exports: [ResourceService],
})
export class ContentModule {}
