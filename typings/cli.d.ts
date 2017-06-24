interface IUser {
  avatar_url: string;
  email: string;
  id: string;
  name: string;
  username: string;
  jwt: string;
}

interface ISandboxDirectory {
  shortid: string;
  title: string;
  directory_shortid: string | undefined;
}

interface ISandboxModule {
  shortid: string;
  title: string;
  code: string;
  directory_shortid: string | undefined;
}
