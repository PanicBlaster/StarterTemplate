import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserAccess } from '../access/services/user-access.service';
import {
  SigninDto,
  SignupDto,
  AuthResponse,
  AuthResponseDto,
  MSSignInDto,
} from '../common/dto/auth.dto';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { HttpService } from '@nestjs/axios';
import { TenantAccess } from 'src/access/services/tenant-access.service';
import { CreateAccountDto } from 'src/common/dto/account.dto';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly userAccess: UserAccess,
    private readonly httpService: HttpService,
    private readonly tenantAccess: TenantAccess
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body(ValidationPipe) loginDto: SigninDto
  ): Promise<AuthResponse> {
    try {
      return await this.userAccess.verifyAuth(
        loginDto.username,
        loginDto.password
      );
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Post('signup')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: AuthResponseDto,
  })
  async signup(
    @Body(ValidationPipe) signupDto: SignupDto
  ): Promise<AuthResponse> {
    const createUserDto: CreateAccountDto = {
      username: signupDto.username,
      password: signupDto.password,
      email: signupDto.email,
      firstName: signupDto.firstName,
      lastName: signupDto.lastName,
      tenantId: signupDto.tenantId,
      role: 'user',
    };

    await this.userAccess.upsertUser(createUserDto);
    return this.userAccess.verifyAuth(signupDto.username, signupDto.password);
  }

  @Post('signinWithMS')
  @ApiOperation({ summary: 'Sign in with Microsoft' })
  @ApiResponse({ status: 200, description: 'Success' })
  async signinWithMS(@Body() msSignInDto: MSSignInDto): Promise<AuthResponse> {
    try {
      this.logger.log(`Signing in with Microsoft ${msSignInDto.code}`);
      // Exchange code for token
      const tokenResponse = await firstValueFrom(
        this.httpService.post(
          'https://login.microsoftonline.com/common/oauth2/v2.0/token',
          new URLSearchParams({
            client_id: process.env.MS_CLIENT_ID,
            client_secret: process.env.MS_CLIENT_SECRET,
            code: msSignInDto.code,
            grant_type: 'authorization_code',
            redirect_uri: process.env.MS_REDIRECT_URI,
            scope: 'openid profile email User.Read',
          }).toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        )
      );

      this.logger.log(`Token response: ${JSON.stringify(tokenResponse.data)}`);

      // Get user info from Microsoft
      const userResponse = await firstValueFrom(
        this.httpService.get('https://graph.microsoft.com/v1.0/me', {
          headers: {
            Authorization: `Bearer ${tokenResponse.data.access_token}`,
          },
        })
      );

      const msUser = userResponse.data;

      // Find or create user
      this.logger.log('find/creating user ' + msUser.mail);
      let user = await this.userAccess.findOneUser({
        where: { email: msUser.mail },
      });

      let tenantId = '';
      if (msUser.mail.endsWith('@dontpaniclabs.com')) {
        this.logger.log('Is there a Dpl tenant?');
        let tenant = await this.tenantAccess.findOneTenant({
          where: { name: 'Dpl' },
        });
        if (tenant) {
          tenantId = tenant.id;
        }
      }

      if (tenantId === '' || !tenantId) {
        this.logger.log('No tenant found, creating a default one');
        tenantId = await this.tenantAccess.upsertTenant({
          name: 'Default',
        });
      }

      let userId = '';
      if (!user) {
        this.logger.log('Creating user ' + msUser.mail);
        userId = await this.userAccess.upsertUser({
          username: msUser.mail,
          email: msUser.mail,
          firstName: msUser.givenName,
          lastName: msUser.surname,
          source: 'MS',
          // Set a random password since we won't use it
          password: Math.random().toString(36),
          role: 'user',
          tenantId: tenantId,
        });
      }

      this.logger.log(`User ${msUser.mail} signed in with Microsoft`);

      return this.userAccess.authForExternal(msUser.mail);
    } catch (error) {
      this.logger.error(`Microsoft signin failed: ${error.message}`);
      throw new UnauthorizedException('Microsoft authentication failed');
    }
  }
}
