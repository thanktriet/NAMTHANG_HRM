import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateAssetDto, FilterAssetDto } from './dto';

/**
 * Controller quản lý tài sản
 * Cung cấp các API REST cho chức năng CRUD tài sản
 */
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  /**
   * Lấy danh sách tài sản có phân trang và lọc
   * GET /assets?search=...&category=...&status=...&page=1&limit=10
   */
  @Get()
  async findAll(@Query() filterDto: FilterAssetDto) {
    return this.assetsService.findAll(filterDto);
  }

  /**
   * Lấy thống kê tài sản cho dashboard
   * GET /assets/stats
   */
  @Get('stats')
  async getStats() {
    return this.assetsService.getStats();
  }

  /**
   * Đếm số lượng tài sản theo danh mục
   * GET /assets/categories
   */
  @Get('categories')
  async countByCategory() {
    return this.assetsService.getCategoryStats();
  }

  /**
   * Lấy chi tiết một tài sản theo ID
   * GET /assets/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  /**
   * Tạo mới tài sản
   * POST /assets
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  /**
   * Cập nhật thông tin tài sản
   * PATCH /assets/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
  ) {
    return this.assetsService.update(id, updateAssetDto);
  }

  /**
   * Xóa tài sản (soft delete)
   * DELETE /assets/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }
}
