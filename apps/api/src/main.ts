import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.setGlobalPrefix("api");

  const allowedOrigins = (
    process.env.CORS_ORIGIN ??
    "http://localhost:3000,http://127.0.0.1:3000,https://outsidetecangra-cmd.github.io"
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
}

bootstrap();
