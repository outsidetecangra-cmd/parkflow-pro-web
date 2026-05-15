import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { appConfig } from "./config/app.config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { UnitsModule } from "./modules/units/units.module";
import { TicketsModule } from "./modules/tickets/tickets.module";
import { OperationsModule } from "./modules/operations/operations.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { AgentsModule } from "./modules/agents/agents.module";
import { DevicesModule } from "./modules/devices/devices.module";
import { SyncModule } from "./modules/sync/sync.module";
import { HealthModule } from "./modules/health/health.module";
import { PricingModule } from "./modules/pricing/pricing.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env", ".env"],
      load: [appConfig]
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    UnitsModule,
    TicketsModule,
    OperationsModule,
    PaymentsModule,
    AgentsModule,
    DevicesModule,
    SyncModule,
    HealthModule,
    PricingModule
  ]
})
export class AppModule {}

