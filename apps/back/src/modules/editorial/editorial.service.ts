import { auditDto, lifecycleDto } from '../../core/lifecycle';
import { ConflictError, NotFoundError } from '../../core/errors';
import type {
  CreateAuthorInput,
  CreateBlogPostInput,
  EditorialRepository,
  UpdateAuthorInput,
  UpdateBlogPostInput,
  BlogPostWithAuthor,
} from './editorial.repository';

export class EditorialService {
  constructor(private readonly repository: EditorialRepository) {}

  async createAuthor(input: CreateAuthorInput) {
    return auditDto(await this.repository.createAuthor(input));
  }

  async listAuthors() {
    return Promise.all((await this.repository.listAuthors()).map(auditDto));
  }

  async getAuthor(id: string) {
    const author = await this.repository.findAuthor(id);
    if (!author) throw new NotFoundError('Autor');
    return auditDto(author);
  }

  async updateAuthor(id: string, input: UpdateAuthorInput): Promise<void> {
    await this.getAuthor(id);
    await this.repository.updateAuthor(id, input);
  }

  async deleteAuthor(id: string): Promise<void> {
    await this.getAuthor(id);
    if ((await this.repository.countActivePostsByAuthor(id)) > 0) {
      throw new ConflictError(
        'O autor possui conteúdos ativos e não pode ser excluído',
      );
    }
    await this.repository.softDeleteAuthor(id);
  }

  async createPost(input: CreateBlogPostInput) {
    await this.getAuthor(input.authorId);
    return this.postDto(await this.repository.createPost(input));
  }

  async listPosts(filters: Parameters<EditorialRepository['listPosts']>[0]) {
    return (await this.repository.listPosts(filters)).map((post) =>
      this.postDto(post),
    );
  }

  async getPost(id: string) {
    const post = await this.repository.findPost(id);
    if (!post) throw new NotFoundError('Post');
    return this.postDto(post);
  }

  async updatePost(id: string, input: UpdateBlogPostInput): Promise<void> {
    await this.getPost(id);
    if (input.authorId) await this.getAuthor(input.authorId);
    await this.repository.updatePost(id, input);
  }

  async publishPost(id: string): Promise<void> {
    await this.getPost(id);
    await this.repository.publishPost(id);
  }

  async unpublishPost(id: string): Promise<void> {
    await this.getPost(id);
    await this.repository.unpublishPost(id);
  }

  async deletePost(id: string): Promise<void> {
    await this.getPost(id);
    await this.repository.softDeletePost(id);
  }

  private postDto(post: BlogPostWithAuthor) {
    return {
      ...lifecycleDto(post),
      authorName: post.author.name,
      author: undefined,
    };
  }
}
