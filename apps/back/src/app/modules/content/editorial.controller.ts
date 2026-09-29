import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  asRecord,
  enumValue,
  optionalBoolean,
  optionalString,
  requiredString,
} from '../../common/input';
import { AuthGuard } from '../auth/auth.guard';
import {
  AuthorRecord,
  BlogPostRecord,
  Language,
} from '../storage/cms.types';
import { ResourceService } from './resource.service';

const languages = ['ENGLISH', 'PORTUGUESE'] as const;

interface HeaderResponse {
  setHeader(name: string, value: string): void;
}

@UseGuards(AuthGuard)
@Controller('authors')
export class AuthorsController {
  constructor(private readonly resources: ResourceService) {}

  @Post()
  async create(@Body() value: unknown, @Res({ passthrough: true }) response: HeaderResponse) {
    const input = asRecord(value);
    const author: AuthorRecord = {
      id: this.resources.id(),
      name: requiredString(input, 'name', 'Name'),
      bio: optionalString(input, 'bio'),
      imageUrl: optionalString(input, 'imageUrl'),
      isActive: true,
      ...this.resources.audit(),
    };
    await this.resources.insert('authors', author);
    response.setHeader('Location', `/v1/authors/${author.id}`);
  }

  @Get()
  list() {
    return this.resources.list<AuthorRecord>('authors');
  }

  @Get('dropdown')
  dropdown() {
    return this.resources
      .list<AuthorRecord>('authors')
      .filter((author) => author.isActive);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.resources.get<AuthorRecord>('authors', id, 'Author');
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() value: unknown) {
    const input = asRecord(value);
    await this.resources.update<AuthorRecord>('authors', id, 'Author', (author) => {
      author.name = optionalString(input, 'name', author.name) || author.name;
      author.bio = optionalString(input, 'bio', author.bio);
      author.imageUrl = optionalString(input, 'imageUrl', author.imageUrl);
      author.isActive = optionalBoolean(input, 'isActive', author.isActive);
    });
  }
}

@UseGuards(AuthGuard)
@Controller('blog-posts')
export class BlogPostsController {
  constructor(private readonly resources: ResourceService) {}

  @Post()
  async create(@Body() value: unknown, @Res({ passthrough: true }) response: HeaderResponse) {
    const input = asRecord(value);
    const authorId = requiredString(input, 'authorId', 'Author');
    this.resources.get<AuthorRecord>('authors', authorId, 'Author');
    const post: BlogPostRecord = {
      id: this.resources.id(),
      title: requiredString(input, 'title', 'Title'),
      url: requiredString(input, 'url', 'URL'),
      description: optionalString(input, 'description'),
      imageUrl: optionalString(input, 'imageUrl'),
      authorId,
      language: enumValue(input.language, languages, 'Language', 'PORTUGUESE'),
      isActive: optionalBoolean(input, 'isActive', true),
      isDraft: true,
      isPublished: false,
      publishedAt: null,
      ...this.resources.audit(),
    };
    await this.resources.insert('blogPosts', post);
    response.setHeader('Location', `/v1/blog-posts/${post.id}`);
  }

  @Get()
  list(
    @Query('title') title?: string,
    @Query('authorName') authorName?: string,
    @Query('language') language?: Language,
  ) {
    const authors = this.resources.list<AuthorRecord>('authors');
    return this.resources
      .list<BlogPostRecord>('blogPosts')
      .filter((post) => !title || post.title.toLowerCase().includes(title.toLowerCase()))
      .filter((post) => !language || post.language === language)
      .filter((post) => {
        if (!authorName) return true;
        const author = authors.find((item) => item.id === post.authorId);
        return author?.name.toLowerCase().includes(authorName.toLowerCase());
      })
      .map((post) => this.toDto(post, authors));
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.toDto(
      this.resources.get<BlogPostRecord>('blogPosts', id, 'Blog post'),
      this.resources.list<AuthorRecord>('authors'),
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() value: unknown) {
    const input = asRecord(value);
    const authorId = optionalString(input, 'authorId');
    if (authorId) this.resources.get<AuthorRecord>('authors', authorId, 'Author');
    await this.resources.update<BlogPostRecord>('blogPosts', id, 'Blog post', (post) => {
      post.title = optionalString(input, 'title', post.title) || post.title;
      post.url = optionalString(input, 'url', post.url) || post.url;
      post.description = optionalString(input, 'description', post.description);
      post.imageUrl = optionalString(input, 'imageUrl', post.imageUrl);
      post.authorId = authorId || post.authorId;
      post.language = enumValue(input.language, languages, 'Language', post.language);
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.resources.remove('blogPosts', id, 'Blog post');
  }

  @Patch(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  publish(@Param('id') id: string) {
    return this.resources.publish<BlogPostRecord>('blogPosts', id, 'Blog post');
  }

  @Patch(':id/unpublish')
  @HttpCode(HttpStatus.NO_CONTENT)
  unpublish(@Param('id') id: string) {
    return this.resources.unpublish<BlogPostRecord>('blogPosts', id, 'Blog post');
  }

  private toDto(post: BlogPostRecord, authors: AuthorRecord[]) {
    const author = authors.find((item) => item.id === post.authorId);
    return { ...post, authorName: author?.name ?? null };
  }
}
