import type {
  AboutMedia,
  Author,
  BlogPost,
  Case,
  CaseImage,
  ClientStory,
  EcosystemItem,
  HomeBlogLink,
  MediaAsset,
  Popup,
  Slide,
} from '../../generated/prisma/client';

export type ClientStoryWithImage = ClientStory & { image: MediaAsset };
export type EcosystemWithImage = EcosystemItem & { image: MediaAsset };
export type AboutMediaWithAsset = AboutMedia & { media: MediaAsset };
export type BlogPostWithAuthor = BlogPost & { author: Author };
export type PublicCase = Case & { images: CaseImage[] };

export interface PublicPagesRepository {
  listSlides(language?: 'ENGLISH' | 'PORTUGUESE'): Promise<Slide[]>;
  listClientStories(
    language?: 'ENGLISH' | 'PORTUGUESE',
  ): Promise<ClientStoryWithImage[]>;
  listEcosystems(): Promise<EcosystemWithImage[]>;
  findPopup(language?: 'ENGLISH' | 'PORTUGUESE'): Promise<Popup | null>;
  listBlogLinks(): Promise<HomeBlogLink[]>;
  listCases(language?: 'ENGLISH' | 'PORTUGUESE'): Promise<PublicCase[]>;
  listAboutMedia(): Promise<AboutMediaWithAsset[]>;
  listPosts(language?: 'ENGLISH' | 'PORTUGUESE'): Promise<BlogPostWithAuthor[]>;
  listAuthors(): Promise<Author[]>;
}
