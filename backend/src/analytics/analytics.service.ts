import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  private getDateRange(startDate?: string, endDate?: string) {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { start, end };
  }

  // Helper: Pobierz employeeIds dla tenanta
  private async getEmployeeIdsForTenant(tenantId: string): Promise<string[]> {
    const tenantUsers = await this.prisma.tenant_users.findMany({
      where: { tenantId },
      select: { userId: true },
    });
    
    const userIds = tenantUsers.map(tu => tu.userId);
    
    const employees = await this.prisma.employees.findMany({
      where: { userId: { in: userIds } },
      select: { id: true },
    });
    
    return employees.map(e => e.id);
  }

  async getOverview(tenantId: string, startDate?: string, endDate?: string) {
    const { start, end } = this.getDateRange(startDate, endDate);
    const employeeIds = await this.getEmployeeIdsForTenant(tenantId);

    // Pobierz wszystkie rezerwacje w okresie dla tego tenanta
    const bookings = await this.prisma.bookings.findMany({
      where: {
        employeeId: { in: employeeIds },  // ← FILTRUJ PO TENANT!
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        customers: true,
        services: true,
        employees: true,
      },
    });

    // Oblicz podstawowe statystyki
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
    const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;
    const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;

    // Przychód faktyczny (zrealizowany) - tylko opłacone rezerwacje
    const paidRevenue = bookings
      .filter(b => b.status === 'COMPLETED' && b.isPaid)
      .reduce((sum, b) => sum + Number(b.totalPrice), 0);
    
    // Potencjalny przychód - wszystkie ukończone (opłacone + nieopłacone)
    const totalRevenue = bookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + Number(b.totalPrice), 0);

    const averageBookingValue = completedBookings > 0 ? totalRevenue / completedBookings : 0;

    // Klienci
    const uniqueCustomers = new Set(bookings.map(b => b.customerId)).size;
    const totalCustomers = await this.prisma.customers.count();

    // Porównanie z poprzednim okresem
    const periodLength = end.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - periodLength);
    const previousEnd = start;

    const previousBookings = await this.prisma.bookings.count({
      where: {
        createdAt: {
          gte: previousStart,
          lt: previousEnd,
        },
      },
    });

    const previousRevenue = await this.prisma.bookings.aggregate({
      where: {
        createdAt: {
          gte: previousStart,
          lt: previousEnd,
        },
        status: 'COMPLETED',
        isPaid: true, // Tylko opłacone
      },
      _sum: {
        totalPrice: true,
      },
    });

    const bookingsGrowth = previousBookings > 0 
      ? ((totalBookings - previousBookings) / previousBookings) * 100 
      : 0;

    const revenueGrowth = previousRevenue._sum.totalPrice 
      ? ((paidRevenue - Number(previousRevenue._sum.totalPrice)) / Number(previousRevenue._sum.totalPrice)) * 100 
      : 0;

    return {
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      bookings: {
        total: totalBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        pending: pendingBookings,
        growth: Math.round(bookingsGrowth * 10) / 10,
        completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0,
        cancellationRate: totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0,
      },
      revenue: {
        total: Math.round(paidRevenue * 100) / 100, // Przychód faktyczny (opłacony)
        potential: Math.round(totalRevenue * 100) / 100, // Potencjalny (wszystkie COMPLETED)
        unpaid: Math.round((totalRevenue - paidRevenue) * 100) / 100, // Nieopłacone
        growth: Math.round(revenueGrowth * 10) / 10,
        averageBookingValue: Math.round(averageBookingValue * 100) / 100,
      },
      customers: {
        total: totalCustomers,
        active: uniqueCustomers,
        activeRate: totalCustomers > 0 ? Math.round((uniqueCustomers / totalCustomers) * 100) : 0,
      },
    };
  }

  async getRevenue(
    tenantId: string,
    startDate?: string,
    endDate?: string,
    groupBy: 'day' | 'week' | 'month' = 'day',
  ) {
    const { start, end } = this.getDateRange(startDate, endDate);
    const employeeIds = await this.getEmployeeIdsForTenant(tenantId);

    const bookings = await this.prisma.bookings.findMany({
      where: {
        employeeId: { in: employeeIds },  // ← FILTRUJ PO TENANT!
        createdAt: {
          gte: start,
          lte: end,
        },
        status: 'COMPLETED',
        isPaid: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Grupowanie danych
    const grouped = new Map<string, number>();
    
    bookings.forEach(booking => {
      let key: string;
      const date = new Date(booking.createdAt);

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      grouped.set(key, (grouped.get(key) || 0) + Number(booking.totalPrice));
    });

    const chartData = Array.from(grouped.entries()).map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue * 100) / 100,
    }));

    // Statystyki według metody płatności
    const byPaymentMethod = bookings.reduce((acc, booking) => {
      const method = booking.paymentMethod || 'Nieznana';
      acc[method] = (acc[method] || 0) + Number(booking.totalPrice);
      return acc;
    }, {} as Record<string, number>);

    // Najlepsze dni
    const byDayOfWeek = bookings.reduce((acc, booking) => {
      const day = new Date(booking.startTime).getDay();
      const dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
      const dayName = dayNames[day];
      acc[dayName] = (acc[dayName] || 0) + Number(booking.totalPrice);
      return acc;
    }, {} as Record<string, number>);

    return {
      chartData,
      byPaymentMethod: Object.entries(byPaymentMethod).map(([method, revenue]) => ({
        method,
        revenue: Math.round(revenue * 100) / 100,
      })),
      byDayOfWeek: Object.entries(byDayOfWeek).map(([day, revenue]) => ({
        day,
        revenue: Math.round(revenue * 100) / 100,
      })),
      total: Math.round(bookings.reduce((sum, b) => sum + Number(b.totalPrice), 0) * 100) / 100,
    };
  }

  async getBookingsAnalytics(tenantId: string, startDate?: string, endDate?: string) {
    const { start, end } = this.getDateRange(startDate, endDate);

    const bookings = await this.prisma.bookings.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    // Statystyki według statusu
    const byStatus = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Średni czas między rezerwacją a wizytą
    const leadTimes = bookings
      .filter(b => b.createdAt && b.startTime)
      .map(b => {
        const created = new Date(b.createdAt).getTime();
        const start = new Date(b.startTime).getTime();
        return (start - created) / (1000 * 60 * 60 * 24); // dni
      });

    const averageLeadTime = leadTimes.length > 0
      ? leadTimes.reduce((sum, time) => sum + time, 0) / leadTimes.length
      : 0;

    // Rezerwacje według godzin
    const byHour = bookings.reduce((acc, booking) => {
      const hour = new Date(booking.startTime).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Trend rezerwacji (dzień po dniu)
    const dailyBookings = new Map<string, number>();
    bookings.forEach(booking => {
      const date = new Date(booking.createdAt).toISOString().split('T')[0];
      dailyBookings.set(date, (dailyBookings.get(date) || 0) + 1);
    });

    return {
      total: bookings.length,
      byStatus: Object.entries(byStatus).map(([status, count]) => ({
        status,
        count,
        percentage: Math.round((count / bookings.length) * 100),
      })),
      averageLeadTime: Math.round(averageLeadTime * 10) / 10,
      byHour: Object.entries(byHour)
        .map(([hour, count]) => ({
          hour: parseInt(hour),
          count,
        }))
        .sort((a, b) => a.hour - b.hour),
      dailyTrend: Array.from(dailyBookings.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  }

  async getCustomersAnalytics(tenantId: string, startDate?: string, endDate?: string) {
    const { start, end } = this.getDateRange(startDate, endDate);

    const customers = await this.prisma.customers.findMany({
      include: {
        bookings: {
          where: {
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        },
        loyalty_points: true,
      },
    });

    // Nowi klienci w okresie
    const newCustomers = customers.filter(
      c => c.createdAt >= start && c.createdAt <= end
    ).length;

    // Klienci z rezerwacjami
    const activeCustomers = customers.filter(c => c.bookings.length > 0).length;

    // Segmentacja według liczby rezerwacji
    const byBookingCount = customers.reduce((acc, customer) => {
      const count = customer.bookings.length;
      let segment: string;
      if (count === 0) segment = 'Bez rezerwacji';
      else if (count === 1) segment = 'Jednorazowi';
      else if (count <= 5) segment = 'Okazjonalni';
      else if (count <= 10) segment = 'Regularne';
      else segment = 'VIP';

      acc[segment] = (acc[segment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Średnia wartość klienta (CLV)
    const customerValues = customers.map(customer => {
      const totalSpent = customer.bookings
        .filter(b => b.status === 'COMPLETED' && b.isPaid)
        .reduce((sum, b) => sum + Number(b.totalPrice), 0);
      return totalSpent;
    });

    const averageCLV = customerValues.length > 0
      ? customerValues.reduce((sum, val) => sum + val, 0) / customerValues.length
      : 0;

    // Top 10 klientów
    const topCustomers = customers
      .map(customer => ({
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        bookingsCount: customer.bookings.length,
        totalSpent: customer.bookings
          .filter(b => b.status === 'COMPLETED' && b.isPaid)
          .reduce((sum, b) => sum + Number(b.totalPrice), 0),
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Nowi klienci trend
    const newCustomersTrend = new Map<string, number>();
    customers
      .filter(c => c.createdAt >= start && c.createdAt <= end)
      .forEach(customer => {
        const date = new Date(customer.createdAt).toISOString().split('T')[0];
        newCustomersTrend.set(date, (newCustomersTrend.get(date) || 0) + 1);
      });

    return {
      total: customers.length,
      new: newCustomers,
      active: activeCustomers,
      activeRate: customers.length > 0 ? Math.round((activeCustomers / customers.length) * 100) : 0,
      averageCLV: Math.round(averageCLV * 100) / 100,
      segmentation: Object.entries(byBookingCount).map(([segment, count]) => ({
        segment,
        count,
        percentage: Math.round((count / customers.length) * 100),
      })),
      topCustomers: topCustomers.map(c => ({
        ...c,
        totalSpent: Math.round(c.totalSpent * 100) / 100,
      })),
      newCustomersTrend: Array.from(newCustomersTrend.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  }

  async getEmployeesAnalytics(tenantId: string, startDate?: string, endDate?: string) {
    const { start, end } = this.getDateRange(startDate, endDate);

    const employees = await this.prisma.employees.findMany({
      where: {
        isActive: true,
      },
      include: {
        bookings: {
          where: {
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        },
      },
    });

    const employeeStats = employees.map(employee => {
      const completedBookings = employee.bookings.filter(b => b.status === 'COMPLETED');
      const totalRevenue = completedBookings
        .filter(b => b.isPaid)
        .reduce((sum, b) => sum + Number(b.totalPrice), 0);

      const cancelledBookings = employee.bookings.filter(b => b.status === 'CANCELLED').length;
      const cancellationRate = employee.bookings.length > 0
        ? (cancelledBookings / employee.bookings.length) * 100
        : 0;

      return {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        bookingsCount: employee.bookings.length,
        completedBookings: completedBookings.length,
        cancelledBookings,
        cancellationRate: Math.round(cancellationRate * 10) / 10,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageBookingValue: completedBookings.length > 0
          ? Math.round((totalRevenue / completedBookings.length) * 100) / 100
          : 0,
      };
    });

    // Sortuj według przychodów
    employeeStats.sort((a, b) => b.totalRevenue - a.totalRevenue);

    return {
      employees: employeeStats,
      topPerformer: employeeStats[0] || null,
      totalBookings: employeeStats.reduce((sum, e) => sum + e.bookingsCount, 0),
      totalRevenue: Math.round(employeeStats.reduce((sum, e) => sum + e.totalRevenue, 0) * 100) / 100,
    };
  }

  async getServicesAnalytics(tenantId: string, startDate?: string, endDate?: string) {
    const { start, end } = this.getDateRange(startDate, endDate);

    const services = await this.prisma.services.findMany({
      where: {
        isActive: true,
      },
      include: {
        bookings: {
          where: {
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        },
        service_categories: true,
      },
    });

    const serviceStats = services.map(service => {
      const completedBookings = service.bookings.filter(b => b.status === 'COMPLETED');
      const totalRevenue = completedBookings
        .filter(b => b.isPaid)
        .reduce((sum, b) => sum + Number(b.totalPrice), 0);

      return {
        id: service.id,
        name: service.name,
        category: service.service_categories?.name || 'Bez kategorii',
        bookingsCount: service.bookings.length,
        completedBookings: completedBookings.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averagePrice: Math.round(Number(service.basePrice) * 100) / 100,
      };
    });

    // Sortuj według popularności
    serviceStats.sort((a, b) => b.bookingsCount - a.bookingsCount);

    // Statystyki według kategorii
    const byCategory = services.reduce((acc, service) => {
      const categoryName = service.service_categories?.name || 'Bez kategorii';
      const revenue = service.bookings
        .filter(b => b.status === 'COMPLETED' && b.isPaid)
        .reduce((sum, b) => sum + Number(b.totalPrice), 0);

      if (!acc[categoryName]) {
        acc[categoryName] = { count: 0, revenue: 0 };
      }
      acc[categoryName].count += service.bookings.length;
      acc[categoryName].revenue += revenue;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    return {
      services: serviceStats,
      mostPopular: serviceStats[0] || null,
      byCategory: Object.entries(byCategory).map(([category, stats]) => ({
        category,
        bookingsCount: stats.count,
        revenue: Math.round(stats.revenue * 100) / 100,
      })),
      totalBookings: serviceStats.reduce((sum, s) => sum + s.bookingsCount, 0),
      totalRevenue: Math.round(serviceStats.reduce((sum, s) => sum + s.totalRevenue, 0) * 100) / 100,
    };
  }

  async getPeakHours(tenantId: string, startDate?: string, endDate?: string) {
    const { start, end } = this.getDateRange(startDate, endDate);

    const bookings = await this.prisma.bookings.findMany({
      where: {
        startTime: {
          gte: start,
          lte: end,
        },
      },
    });

    // Analiza według godzin
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const bookingsInHour = bookings.filter(
        b => new Date(b.startTime).getHours() === hour
      );
      const revenue = bookingsInHour
        .filter(b => b.status === 'COMPLETED' && b.isPaid)
        .reduce((sum, b) => sum + Number(b.totalPrice), 0);

      return {
        hour,
        bookingsCount: bookingsInHour.length,
        revenue: Math.round(revenue * 100) / 100,
      };
    });

    // Analiza według dni tygodnia
    const dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    const dailyData = Array.from({ length: 7 }, (_, day) => {
      const bookingsInDay = bookings.filter(
        b => new Date(b.startTime).getDay() === day
      );
      const revenue = bookingsInDay
        .filter(b => b.status === 'COMPLETED' && b.isPaid)
        .reduce((sum, b) => sum + Number(b.totalPrice), 0);

      return {
        day: dayNames[day],
        dayNumber: day,
        bookingsCount: bookingsInDay.length,
        revenue: Math.round(revenue * 100) / 100,
      };
    });

    // Znajdź szczyt
    const peakHour = hourlyData.reduce((max, curr) =>
      curr.bookingsCount > max.bookingsCount ? curr : max
    );

    const peakDay = dailyData.reduce((max, curr) =>
      curr.bookingsCount > max.bookingsCount ? curr : max
    );

    return {
      hourly: hourlyData,
      daily: dailyData,
      peak: {
        hour: peakHour,
        day: peakDay,
      },
    };
  }

  async getRetention(tenantId: string) {
    const customers = await this.prisma.customers.findMany({
      include: {
        bookings: {
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    });

    // Klienci z więcej niż jedną rezerwacją
    const returningCustomers = customers.filter(c => c.bookings.length > 1).length;
    const retentionRate = customers.length > 0
      ? (returningCustomers / customers.length) * 100
      : 0;

    // Średni czas między rezerwacjami
    const timeBetweenBookings: number[] = [];
    customers.forEach(customer => {
      if (customer.bookings.length > 1) {
        for (let i = 1; i < customer.bookings.length; i++) {
          const prev = new Date(customer.bookings[i - 1].startTime).getTime();
          const curr = new Date(customer.bookings[i].startTime).getTime();
          const days = (curr - prev) / (1000 * 60 * 60 * 24);
          timeBetweenBookings.push(days);
        }
      }
    });

    const averageTimeBetweenBookings = timeBetweenBookings.length > 0
      ? timeBetweenBookings.reduce((sum, time) => sum + time, 0) / timeBetweenBookings.length
      : 0;

    // Cohort analysis - klienci według miesiąca rejestracji
    const cohorts = new Map<string, { total: number; returning: number }>();
    customers.forEach(customer => {
      const month = new Date(customer.createdAt).toISOString().slice(0, 7);
      if (!cohorts.has(month)) {
        cohorts.set(month, { total: 0, returning: 0 });
      }
      const cohort = cohorts.get(month)!;
      cohort.total++;
      if (customer.bookings.length > 1) {
        cohort.returning++;
      }
    });

    const cohortData = Array.from(cohorts.entries())
      .map(([month, data]) => ({
        month,
        total: data.total,
        returning: data.returning,
        retentionRate: data.total > 0 ? Math.round((data.returning / data.total) * 100) : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      retentionRate: Math.round(retentionRate * 10) / 10,
      returningCustomers,
      oneTimeCustomers: customers.length - returningCustomers,
      averageTimeBetweenBookings: Math.round(averageTimeBetweenBookings * 10) / 10,
      cohorts: cohortData,
    };
  }

  async getConversion(tenantId: string, startDate?: string, endDate?: string) {
    const { start, end } = this.getDateRange(startDate, endDate);

    const bookings = await this.prisma.bookings.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length;
    const completed = bookings.filter(b => b.status === 'COMPLETED').length;
    const cancelled = bookings.filter(b => b.status === 'CANCELLED').length;
    const noShow = bookings.filter(b => b.status === 'NO_SHOW').length;

    return {
      total,
      confirmed,
      completed,
      cancelled,
      noShow,
      confirmationRate: total > 0 ? Math.round((confirmed / total) * 100) : 0,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      cancellationRate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
      noShowRate: total > 0 ? Math.round((noShow / total) * 100) : 0,
    };
  }

  async getForecast(tenantId: string) {
    // Pobierz dane z ostatnich 90 dni
    const end = new Date();
    const start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);

    const bookings = await this.prisma.bookings.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: 'COMPLETED',
        isPaid: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Grupuj według tygodni
    const weeklyRevenue = new Map<string, number>();
    bookings.forEach(booking => {
      const date = new Date(booking.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const key = weekStart.toISOString().split('T')[0];
      weeklyRevenue.set(key, (weeklyRevenue.get(key) || 0) + Number(booking.totalPrice));
    });

    const weeks = Array.from(weeklyRevenue.entries())
      .map(([week, revenue]) => ({ week, revenue }))
      .sort((a, b) => a.week.localeCompare(b.week));

    // Prosta prognoza liniowa
    if (weeks.length < 2) {
      return {
        forecast: [],
        trend: 'insufficient_data',
        averageWeeklyRevenue: 0,
      };
    }

    const revenues = weeks.map(w => w.revenue);
    const avgRevenue = revenues.reduce((sum, r) => sum + r, 0) / revenues.length;

    // Oblicz trend
    const firstHalf = revenues.slice(0, Math.floor(revenues.length / 2));
    const secondHalf = revenues.slice(Math.floor(revenues.length / 2));
    const firstAvg = firstHalf.reduce((sum, r) => sum + r, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, r) => sum + r, 0) / secondHalf.length;

    const trend = secondAvg > firstAvg * 1.1 ? 'growing' : 
                  secondAvg < firstAvg * 0.9 ? 'declining' : 'stable';

    const growthRate = firstAvg > 0 ? (secondAvg - firstAvg) / firstAvg : 0;

    // Prognoza na następne 4 tygodnie
    const forecast = [];
    let lastRevenue = revenues[revenues.length - 1];
    
    for (let i = 1; i <= 4; i++) {
      lastRevenue = lastRevenue * (1 + growthRate / weeks.length);
      const forecastDate = new Date(end.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      forecast.push({
        week: forecastDate.toISOString().split('T')[0],
        predictedRevenue: Math.round(lastRevenue * 100) / 100,
      });
    }

    return {
      historical: weeks.map(w => ({
        ...w,
        revenue: Math.round(w.revenue * 100) / 100,
      })),
      forecast,
      trend,
      growthRate: Math.round(growthRate * 100 * 10) / 10,
      averageWeeklyRevenue: Math.round(avgRevenue * 100) / 100,
    };
  }
}
