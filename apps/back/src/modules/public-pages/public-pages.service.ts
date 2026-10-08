import { auditDto, lifecycleDto } from '../../core/lifecycle';
import type { PublicPagesRepository } from './public-pages.repository';

export class PublicPagesService {
  constructor(private readonly repository: PublicPagesRepository) {}

  async home(language?: 'ENGLISH' | 'PORTUGUESE') {
    const [slides, clientStories, ecosystems, activePopup, blogLinks] =
      await Promise.all([
        this.repository.listSlides(language),
        this.repository.listClientStories(language),
        this.repository.listEcosystems(),
        this.repository.findPopup(language),
        this.repository.listBlogLinks(),
      ]);
    return {
      slides: slides.map(lifecycleDto),
      clientStories: clientStories.map(({ image, ...story }) => ({
        ...lifecycleDto(story),
        imageUrl: `/v1/images/${image.id}`,
      })),
      ecosystemItems: ecosystems.map(({ image, ...item }) => ({
        ...lifecycleDto(item),
        imageUrl: `/v1/images/${image.id}`,
      })),
      activePopup: activePopup ? lifecycleDto(activePopup) : null,
      blogLinks: blogLinks.map(lifecycleDto),
    };
  }

  async cases(language?: 'ENGLISH' | 'PORTUGUESE') {
    const items = await this.repository.listCases(language);
    return {
      cases: items.map(({ images, ...item }) => ({
        ...lifecycleDto(item),
        imageIds: images.map((image) => image.imageId),
      })),
    };
  }

  async about() {
    const media = await this.repository.listAboutMedia();
    return {
      media: media.map(({ media: asset, ...item }) => ({
        ...lifecycleDto(item),
        imageId: asset.id,
        imageUrl: `/v1/${asset.kind === 'VIDEO' ? 'videos' : 'images'}/${asset.id}`,
      })),
    };
  }

  async blog(language?: 'ENGLISH' | 'PORTUGUESE') {
    const [posts, authors] = await Promise.all([
      this.repository.listPosts(language),
      this.repository.listAuthors(),
    ]);
    return {
      posts: posts.map(({ author, ...post }) => ({
        ...lifecycleDto(post),
        authorName: author.name,
      })),
      authors: authors.map(auditDto),
    };
  }
}
