import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { PrismaService } from '../common/prisma/prisma.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('booking-redirect')
@Controller('booking')
export class BookingRedirectController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get(':tenantId')
  @ApiOperation({ summary: 'Przekierowanie na stronę rezerwacji firmy' })
  async redirectToBooking(
    @Param('tenantId') tenantId: string,
    @Res() res: Response,
  ) {
    // Znajdź tenant po ID
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { subdomain: true },
    });

    if (!tenant || !tenant.subdomain) {
      throw new NotFoundException('Firma nie została znaleziona');
    }

    // Przekieruj na subdomenę
    const redirectUrl = `https://${tenant.subdomain}.rezerwacja24.pl`;
    return res.redirect(301, redirectUrl);
  }
}
