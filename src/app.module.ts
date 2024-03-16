import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthorsModule } from './authors/authors.module';

@Module({
  imports: [PostsModule, ConfigModule, DatabaseModule, AuthorsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
