const {writeFileSync, mkdirSync} = require('fs')

require('dotenv').config();

const targetPath = './src/environments/environment.ts';
const targetPathDev = './src/environments/environment.development.ts';

const url_api_main = process.env['URL_API_MAIN'];

const envFileContent = `
export const environment = {
  url_api_main: '${url_api_main}',
};
`;

mkdirSync('./src/environments', {recursive: true});
writeFileSync(targetPath, envFileContent);
writeFileSync(targetPathDev, envFileContent);
