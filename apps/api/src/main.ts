import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(",").map((value) => value.trim()) ?? true,
    credentials: true
  });

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
}

bootstrap();
