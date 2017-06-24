import { homedir } from 'os';

import * as fs from 'fs-extra';
import * as path from 'path';
import ms = require('ms');

const TTL = ms('14d');

interface IConfig {
  [key: string]: any | undefined;
  lastUpdate?: number;
  user?: IUser;
}

const file = process.env.CODESANDBOX_JSON
  ? path.resolve(process.env.CODESANDBOX_JSON)
  : path.resolve(homedir(), '.codesandbox.json');

/**
 * Save config file
 *
 * @param {Object} data data to save
 */
async function save(data: object) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

/**
 * Load and parse config file
 */
export async function read(): Promise<IConfig> {
  let existing: IConfig = {};
  try {
    const fileData = await (fs.readFile(file, 'utf8') as Promise<string>);
    existing = JSON.parse(fileData);
  } catch (err) {
    /* Do nothing */
  }

  if (!existing.user) {
    return {};
  }

  if (!existing.lastUpdate || Date.now() - existing.lastUpdate > TTL) {
    const token = existing.user.jwt;
    // const user = await getUser({ token });

    // if (user) {
    //   // TODO
    //   await save(existing);
    // }
  }

  return existing;
}

// Removes a key from the config and store the result
export async function remove(key: string) {
  const cfg = await read();
  if (key in cfg) {
    delete cfg[key];
  }
  await fs.writeFile(file, JSON.stringify(cfg, null, 2));
}

/**
 * Merge the given data in the current config
 * @param data
 */
export async function merge(data: object) {
  const oldConfig = await read();
  const cfg = { ...oldConfig, ...data };
  await save(cfg);

  return cfg;
}

/**
 * Delete given user from config
 *
 * @export
 */
export function deleteUser() {
  return remove('user');
}

/**
 * Save specific user in state
 *
 * @export
 * @param {User} user
 * @returns
 */
export function saveUser(user: IUser) {
  return merge({ user });
}

/**
 * Gets user from config
 *
 * @export
 * @returns
 */
export async function getUser(): Promise<IUser | undefined> {
  const cfg = await read();
  return cfg.user;
}

export const removeFile = async () => fs.remove(file);
