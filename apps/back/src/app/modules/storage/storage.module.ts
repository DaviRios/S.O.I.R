import { Global, Module } from '@nestjs/common';
import { CmsStoreService } from './cms-store.service';

@Global()
@Module({
  providers: [CmsStoreService],
  exports: [CmsStoreService],
})
export class StorageModule {}
