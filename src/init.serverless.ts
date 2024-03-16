import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { Callback, Context, Handler } from 'aws-lambda';
import serverlessExpress from '@codegenie/serverless-express';
import { AppModule } from './app.module';
import { PostsService } from './posts/posts.service';
import { Author } from './authors/entities/author.entity';

let cachedServer: INestApplication;

async function bootstrapServer(): Promise<INestApplication> {
  if (!cachedServer) {
    const nestApp = await NestFactory.create(AppModule);

    await nestApp.init();
    cachedServer = nestApp;
  }
  return cachedServer;
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  cachedServer = await bootstrapServer();

  // Inicializar lambda consumer sqs
  if (event.Records) {
    const handler = cachedServer.get(PostsService);
    const { body } = event.Records[0];
    console.log({ body });

    return handler.handleMessage(JSON.parse(body) as Author);
  }

  // Inicializar lambda http
  const expressApp = cachedServer.getHttpAdapter().getInstance();
  const server = serverlessExpress({ app: expressApp });
  return server(event, context, callback);
};
