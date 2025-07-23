import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🔍 Checking MongoDB connection...');
  console.log('MONGODB_URI from env:', process.env.MONGODB_URI);

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(3001);
  console.log('🚀 Server running on http://localhost:3001');
}
void bootstrap();
