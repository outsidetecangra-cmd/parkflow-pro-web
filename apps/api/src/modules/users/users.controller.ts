import { Controller, Get, Headers } from "@nestjs/common";
import { UsersService } from "./users.service";

@Controller("me")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("context")
  getContext(@Headers("authorization") authorization?: string) {
    return this.usersService.getContext(authorization);
  }
}

