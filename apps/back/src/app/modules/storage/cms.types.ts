export type Language = 'ENGLISH' | 'PORTUGUESE';
export type MediaType = 'IMAGE' | 'VIDEO';
export type PopupStyle =
  | 'ORANGE_WHITE'
  | 'WHITE_ORANGE'
  | 'PURPLE_WHITE'
  | 'WHITE_PURPLE';
export type ImageExtension = 'PNG' | 'JPEG' | 'GIF' | 'WEBP' | 'SVG';
export type UserRole = 'ADMIN' | 'EDITOR';

export interface AuditFields {
  createdAt: string;
  updatedAt: string;
}

export interface User extends AuditFields {
  id: string;
  username: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  groups: string[];
}

export interface AuthorRecord extends AuditFields {
  id: string;
  name: string;
  bio: string;
  imageUrl: string;
  isActive: boolean;
}

export interface BlogPostRecord extends AuditFields {
  id: string;
  title: string;
  url: string;
  description: string;
  imageUrl: string;
  authorId: string;
  language: Language;
  isActive: boolean;
  isDraft: boolean;
  isPublished: boolean;
  publishedAt: string | null;
}

export interface ImageRecord {
  id: string;
  name: string;
  size: number;
  extension: ImageExtension;
  uploadDate: string;
  tags: string[];
  storagePath: string;
  contentType: string;
}

export interface VideoRecord {
  id: string;
  name: string;
  size: number;
  contentType: string;
  uploadDate: string;
  storagePath: string;
}

export interface FileRecord {
  id: string;
  url: string;
  name: string;
  size: number;
  contentType: string;
  storagePath: string;
  uploadDate: string;
}

export interface SlideRecord extends AuditFields {
  id: string;
  logoId: string;
  text: string;
  buttonText: string;
  buttonUrl: string;
  isActive: boolean;
  language: Language;
  isDraft: boolean;
  isPublished: boolean;
  publishedAt: string | null;
}

export interface PopupRecord extends AuditFields {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  redirectUrl: string;
  buttonText2: string;
  redirectUrl2: string;
  isActive: boolean;
  style: PopupStyle;
  language: Language;
  isDraft: boolean;
  isPublished: boolean;
  publishedAt: string | null;
}

export interface EcosystemRecord extends AuditFields {
  id: string;
  name: string;
  imageId: string;
  isActive: boolean;
  isPublished: boolean;
}

export interface HomeBlogLinkRecord extends AuditFields {
  id: string;
  url: string;
  label: string;
  isActive: boolean;
}

export interface ClientStoryRecord extends AuditFields {
  id: string;
  imageId: string;
  shortTitle: string;
  longTitle: string;
  description: string;
  language: Language;
  isActive: boolean;
  isDraft: boolean;
  isPublished: boolean;
  publishedAt: string | null;
}

export interface CaseContentRecord extends AuditFields {
  id: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  content: string;
  industry: string;
  country: string;
  tag: string;
  logoId: string | null;
  language: Language;
  active: boolean;
  isDraft: boolean;
  isPublished: boolean;
  publishedAt: string | null;
}

export interface CaseImageRecord {
  id: string;
  caseId: string;
  imageId: string;
  position: number;
  createdAt: string;
}

export interface CaseTestimonialRecord extends AuditFields {
  id: string;
  caseId: string;
  authorName: string;
  role: string;
  company: string;
  content: string;
  isActive: boolean;
  language: Language;
  isDraft: boolean;
  isPublished: boolean;
  publishedAt: string | null;
}

export interface AboutMediaRecord extends AuditFields {
  id: string;
  imageId: string;
  mediaType: MediaType;
  caption: string;
  sortOrder: number;
  isActive: boolean;
}

export interface PartnerRecord extends AuditFields {
  id: string;
  name: string;
  logoId: string | null;
  website: string;
  isActive: boolean;
}

export interface CareerRecord extends AuditFields {
  id: string;
  title: string;
  description: string;
  location: string;
  isActive: boolean;
  language: Language;
}

export interface ServiceItemRecord extends AuditFields {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  language: Language;
}

export interface CmsData {
  version: 2;
  users: User[];
  authors: AuthorRecord[];
  blogPosts: BlogPostRecord[];
  images: ImageRecord[];
  videos: VideoRecord[];
  files: FileRecord[];
  slides: SlideRecord[];
  popups: PopupRecord[];
  ecosystems: EcosystemRecord[];
  homeBlogLinks: HomeBlogLinkRecord[];
  clientStories: ClientStoryRecord[];
  cases: CaseContentRecord[];
  caseImages: CaseImageRecord[];
  caseTestimonials: CaseTestimonialRecord[];
  aboutMedia: AboutMediaRecord[];
  partners: PartnerRecord[];
  careers: CareerRecord[];
  serviceItems: ServiceItemRecord[];
}

export const emptyCmsData = (): CmsData => ({
  version: 2,
  users: [],
  authors: [],
  blogPosts: [],
  images: [],
  videos: [],
  files: [],
  slides: [],
  popups: [],
  ecosystems: [],
  homeBlogLinks: [],
  clientStories: [],
  cases: [],
  caseImages: [],
  caseTestimonials: [],
  aboutMedia: [],
  partners: [],
  careers: [],
  serviceItems: [],
});
