import * as detectPort from 'detect-port';
import * as http from 'http';
import * as opn from 'opn';
import * as sockjs from 'sockjs';
import ora = require('ora');

import * as cfg from '../cfg';

import confirm from '../utils/confirm';
import { error, info } from '../utils/log';
import { LOGIN_URL as CLI_LOGIN_URL } from '../utils/url';

// TYPES
import * as Commander from 'commander';

/**
 * Open up a websocket server that the codesandbox website can connect to,
 * this server will just wait for a user object to arrive from the website
 * as soon as the user has pressed the confirm button.
 *
 * @param {number} port Port to listen to
 * @returns a promise that will resolve to the user object
 */
function openSocketServer(port: number) {
  return new Promise((resolve, reject) => {
    const echo = sockjs.createServer({ log: x => x });
    const server = http.createServer();

    echo.on('connection', conn => {
      conn.on('data', (message: string) => {
        try {
          const data = JSON.parse(message);
          resolve(data);
          server.close();
        } catch (e) {
          reject(e);
        }
      });
    });

    echo.installHandlers(server, { prefix: '/login' });
    server.listen(port, 'localhost');
  });
}

/**
 * Start the sign in process by opening CodeSandbox CLI login url and opening
 * a websocket server to accept the user data
 *
 * @returns
 */
async function handleSignIn() {
  const spinner = ora('Opening CodeSandbox').start();

  // Find any available port
  const port = await detectPort();

  // Open specific url with said port
  opn(`${CLI_LOGIN_URL}?port=${port}`, { wait: false });

  const userInfo = (await openSocketServer(port)) as IUser;

  spinner.text = 'Saving data';
  await cfg.saveUser(userInfo);
  spinner.stop();

  return userInfo;
}

export async function login() {
  const confirmed = await confirm(
    'We will open CodeSandbox to finish the login process',
  );

  if (confirmed) {
    try {
      const user = await handleSignIn();

      info(`Succesfully signed in as ${user.username}!`);
    } catch (e) {
      error('Something went wrong while signing in: ' + e.message);
    }
  }
}

export default function registerCLI(program: typeof Commander) {
  program
    .command('login')
    .description('sign in to your CodeSandbox account or create a new one')
    .action(async () => {
      const user = await cfg.getUser();

      if (user) {
        const confirmed = await confirm(
          'You are already logged in, would you like to sign out first?',
        );

        if (confirmed) {
          await cfg.deleteUser();
        } else {
          return;
        }
      }

      await login();
    });
}
