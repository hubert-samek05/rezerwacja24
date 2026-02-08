import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
  Logger,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { randomUUID } from 'crypto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    private readonly adminService: AdminService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Middleware do sprawdzania uprawnień admina
   */
  private async checkAdmin(req: any) {
    this.logger.log(`Sprawdzanie admina: ${JSON.stringify(req.user)}`);
    
    const role = req.user?.role;
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    
    this.logger.log(`Role: "${role}", userId: "${userId}", typeof role: ${typeof role}`);
    
    if (!userId) {
      throw new ForbiddenException('Brak autoryzacji');
    }

    // Sprawdź rolę bezpośrednio z tokena
    if (role === 'SUPER_ADMIN') {
      this.logger.log(`Admin zweryfikowany: ${userId}`);
      return;
    }
    
    this.logger.log(`Role check failed, checking database...`);

    // Fallback - sprawdź w bazie
    const isAdmin = await this.adminService.checkAdminAccess(userId);
    if (!isAdmin) {
      this.logger.warn(`Próba dostępu do panelu admina przez użytkownika ${userId}`);
      throw new ForbiddenException('Brak uprawnień administratora');
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Pobiera statystyki platformy' })
  async getStats(@Req() req: any) {
    await this.checkAdmin(req);
    return this.adminService.getPlatformStats();
  }

  @Get('tenants')
  @ApiOperation({ summary: 'Pobiera listę wszystkich firm' })
  async getTenants(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    await this.checkAdmin(req);
    return this.adminService.getAllTenants(
      parseInt(page || '1'),
      parseInt(limit || '20'),
    );
  }

  @Get('tenants/:id')
  @ApiOperation({ summary: 'Pobiera szczegóły firmy' })
  async getTenantDetails(@Req() req: any, @Param('id') id: string) {
    await this.checkAdmin(req);
    return this.adminService.getTenantDetails(id);
  }

  @Post('tenants/:id/suspend')
  @ApiOperation({ summary: 'Zawiesza firmę' })
  async suspendTenant(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    await this.checkAdmin(req);
    this.logger.warn(`Admin zawiesza firmę ${id}`);
    return this.adminService.suspendTenant(id, body.reason);
  }

  @Post('tenants/:id/unsuspend')
  @ApiOperation({ summary: 'Odblokowuje firmę' })
  async unsuspendTenant(@Req() req: any, @Param('id') id: string) {
    await this.checkAdmin(req);
    this.logger.log(`Admin odblokowuje firmę ${id}`);
    return this.adminService.unsuspendTenant(id);
  }

  @Get('users')
  @ApiOperation({ summary: 'Pobiera listę wszystkich użytkowników' })
  async getUsers(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    await this.checkAdmin(req);
    return this.adminService.getAllUsers(
      parseInt(page || '1'),
      parseInt(limit || '20'),
    );
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'Pobiera listę wszystkich subskrypcji' })
  async getSubscriptions(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    await this.checkAdmin(req);
    return this.adminService.getAllSubscriptions(
      parseInt(page || '1'),
      parseInt(limit || '20'),
    );
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Pobiera listę wszystkich faktur' })
  async getInvoices(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    await this.checkAdmin(req);
    return this.adminService.getAllInvoices(
      parseInt(page || '1'),
      parseInt(limit || '20'),
    );
  }

  @Post('send-invoice')
  @ApiOperation({ summary: 'Wysyła fakturę do klienta (bez załącznika)' })
  async sendInvoice(
    @Req() req: any,
    @Body() body: {
      email: string;
      name: string;
      invoiceNumber: string;
      amount: string;
      invoiceDate: string;
      downloadLink?: string;
    },
  ) {
    await this.checkAdmin(req);
    
    this.logger.log(`📧 Admin wysyła fakturę ${body.invoiceNumber} do ${body.email}`);
    
    const result = await this.emailService.sendInvoiceEmail(body.email, {
      name: body.name,
      invoiceNumber: body.invoiceNumber,
      amount: body.amount,
      invoiceDate: body.invoiceDate,
      downloadLink: body.downloadLink,
    });

    if (result) {
      return { success: true, message: `Faktura ${body.invoiceNumber} wysłana do ${body.email}` };
    } else {
      return { success: false, message: 'Błąd wysyłania faktury' };
    }
  }

  @Post('send-invoice-pdf')
  @ApiOperation({ summary: 'Wysyła fakturę z załącznikiem PDF do klienta' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('pdf'))
  async sendInvoiceWithPdf(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      email: string;
      name: string;
      invoiceNumber: string;
      amount: string;
      invoiceDate: string;
    },
  ) {
    await this.checkAdmin(req);

    if (!file) {
      return { success: false, message: 'Brak pliku PDF' };
    }

    if (file.mimetype !== 'application/pdf') {
      return { success: false, message: 'Plik musi być w formacie PDF' };
    }
    
    this.logger.log(`📧 Admin wysyła fakturę ${body.invoiceNumber} z PDF do ${body.email}`);
    
    const result = await this.emailService.sendInvoiceWithAttachment(body.email, {
      name: body.name,
      invoiceNumber: body.invoiceNumber,
      amount: body.amount,
      invoiceDate: body.invoiceDate,
      pdfBuffer: file.buffer,
      pdfFilename: `Faktura_${body.invoiceNumber.replace(/\//g, '-')}.pdf`,
    });

    if (result) {
      // Zapisz fakturę do bazy danych
      try {
        const amountNumber = parseFloat(body.amount.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
        await this.prisma.invoices.create({
          data: {
            id: randomUUID(),
            tenantId: 'manual-invoice', // Faktura wysłana ręcznie
            stripeInvoiceId: `manual-${body.invoiceNumber.replace(/\//g, '-')}-${Date.now()}`,
            amount: amountNumber,
            currency: 'PLN',
            status: 'sent',
            invoiceUrl: null,
            invoicePdf: null,
            paidAt: null,
            dueDate: null,
          },
        });
        this.logger.log(`📝 Faktura ${body.invoiceNumber} zapisana do bazy`);
      } catch (dbError) {
        this.logger.error(`Błąd zapisu faktury do bazy: ${dbError.message}`);
      }
      
      return { success: true, message: `Faktura ${body.invoiceNumber} z PDF wysłana do ${body.email}` };
    } else {
      return { success: false, message: 'Błąd wysyłania faktury' };
    }
  }

  /**
   * Pobiera listę faktur dla tenanta
   */
  @Get('invoices/:tenantId')
  @ApiOperation({ summary: 'Pobierz faktury dla tenanta' })
  async getInvoicesForTenant(@Req() req: any, @Param('tenantId') tenantId: string) {
    await this.checkAdmin(req);
    
    const invoices = await this.prisma.invoices.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    
    return invoices;
  }

  /**
   * Dodaje nową fakturę ręcznie
   */
  @Post('invoices')
  @ApiOperation({ summary: 'Dodaj fakturę ręcznie' })
  async addInvoice(
    @Req() req: any,
    @Body() body: {
      tenantId: string;
      amount: number;
      currency?: string;
      status: string;
      description?: string;
      invoicePdf?: string;
      paidAt?: string;
    }
  ) {
    await this.checkAdmin(req);
    
    const invoice = await this.prisma.invoices.create({
      data: {
        id: randomUUID(),
        tenantId: body.tenantId,
        amount: body.amount,
        currency: body.currency || 'PLN',
        status: body.status,
        invoicePdf: body.invoicePdf || null,
        paidAt: body.paidAt ? new Date(body.paidAt) : null,
        createdAt: new Date(),
      },
    });
    
    this.logger.log(`Dodano fakturę ${invoice.id} dla tenanta ${body.tenantId}`);
    return invoice;
  }

  /**
   * Usuwa fakturę
   */
  @Post('invoices/:invoiceId/delete')
  @ApiOperation({ summary: 'Usuń fakturę' })
  async deleteInvoice(@Req() req: any, @Param('invoiceId') invoiceId: string) {
    await this.checkAdmin(req);
    
    await this.prisma.invoices.delete({
      where: { id: invoiceId },
    });
    
    this.logger.log(`Usunięto fakturę ${invoiceId}`);
    return { success: true };
  }

  /**
   * Aktualizuje fakturę (dodaje PDF link)
   */
  @Post('invoices/:invoiceId/update')
  @ApiOperation({ summary: 'Aktualizuj fakturę (dodaj PDF link)' })
  async updateInvoice(
    @Req() req: any,
    @Param('invoiceId') invoiceId: string,
    @Body() body: { invoicePdf?: string; description?: string }
  ) {
    await this.checkAdmin(req);
    
    const invoice = await this.prisma.invoices.update({
      where: { id: invoiceId },
      data: {
        invoicePdf: body.invoicePdf,
        description: body.description,
      },
    });
    
    this.logger.log(`Zaktualizowano fakturę ${invoiceId}, PDF: ${body.invoicePdf}`);
    return invoice;
  }

  /**
   * Upload pliku PDF faktury
   */
  @Post('invoices/:invoiceId/upload-pdf')
  @ApiOperation({ summary: 'Upload pliku PDF faktury' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('pdf', {
    dest: './uploads/invoices',
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Tylko pliki PDF są dozwolone'), false);
      }
    },
  }))
  async uploadInvoicePdf(
    @Req() req: any,
    @Param('invoiceId') invoiceId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    await this.checkAdmin(req);
    
    if (!file) {
      return { success: false, message: 'Brak pliku' };
    }

    // Zmień nazwę pliku na bardziej czytelną
    const fs = require('fs');
    const path = require('path');
    const newFileName = `invoice-${invoiceId}-${Date.now()}.pdf`;
    const newPath = path.join('./uploads/invoices', newFileName);
    
    fs.renameSync(file.path, newPath);

    // Generuj URL do pliku
    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = isProduction ? 'https://api.rezerwacja24.pl' : 'http://localhost:3001';
    const pdfUrl = `${baseUrl}/uploads/invoices/${newFileName}`;

    // Zaktualizuj fakturę
    const invoice = await this.prisma.invoices.update({
      where: { id: invoiceId },
      data: { invoicePdf: pdfUrl },
    });
    
    this.logger.log(`Uploaded PDF for invoice ${invoiceId}: ${pdfUrl}`);
    return { success: true, pdfUrl, invoice };
  }
}
