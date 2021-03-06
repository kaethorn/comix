// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

const testProxy = require('./test-proxy');

exports.config = {
  SELENIUM_PROMISE_MANAGER: false,
  allScriptsTimeout: 11000,
  baseUrl                 : 'http://localhost:8090/',
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: [ '--window-size=3840,2160' ]
    }
  },
  directConnect           : true,
  framework               : 'jasmine',
  jasmineNodeOpts         : {
    defaultTimeoutInterval: 30000,
    print() {},
    showColors            : true
  },
  onCleanUp: () => testProxy.stop(),
  onPrepare: async () => {
    await testProxy.start();

    // Fake log in
    await browser.get('/');
    await browser.executeScript(() => {
      const mockUser = {
        email  : 'b.wayne@waynecorp.com',
        name   : 'B.Wayne',
        picture: 'https://img.icons8.com/office/80/000000/batman-old.png',
        token  : 'mock-123'
      };
      localStorage.setItem('token', mockUser.token);
      localStorage.setItem('user', JSON.stringify(mockUser));
    });

    // Wait for service worker to be active.
    await browser.wait(async () => {
      const serviceWorkerStatus = await browser.executeScript(() =>
        navigator.serviceWorker.controller ?
          navigator.serviceWorker.controller.state : ''
      );
      return serviceWorkerStatus === 'activated';
    });

    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: 'raw' } }));
  },
  specs            : [
    './src/**/*.e2e-spec.ts'
  ]
};
