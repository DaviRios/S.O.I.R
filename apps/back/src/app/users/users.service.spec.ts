import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { CmsStoreService } from '../modules/storage/cms-store.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: CmsStoreService,
          useValue: {
            query: jest.fn((reader) => reader({ users: [] })),
            mutate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
