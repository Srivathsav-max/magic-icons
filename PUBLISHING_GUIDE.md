# Publishing Guide for Magic Icons

This guide will help you build, test, and publish the **magic-icons** package to npm.

## 📋 Prerequisites

1. **npm account**: Create one at [npmjs.com](https://www.npmjs.com/signup)
2. **npm login**: Run `npm login` and enter your credentials
3. **Package name availability**: Check if `magic-icons` is available on npm

## 🔨 Building the Package

### Step 1: Generate Icons

First, generate React components from the SVG files:

```bash
npm run build:icons
```

This will:
- Read all SVG files from `icons/Regular/`
- Generate TypeScript React components in `src/components/icons/`
- Create metadata for the showcase

### Step 2: Build the Library

Build the distributable package:

```bash
npm run build:lib
```

This will:
- Generate icon components (if not already done)
- Compile TypeScript to JavaScript
- Create type definitions (.d.ts files)
- Generate index files
- Output everything to the `dist/` folder

### Step 3: Verify the Build

Check the `dist/` folder to ensure it contains:

```
dist/
├── index.js          # Main entry point
├── index.d.ts        # Type definitions
├── index.cjs         # CommonJS version
├── Outline/          # Outline variant icons
│   ├── HomeOutline.js
│   ├── HomeOutline.d.ts
│   └── ...
├── Bulk/             # Bulk variant icons
├── Broken/           # Broken variant icons
├── Light/            # Light variant icons
└── TwoTone/          # TwoTone variant icons
```

## 🧪 Testing Locally

### Method 1: npm link

Test the package in another project without publishing:

```bash
# In the magic-icons directory
npm link

# In your test project
npm link magic-icons
```

Then in your test project:

```tsx
import { HomeOutline } from 'magic-icons';

function App() {
  return <HomeOutline size={24} />;
}
```

### Method 2: Local Install

Install directly from the local directory:

```bash
# In your test project
npm install /path/to/icons
```

### Method 3: Pack and Install

Create a tarball and install it:

```bash
# In the magic-icons directory
npm pack

# This creates magic-icons-1.0.0.tgz
# In your test project
npm install /path/to/magic-icons-1.0.0.tgz
```

## 📦 Publishing to npm

### First Time Publishing

1. **Update package.json**:
   - Set your name in the `author` field
   - Update repository URLs to your GitHub repo
   - Verify the version number

2. **Check what will be published**:
   ```bash
   npm pack --dry-run
   ```

3. **Publish the package**:
   ```bash
   npm publish
   ```

   If the package name is already taken, you can publish under a scope:
   ```bash
   # Update package.json name to "@yourname/magic-icons"
   npm publish --access public
   ```

### Publishing Updates

1. **Update the version**:
   ```bash
   # Patch version (1.0.0 -> 1.0.1)
   npm version patch

   # Minor version (1.0.0 -> 1.1.0)
   npm version minor

   # Major version (1.0.0 -> 2.0.0)
   npm version major
   ```

2. **Build and publish**:
   ```bash
   npm run build:lib
   npm publish
   ```

## 📝 Pre-publish Checklist

Before publishing, make sure:

- [ ] All icons are generated (`npm run build:icons`)
- [ ] Library is built (`npm run build:lib`)
- [ ] Package builds without errors
- [ ] `dist/` folder contains all necessary files
- [ ] README.md is complete and accurate
- [ ] LICENSE file exists
- [ ] Version number is correct in package.json
- [ ] Repository URL is updated in package.json
- [ ] Author information is updated
- [ ] Test the package locally (`npm link` or `npm pack`)
- [ ] No sensitive files in dist (check .npmignore)

## 🚀 Post-publish

After publishing:

1. **Verify on npm**:
   - Visit https://www.npmjs.com/package/magic-icons
   - Check that all files are present
   - Verify README displays correctly

2. **Test installation**:
   ```bash
   npm install magic-icons
   ```

3. **Create a GitHub release**:
   - Tag the version: `git tag v1.0.0`
   - Push the tag: `git push origin v1.0.0`
   - Create a release on GitHub

## 🔄 Automated Publishing (Optional)

Set up GitHub Actions for automatic publishing:

1. Add npm token to GitHub Secrets:
   - Get token: `npm token create`
   - Add to GitHub repo secrets as `NPM_TOKEN`

2. Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build:lib
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 📊 Package Stats

After publishing, you can:

- **View downloads**: https://www.npmjs.com/package/magic-icons
- **Track bundle size**: https://bundlephobia.com/package/magic-icons
- **Check types**: https://www.npmjs.com/package/magic-icons?activeTab=code

## 🐛 Troubleshooting

### "You do not have permission to publish"

- Make sure you're logged in: `npm whoami`
- Check package name availability on npm
- Use a scoped package: `@yourname/magic-icons`

### "Cannot publish over existing version"

- Update version: `npm version patch`
- Or publish with a new version: `npm publish --tag beta`

### Package size is too large

- Check .npmignore is configured correctly
- Run `npm pack --dry-run` to see what's included
- Ensure source files and examples are excluded

### Missing files in published package

- Check the `files` array in package.json
- Verify .npmignore doesn't exclude necessary files
- Use `npm pack` to preview the package

## 📚 Resources

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [npm CLI Documentation](https://docs.npmjs.com/cli/)

---

Good luck with your package! 🎉
