let url = ''
switch (process.env.NODE_ENV) { 
  case 'development': url = "/apis"; break;
  case 'test': url = "http://39.98.113.111"; break;
  case 'production': url = "http://39.98.113.111"; break;
  default:  url = "http://39.98.113.111"; break;
}
export default url

