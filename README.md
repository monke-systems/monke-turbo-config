# turbo-ts-config package

## Package update flow

Package publishing only available via CI jobs.

You must use '-beta' postfix for testing purposes. Otherwise CI job being failed. Bump version via npm

```bash
npm version prerelease --preid beta
```

Before merge changes into master branch you should remove 'beta' postfix

```bash
npm version major | minor | patch
```

Learn more <https://docs.npmjs.com/cli/v8/commands/npm-version>
