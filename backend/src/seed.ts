import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Role } from './common/roles';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const config = app.get(ConfigService);
  const users = app.get(UsersService);

  const email = config.get('ADMIN_EMAIL', 'admin@example.com');
  const existing = await users.findByEmail(email);
  if (!existing) {
    await users.create(
      {
        name: config.get('ADMIN_NAME', 'Primary System Administrator'),
        email,
        address: 'Default administrative address',
        password: config.get('ADMIN_PASSWORD', 'Admin@123'),
        role: Role.Admin,
      },
      Role.Admin,
    );
    console.log(`Created admin user: ${email}`);
  } else {
    console.log(`Admin user already exists: ${email}`);
  }

  await app.close();
}

seed();
