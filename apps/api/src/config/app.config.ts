export const appConfig = () => ({
  app: {
    name: "parkflow-api",
    port: Number(process.env.PORT ?? 3001)
  },
  database: {
    url: process.env.DATABASE_URL
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET
  }
});
