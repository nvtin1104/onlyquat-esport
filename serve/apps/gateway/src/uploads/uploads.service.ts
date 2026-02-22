import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { PrismaService } from '@app/common';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
]);

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class UploadsService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const accountId = this.config.getOrThrow<string>('R2_ACCOUNT_ID');
    this.bucket = this.config.getOrThrow<string>('R2_BUCKET_NAME');
    this.publicUrl = this.config.getOrThrow<string>('R2_PUBLIC_URL');

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow<string>('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'general',
    uploadedById?: string,
  ) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        `Loại file không được phép. Chấp nhận: ${[...ALLOWED_MIME_TYPES].join(', ')}`,
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException('File vượt quá giới hạn 10 MB');
    }

    const ext = file.originalname.split('.').pop() ?? 'bin';
    const key = `${folder}/${uuidv4()}.${ext}`;

    await new Upload({
      client: this.s3,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      },
    }).done();

    const url = `${this.publicUrl.replace(/\/$/, '')}/${key}`;

    return this.prisma.fileUpload.create({
      data: {
        key,
        url,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        folder,
        uploadedById: uploadedById ?? null,
      },
    });
  }

  async findAll(params: { page: number; limit: number; folder?: string }) {
    const { page, limit, folder } = params;
    const where = folder ? { folder } : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.fileUpload.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.fileUpload.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const file = await this.prisma.fileUpload.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('Không tìm thấy file');
    return file;
  }

  async deleteFile(id: string) {
    const file = await this.findById(id);
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: file.key }));
    await this.prisma.fileUpload.delete({ where: { id } });
    return { message: 'Đã xoá file thành công' };
  }
}
