import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createDatabase } from '../apps/back/src/infrastructure/database/prisma';

type Item = Record<string, unknown>;
type Language = 'ENGLISH' | 'PORTUGUESE';

const sourcePath = resolve(process.argv[2] ?? 'data/cms.json');
const connectionString =
  process.env.DATABASE_URL ??
  (() => {
    throw new Error('DATABASE_URL é obrigatória');
  })();

const text = (item: Item, key: string, fallback = '') =>
  typeof item[key] === 'string' ? (item[key] as string) : fallback;
const number = (item: Item, key: string, fallback = 0) =>
  typeof item[key] === 'number' ? (item[key] as number) : fallback;
const bool = (item: Item, key: string, fallback = false) =>
  typeof item[key] === 'boolean' ? (item[key] as boolean) : fallback;
const date = (value: unknown, fallback = new Date()) =>
  typeof value === 'string' ? new Date(value) : fallback;
const language = (item: Item): Language =>
  item.language === 'ENGLISH' ? 'ENGLISH' : 'PORTUGUESE';
const publication = (item: Item, legacyActive = false) => {
  const isPublished = bool(item, legacyActive ? 'isActive' : 'isPublished');
  return {
    publicationStatus: isPublished
      ? ('PUBLISHED' as const)
      : ('DRAFT' as const),
    publishedAt: isPublished
      ? date(item.publishedAt, date(item.updatedAt, date(item.createdAt)))
      : null,
    isActive: true,
    createdAt: date(item.createdAt),
    updatedAt: date(item.updatedAt, date(item.createdAt)),
  };
};

async function main() {
  const parsed = JSON.parse(await readFile(sourcePath, 'utf8')) as Record<
    string,
    unknown
  >;
  const rows = (key: string): Item[] =>
    Array.isArray(parsed[key]) ? (parsed[key] as Item[]) : [];
  const db = createDatabase(connectionString);
  await db.$connect();
  try {
    await db.user.createMany({
      data: rows('users').map((item) => ({
        id: text(item, 'id'),
        username: text(item, 'username').toLowerCase(),
        email: text(item, 'email').toLowerCase(),
        name: text(item, 'name'),
        passwordHash: text(item, 'passwordHash'),
        role: item.role === 'EDITOR' ? ('EDITOR' as const) : ('ADMIN' as const),
        groups: Array.isArray(item.groups)
          ? item.groups.filter(
              (value): value is string => typeof value === 'string',
            )
          : [],
        isActive: true,
        createdAt: date(item.createdAt),
        updatedAt: date(item.updatedAt, date(item.createdAt)),
      })),
      skipDuplicates: true,
    });
    await db.author.createMany({
      data: rows('authors').map((item) => ({
        id: text(item, 'id'),
        name: text(item, 'name'),
        bio: text(item, 'bio'),
        imageUrl: text(item, 'imageUrl'),
        isActive: true,
        createdAt: date(item.createdAt),
        updatedAt: date(item.updatedAt, date(item.createdAt)),
      })),
      skipDuplicates: true,
    });

    const media = [
      ...rows('images').map((item) => ({
        item,
        kind: 'IMAGE' as const,
        extension: text(item, 'extension'),
      })),
      ...rows('videos').map((item) => ({
        item,
        kind: 'VIDEO' as const,
        extension:
          text(item, 'contentType').split('/')[1]?.toUpperCase() ?? 'VIDEO',
      })),
      ...rows('files').map((item) => ({
        item,
        kind: 'FILE' as const,
        extension: 'PDF',
      })),
    ];
    await db.mediaAsset.createMany({
      data: media.map(({ item, kind, extension }) => ({
        id: text(item, 'id'),
        kind,
        name: text(item, 'name'),
        size: number(item, 'size'),
        extension,
        tags: Array.isArray(item.tags)
          ? item.tags.filter(
              (value): value is string => typeof value === 'string',
            )
          : [],
        storagePath: text(item, 'storagePath'),
        contentType: text(item, 'contentType'),
        isActive: true,
        createdAt: date(item.uploadDate),
        updatedAt: date(item.uploadDate),
      })),
      skipDuplicates: true,
    });

    await db.blogPost.createMany({
      data: rows('blogPosts').map((item) => ({
        id: text(item, 'id'),
        title: text(item, 'title'),
        url: text(item, 'url'),
        description: text(item, 'description'),
        imageUrl: text(item, 'imageUrl'),
        authorId: text(item, 'authorId'),
        language: language(item),
        ...publication(item),
      })),
      skipDuplicates: true,
    });
    await db.slide.createMany({
      data: rows('slides').map((item) => ({
        id: text(item, 'id'),
        logoId: text(item, 'logoId'),
        text: text(item, 'text'),
        buttonText: text(item, 'buttonText'),
        buttonUrl: text(item, 'buttonUrl'),
        language: language(item),
        ...publication(item, true),
      })),
      skipDuplicates: true,
    });
    await db.popup.createMany({
      data: rows('popups').map((item) => ({
        id: text(item, 'id'),
        title: text(item, 'title'),
        description: text(item, 'description'),
        buttonText: text(item, 'buttonText'),
        redirectUrl: text(item, 'redirectUrl'),
        buttonText2: text(item, 'buttonText2'),
        redirectUrl2: text(item, 'redirectUrl2'),
        style: ['WHITE_ORANGE', 'PURPLE_WHITE', 'WHITE_PURPLE'].includes(
          text(item, 'style'),
        )
          ? (text(item, 'style') as
              | 'WHITE_ORANGE'
              | 'PURPLE_WHITE'
              | 'WHITE_PURPLE')
          : 'ORANGE_WHITE',
        language: language(item),
        ...publication(item),
      })),
      skipDuplicates: true,
    });
    await db.ecosystemItem.createMany({
      data: rows('ecosystems').map((item) => ({
        id: text(item, 'id'),
        name: text(item, 'name'),
        imageId: text(item, 'imageId'),
        ...publication(item, true),
      })),
      skipDuplicates: true,
    });
    await db.homeBlogLink.createMany({
      data: rows('homeBlogLinks').map((item) => ({
        id: text(item, 'id'),
        url: text(item, 'url'),
        label: text(item, 'label'),
        ...publication(item, true),
      })),
      skipDuplicates: true,
    });
    await db.clientStory.createMany({
      data: rows('clientStories').map((item) => ({
        id: text(item, 'id'),
        imageId: text(item, 'imageId'),
        shortTitle: text(item, 'shortTitle'),
        longTitle: text(item, 'longTitle'),
        description: text(item, 'description'),
        language: language(item),
        ...publication(item),
      })),
      skipDuplicates: true,
    });
    await db.case.createMany({
      data: rows('cases').map((item) => ({
        id: text(item, 'id'),
        title: text(item, 'title'),
        shortTitle: text(item, 'shortTitle'),
        subtitle: text(item, 'subtitle'),
        content: text(item, 'content'),
        industry: text(item, 'industry'),
        country: text(item, 'country'),
        tag: text(item, 'tag'),
        logoId: text(item, 'logoId') || null,
        language: language(item),
        ...publication(item),
      })),
      skipDuplicates: true,
    });
    await db.caseImage.createMany({
      data: rows('caseImages').map((item) => ({
        id: text(item, 'id'),
        caseId: text(item, 'caseId'),
        imageId: text(item, 'imageId'),
        position: number(item, 'position'),
        isActive: true,
        createdAt: date(item.createdAt),
        updatedAt: date(item.createdAt),
      })),
      skipDuplicates: true,
    });
    await db.caseTestimonial.createMany({
      data: rows('caseTestimonials').map((item) => ({
        id: text(item, 'id'),
        caseId: text(item, 'caseId'),
        authorName: text(item, 'authorName'),
        role: text(item, 'role'),
        company: text(item, 'company'),
        content: text(item, 'content'),
        language: language(item),
        ...publication(item),
      })),
      skipDuplicates: true,
    });
    await db.aboutMedia.createMany({
      data: rows('aboutMedia').map((item) => ({
        id: text(item, 'id'),
        mediaId: text(item, 'imageId'),
        mediaType:
          item.mediaType === 'VIDEO' ? ('VIDEO' as const) : ('IMAGE' as const),
        caption: text(item, 'caption'),
        sortOrder: number(item, 'sortOrder'),
        ...publication(item, true),
      })),
      skipDuplicates: true,
    });
    await db.partner.createMany({
      data: rows('partners').map((item) => ({
        id: text(item, 'id'),
        name: text(item, 'name'),
        logoId: text(item, 'logoId') || null,
        website: text(item, 'website'),
        ...publication(item, true),
      })),
      skipDuplicates: true,
    });
    await db.career.createMany({
      data: rows('careers').map((item) => ({
        id: text(item, 'id'),
        title: text(item, 'title'),
        description: text(item, 'description'),
        location: text(item, 'location'),
        language: language(item),
        ...publication(item, true),
      })),
      skipDuplicates: true,
    });
    await db.serviceItem.createMany({
      data: rows('serviceItems').map((item) => ({
        id: text(item, 'id'),
        name: text(item, 'name'),
        description: text(item, 'description'),
        language: language(item),
        ...publication(item, true),
      })),
      skipDuplicates: true,
    });
  } finally {
    await db.$disconnect();
  }
}

void main();
