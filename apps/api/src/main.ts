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
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);

      try {
        const { hostname } = new URL(origin);
        if (hostname === "vercel.app" || hostname.endsWith(".vercel.app")) {
          return callback(null, true);
        }
      } catch {
        // ignore URL parse errors
      }

      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port, "0.0.0.0");
}

bootstrap();
