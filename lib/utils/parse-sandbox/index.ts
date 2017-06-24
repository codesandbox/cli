import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import * as inquirer from 'inquirer';
import * as path from 'path';
import ora = require('ora');

import confirm from '../confirm';
import { error, info, log, success, warn } from '../log';
import { createSandboxUrl } from '../url';

import mapDependencies from './dependency-mapper';
import FileError from './file-error';
import mapFiles from './file-mapper';
import parseHTML from './html-parser';
import uploadSandbox from './upload-to-codesandbox';

/**
 * Return package.json object
 *
 * @param {string} projectPath
 * @returns
 */
async function getPackageJSON(projectPath: string) {
  const packageJSONPath = path.join(projectPath, 'package.json');
  const fileExists = await fs.exists(packageJSONPath);
  if (!fileExists) {
    throw new Error(`The project doesn't have a package.json.`);
  }

  return fs.readJson(packageJSONPath);
}

/**
 * Return public/index.html contents
 *
 * @param {string} projectPath
 */
async function getIndexHTML(projectPath: string) {
  const indexHTMLPath = path.join(projectPath, 'public', 'index.html');
  const fileExists = await fs.exists(indexHTMLPath);
  if (!fileExists) {
    return '';
  }

  return fs.readFileSync(indexHTMLPath) || '';
}

const MAX_MODULE_COUNT = 50;
const MAX_DIRECTORY_COUNT = 30;

/**
 * Show warnings for the errors that occured during mapping of files, we
 * still give the user to continue deployment without those files.
 *
 * @param {string} resolvedPath
 * @param {FileError[]} errors
 */
async function showWarnings(resolvedPath: string, errors: FileError[]) {
  if (errors.length > 0) {
    console.log();
    log(
      chalk.yellow(
        `There are ${chalk.bold(
          errors.length.toString(),
        )} files that cannot be uploaded:`,
      ),
    );
    for (const error of errors) {
      const relativePath = error.path.replace(resolvedPath, '');

      log(`${chalk.yellow.bold(relativePath)}: ${error.message}`);
    }
  }

  console.log();
  log(
    chalk.yellow(
      'Support for using the ' +
        chalk.bold('public') +
        ' folder is not yet here',
    ),
  );
  console.log();

  return await confirm('Do you still want to continue deployment?');
}

/**
 * This will take a path and return all parameters that are relevant for the call
 * to the CodeSandbox API fir creating a sandbox
 *
 * @export
 * @param {string} path
 */
export default async function parseSandbox(projectPath: string) {
  const resolvedPath = path.join(process.cwd(), projectPath);

  const dirExists = await fs.exists(resolvedPath);
  if (!dirExists) {
    throw new Error(`The given path (${resolvedPath}) doesn't exist.`);
  }

  const packageJSON = await getPackageJSON(resolvedPath);
  if (packageJSON.dependencies == null) {
    throw new Error("The package.json doesn't have any dependencies.");
  }

  const indexHTML = await getIndexHTML(resolvedPath);

  const dependencies = await mapDependencies(packageJSON.dependencies);
  const { body, externalResources } = parseHTML(indexHTML.toString());

  const { directories, modules, errors } = await mapFiles(
    path.join(resolvedPath, 'src'),
    body,
  );

  if (modules.length > MAX_MODULE_COUNT) {
    throw new Error(
      `This project is too big, it contains ${modules.length} files which is more than the max of ${MAX_MODULE_COUNT}.`,
    );
  }

  if (directories.length > MAX_DIRECTORY_COUNT) {
    throw new Error(
      `This project is too big, it contains ${directories.length} directories which is more than the max of ${MAX_DIRECTORY_COUNT}.`,
    );
  }

  // Show warnings for all errors
  const acceptWarnings = await showWarnings(resolvedPath, errors);
  if (!acceptWarnings) {
    return;
  }

  info(
    'By deploying to CodeSandbox, the code of your project will be made ' +
      chalk.bold('public'),
  );
  const acceptPublic = await confirm(
    'Are you sure you want to proceed with the deployment?',
    true,
  );
  if (!acceptPublic) {
    return;
  }

  const spinner = ora('Uploading to CodeSandbox').start();

  try {
    const sandbox = await uploadSandbox(
      modules,
      directories,
      externalResources,
      dependencies,
    );
    spinner.stop();

    success('Succesfully created the sandbox, you can find the sandbox here:');
    success(createSandboxUrl(sandbox));
  } catch (e) {
    spinner.stop();

    error('Something went wrong while uploading to the API');
    error(e.message);
  }
}
