import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UnauthorizedException,
  Logger,
  BadRequestException,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserAccess } from '../access/services/user-access.service';
import {
  SigninDto,
  SignupDto,
  AuthResponse,
  AuthResponseDto,
  MSSignInDto,
  SignInWithCodeDto,
} from '../common/dto/auth.dto';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { HttpService } from '@nestjs/axios';
import { TenantAccess } from '../access/services/tenant-access.service';
import { UserCreateDto } from 'src/common/dto/user.dto';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly userAccess: UserAccess,
    private readonly httpService: HttpService,
    private readonly tenantAccess: TenantAccess
  ) {}

  @Post('signin')
  @ApiOperation({ summary: 'Signin user' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signin(
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
    // check if user already exists by email
    const user = await this.userAccess.findOneUser({
      where: { email: signupDto.email },
    });
    if (user) {
      throw new BadRequestException('User already exists');
    }

    // check if user already exists by username
    const userByUsername = await this.userAccess.findOneUser({
      where: { username: signupDto.username },
    });
    if (userByUsername) {
      throw new BadRequestException('Username already exists');
    }

    const createUserDto: UserCreateDto = {
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
      this.createOrFindUser(
        msUser.mail,
        msUser.givenName,
        msUser.surname,
        'MS'
      );

      this.logger.log(`User ${msUser.mail} signed in with Microsoft`);

      return this.userAccess.authForExternal(msUser.mail);
    } catch (error) {
      this.logger.error(`Microsoft signin failed: ${error.message}`);
      throw new UnauthorizedException('Microsoft authentication failed');
    }
  }

  @Post('signin-with-cognito')
  @ApiOperation({ summary: 'Sign in with Cognito authorization code' })
  @ApiResponse({
    status: 200,
    description: 'User authenticated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async signInWithCognito(
    @Body() signInDto: SignInWithCodeDto
  ): Promise<AuthResponse> {
    try {
      // Exchange authorization code for tokens
      const tokenEndpoint =
        process.env.COGNITO_TOKEN_ENDPOINT ||
        'https://your-cognito-domain.auth.region.amazoncognito.com/oauth2/token';
      const tokenResponse = await firstValueFrom(
        this.httpService.post(
          tokenEndpoint,
          new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.COGNITO_CLIENT_ID,
            client_secret: process.env.COGNITO_CLIENT_SECRET,
            code: signInDto.code,
            redirect_uri: signInDto.redirectUri,
          }).toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        )
      );

      const { access_token, id_token } = tokenResponse.data;

      // Get user information using the access token
      const userInfoEndpoint =
        process.env.COGNITO_USER_INFO_ENDPOINT ||
        'https://your-cognito-domain.auth.region.amazoncognito.com/oauth2/userInfo';
      const userInfoResponse = await firstValueFrom(
        this.httpService.get(userInfoEndpoint, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
      );

      const userInfo = userInfoResponse.data;

      const userId = this.createOrFindUser(userInfo.email, '', '', 'Cognito');

      // Check if user exists in our system and authenticate them
      // Assuming email is the username in our system
      const authResponse = await this.userAccess.authForExternal(
        userInfo.email
      );

      return authResponse;
    } catch (error) {
      console.error(
        'Cognito authentication error:',
        error.response?.data || error.message
      );
      throw new HttpException(
        'Failed to authenticate with Cognito',
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  async test(): Promise<string> {
    return 'Hello';
  }

  async createOrFindUser(
    email: string,
    firstName: string,
    lastName: string,
    source: string
  ): Promise<string> {
    // Find or create user
    this.logger.log('find/creating user ' + email);
    let user = await this.userAccess.findOneUser({
      where: { email: email },
    });

    let tenantId = '';
    if (email.endsWith('@dontpaniclabs.com')) {
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
      this.logger.log('Creating user ' + email);
      userId = await this.userAccess.upsertUser({
        username: email,
        email: email,
        firstName: firstName,
        lastName: lastName,
        source: source,
        // Set a random password since we won't use it
        password: Math.random().toString(36),
        role: 'user',
        tenantId: tenantId,
      });
    }

    return userId;
  }
}
