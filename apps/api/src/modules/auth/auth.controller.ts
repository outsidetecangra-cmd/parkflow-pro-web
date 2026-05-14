import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AgentLoginBody, LoginBody } from "./auth.types";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() body: LoginBody) {
    return this.authService.login(body);
  }

  @Post("agent/login")
  agentLogin(@Body() body: AgentLoginBody) {
    return this.authService.agentLogin(body);
  }
}

