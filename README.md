# codesandbox-cli
> Upload your create-react-app templates to codesandbox with a single command 🏖️

[![Build Status](https://travis-ci.org/CompuIves/codesandbox-cli.svg?branch=master)](https://travis-ci.org/CompuIves/codesandbox-cli)

This is the command line interface for [CodeSandbox](https://codesandbox.io), an online editor
tailored for web applications.

## Quickstart

You can install the cli by running

```bash
# Install the cli
npm i -g codesandbox

# Go to your `create-react-app` project
cd <path of your project>

# Deploy your project to CodeSandbox
codesandbox ./
```

## Future features

- Upload public assets to CodeSandbox
- Add more supported templates
- Create a live connection with CodeSandbox using websockets so you can use your local editor

## Current limitations

- You need to be signed in to deploy, this is to prevent abuse
- You can only deploy `create-react-app` templates
- Static file hosting is not supported
  - This means that `public` and binary files cannot be uploaded
