import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mailUser = configService.get<string>('MAIL_USER');
        const mailPass = configService.get<string>('MAIL_PASSWORD');
        
        const transportConfig: any = {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          secure: configService.get<string>('MAIL_SECURE') === 'true',
        };
        
        // Only include auth if credentials are provided (Mailhog doesn't need auth)
        if (mailUser && mailPass) {
          transportConfig.auth = {
            user: mailUser,
            pass: mailPass,
          };
        }
        
        return {
          transport: transportConfig,
          defaults: {
            from: `"${configService.get<string>('MAIL_FROM_NAME')}" <${configService.get<string>('MAIL_FROM_EMAIL')}>`,
          },
          template: {
            dir: join(process.cwd(), 'dist', 'email', 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
