import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller()
export class MaintenanceController {
  @Get('/maintenance')
  maintenancePage(@Res() res: Response) {
    const maintenanceHtml = `
      <!DOCTYPE html>
      <html lang="pl">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Konserwacja - Rezerwacja24.pl</title>
          <style>
              body {
                  font-family: 'Arial', sans-serif;
                  background-color: #f5f5f5;
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  text-align: center;
              }
              .maintenance-container {
                  background: white;
                  padding: 3rem;
                  border-radius: 10px;
                  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
                  max-width: 600px;
                  width: 90%;
              }
              h1 {
                  color: #e74c3c;
                  margin-bottom: 1.5rem;
              }
              p {
                  color: #555;
                  line-height: 1.6;
                  margin-bottom: 2rem;
              }
              .logo {
                  max-width: 200px;
                  margin-bottom: 2rem;
              }
          </style>
      </head>
      <body>
          <div class="maintenance-container">
              <img src="https://rezerwacja24.pl/logo.png" alt="Rezerwacja24.pl" class="logo">
              <h1>Przepraszamy za utrudnienia</h1>
              <p>W tej chwili trwają prace konserwacyjne. Prosimy o cierpliwość, wkrótce wracamy!</p>
              <p>Za utrudnienia przepraszamy.</p>
              <p><strong>Zespół Rezerwacja24.pl</strong></p>
          </div>
      </body>
      </html>
    `;
    
    res.status(503).send(maintenanceHtml);
  }
}
