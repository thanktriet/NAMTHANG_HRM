import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private ensureAdmin(user: any) {
    if (!user?.isAdmin) {
      throw new ForbiddenException('Chỉ quản trị viên mới có quyền này');
    }
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    this.ensureAdmin(user);
    return this.usersService.findAll();
  }

  @Get('meta/work-areas')
  async getWorkAreas(@CurrentUser() user: any) {
    this.ensureAdmin(user);
    return this.usersService.getWorkAreas();
  }

  @Patch(':id/work-area')
  async updateWorkArea(
    @Param('id') id: string,
    @Body() body: { work_area?: string | null },
    @CurrentUser() user: any,
  ) {
    this.ensureAdmin(user);
    return this.usersService.updateWorkArea(id, body?.work_area ?? null);
  }
}
