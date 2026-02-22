import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Auth, JwtAuth } from '../decorators/auth.decorator';
import { PERMISSIONS } from '@app/common';
import { UploadsService } from './uploads.service';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @JwtAuth()
  @ApiOperation({ summary: 'Upload a file to Cloudflare R2' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', example: 'avatars' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder: string | undefined,
    @Req() req: any,
  ) {
    if (!file) throw new BadRequestException('Không có file được gửi lên');
    return this.uploadsService.uploadFile(file, folder, req.user?.userId);
  }

  @Get()
  @Auth(PERMISSIONS.UPLOAD_VIEW)
  @ApiOperation({ summary: 'List uploaded files — requires upload:view' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('folder') folder?: string,
  ) {
    return this.uploadsService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      folder,
    });
  }

  @Get(':id')
  @JwtAuth()
  @ApiOperation({ summary: 'Get file upload by ID' })
  async findById(@Param('id') id: string) {
    return this.uploadsService.findById(id);
  }

  @Delete(':id')
  @Auth(PERMISSIONS.UPLOAD_DELETE)
  @ApiOperation({ summary: 'Delete file from R2 + DB — requires upload:delete' })
  async delete(@Param('id') id: string) {
    return this.uploadsService.deleteFile(id);
  }
}
