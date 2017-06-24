import axios from 'axios';
import * as values from 'lodash.values';

import { getUser } from '../cfg';
import { CREATE_SANDBOX_URL } from './url';

export async function uploadSandbox(
  modules: ISandboxModule[],
  directories: ISandboxDirectory[],
  externalResources: string[],
  dependencies: { [name: string]: string },
) {
  const user = await getUser();

  if (user == null) {
    throw new Error("You're not signed in");
  }

  const sandbox = {
    directories,
    external_resources: externalResources,
    modules,
    npm_dependencies: dependencies,
  };

  const options = {
    data: {
      sandbox,
    },
    headers: {
      Authorization: `Bearer ${user.jwt}`,
    },
    method: 'POST',
    url: CREATE_SANDBOX_URL,
  };

  try {
    const response = await axios(options);
    return response.data.data;
  } catch (e) {
    if (e.response && e.response.data && e.response.data.errors) {
      e.message = values(e.response.data.errors)[0];
    }
    throw e;
  }
}
