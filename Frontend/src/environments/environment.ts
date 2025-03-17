export const environment = {
  production: false,
  apiUrl: 'api/v1',
  microsoftClientId: 'acccbc1c-b682-415b-a239-ebe583219fb4',
  microsoftTenantId: 'c8ab33ea-db21-434b-b8af-7e36c190ee21',
  mockingEnabled: true,

  cognitoUserPoolId: 'your-cognito-user-pool-id',
  cognitoClientId: 'your-cognito-app-client-id',
  cognitoDomain: 'your-cognito-domain',
  cognitoRegion: 'us-east-1', // adjust to your region
  cognitoScope: ['email', 'openid', 'aws.cognito.signin.user.admin', 'phone'],
};
