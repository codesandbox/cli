import * as chalk from 'chalk';
import * as Commander from 'commander';
import * as inquirer from 'inquirer';

import { getUser } from '../cfg';
import confirm from '../utils/confirm';
import { error, info } from '../utils/log';
import { login } from './login';

import parseSandbox from '../utils/parse-sandbox';

export default function registerCommand(program: typeof Commander) {
  program
    .command('deploy <path>')
    .alias('*')
    .description(
      `deploy an application to CodeSandbox ${chalk.bold('(default)')}`,
    )
    .action(async path => {
      const user = await getUser();

      if (!user) {
        info('You need to sign in before you can deploy applications');
        const confirmed = await confirm('Do you want to sign in using GitHub?');

        if (!confirmed) {
          return;
        }

        await login();
      }

      info(`Deploying ${path} to CodeSandbox`);
      try {
        await parseSandbox(path);
      } catch (e) {
        error(e.message);
      }
    });
}
