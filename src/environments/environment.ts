// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
// const env = 'http://localhost:62179/api';
const env = 'http://elicamps-001-site3.dtempurl.com/deployments/api';
const envLocal = `http://localhost:62179/api`;
export const environment = {
  production: false,
  appRoot: 'http://elicamps-001-site3.dtempurl.com/deployments/api',
  appGroup: `${env}/Groups`,
  appList: `${env}/List`,
  appUser: `${env}/users`,
  appStudent: `${env}/Student`,
  appFile: `${env}/FileManager`,
  appReporting: `${env}/Reporting`,

  appURL: `http://localhost:4200`
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
