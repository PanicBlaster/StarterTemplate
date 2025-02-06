import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserAccess } from '../access/services/user-access.service';
import { TenantAccess } from '../access/services/tenant-access.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AuthResponse, MSSignInDto } from '../common/dto/auth.dto';
import { SigninDto, SignupDto } from '../common/dto/auth.dto';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly userAccess: UserAccess,
    private readonly tenantAccess: TenantAccess,
    private readonly httpService: HttpService
  ) {}

  @Post('signin')
  @ApiOperation({ summary: 'Authenticate user' })
  @ApiResponse({ status: 200, description: 'Sign in successful' })
  async signin(
    @Body(ValidationPipe) loginDto: SigninDto
  ): Promise<AuthResponse> {
    return this.userAccess.verifyAuth(loginDto.username, loginDto.password);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Create new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  async signup(
    @Body(ValidationPipe) signupDto: SignupDto
  ): Promise<AuthResponse> {
    const user = await this.userAccess.upsert(signupDto);
    return this.userAccess.verifyAuth(user.username, signupDto.password);
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
      let user = await this.userAccess.findByEmail(msUser.mail);

      let tenantId = '';
      if (msUser.mail.endsWith('@dontpaniclabs.com')) {
        this.logger.log('Creating Dpl tenant');
        let tenant = await this.tenantAccess.findByName('Dpl');
        if (!tenant) {
          tenant = await this.tenantAccess.upsert({
            name: 'Dpl',
          });
          tenantId = tenant.id;
        }
      }

      if (!user) {
        this.logger.log('Creating user ' + msUser.mail);
        user = await this.userAccess.upsert({
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

      this.logger.log(`User ${user.username} signed in with Microsoft`);

      return this.userAccess.authForExternal(user.username);
    } catch (error) {
      this.logger.error(`Microsoft signin failed: ${error.message}`);
      throw new UnauthorizedException('Microsoft authentication failed');
    }
  }
}
