export const OAUTH_CONFIG = {
  // WordPress site base URL
  baseUrl: 'http://clickshop.local',

  // miniOrange OAuth endpoints
  authorizeEndpoint: 'http://clickshop.local/wp-json/moserver/authorize',
  tokenEndpoint: 'http://clickshop.local/wp-json/moserver/token',
  userinfoEndpoint: 'http://clickshop.local/wp-json/moserver/resource',

  // Client credentials provided by user
  clientId: 'kfsyingxHtmEMkZjGnXlppaSIJoHMjuv',
  clientSecret: 'oBErrRhUcvkLUYBtQDQdYyzMyqVllUHU',

  // Redirect URI served by this server
  redirectUri: 'http://localhost:3000/oauth/callback',
  scope: 'openid profile email',
};


