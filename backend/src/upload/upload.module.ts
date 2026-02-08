import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadController } from './upload.controller';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Określ katalog na podstawie typu pliku
          let uploadPath = './uploads';
          
          if (file.fieldname === 'courseThumbnail') {
            uploadPath = './uploads/courses';
          } else if (file.fieldname === 'logo') {
            uploadPath = './uploads/logos';
          } else if (file.fieldname === 'banner') {
            uploadPath = './uploads/banners';
          }
          
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          // Generuj unikalną nazwę pliku
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
          const ext = extname(file.originalname);
          cb(null, `thumbnail-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        // Akceptuj tylko obrazy
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  ],
  controllers: [UploadController],
})
export class UploadModule {}
