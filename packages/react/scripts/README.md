# Icon Scripts

This directory contains TypeScript scripts for managing and generating icons in the Magic Icons library.

## Scripts Overview

### 1. `generate-icons.mts`
Generates React components from SVG files and creates metadata for all icons.

**Usage:**
```bash
bun run build:icons
```

**What it does:**
- Converts SVG files to React components
- Creates TypeScript files with proper type definitions
- Generates individual icon metadata JSON files
- Creates category-organized metadata
- Generates index files for easy imports

### 2. `svg-name-updater.mts`
Tool for normalizing SVG file names and organizing them into categories.

### 3. `generate-icon-schemas.mts`
Generates individual JSON schema files for existing SVG icons that don't have them.

### 4. `migrate-to-categories.mts`
Migrates icons from the old `Regular/` folder structure to the new category-based structure.

**Usage:**

**Check what would be renamed (dry run):**
```bash
bun run svg:check
```

**Rename files to normalized format:**
```bash
bun run svg:rename
```

**Sort SVGs into category folders:**
```bash
bun run svg:sort
```

**Do both (rename and sort):**
```bash
bun run svg:organize
```

**Generate schema files for existing SVGs:**
```bash
bun run schemas:generate
```

**Migrate from old structure (dry run):**
```bash
bun run migrate:check
```

**Migrate from old structure (apply changes):**
```bash
bun run migrate:apply
```

**Features:**
- Converts number prefixes to word format (e.g., `2-User.svg` → `two-user.svg`)
- Normalizes naming conventions to lowercase with hyphens (kebab-case)
- Removes spaces and replaces with hyphens (e.g., `Arrow - Up.svg` → `arrow-up.svg`)
- Sorts icons into category folders based on keywords
- Dry-run mode by default (add `--apply` to make actual changes)

## Icon Organization

### Directory Structure

```
packages/react/
├── icons/
│   ├── icon.schema.json     # JSON schema for icon metadata
│   ├── navigation/          # Navigation category
│   │   ├── arrow-up-outline.svg
│   │   ├── arrow-up-outline.json
│   │   ├── arrow-up-bulk.svg
│   │   ├── arrow-up-bulk.json
│   │   └── ...
│   ├── user/                # User category
│   │   ├── profile-outline.svg
│   │   ├── profile-outline.json
│   │   └── ...
│   ├── communication/       # Communication category
│   └── ...                  # Other categories
├── src/
│   └── components/
│       └── icons/           # Generated React components
│           ├── Outline/
│           ├── Bulk/
│           ├── Broken/
│           ├── Light/
│           ├── TwoTone/
│           └── metadata.json
└── metadata/
    └── icons/
        ├── by-category.json    # Category index
        └── *.json             # Individual icon metadata
```

## Schema Files

### `icon-schema.json`
Core schema defining:
- Icon variants (Outline, Bulk, Broken, Light, TwoTone)
- Categories (User, Communication, Navigation, etc.)
- Default settings (size, color, stroke width)
- Naming conventions

### `category-schema.json`
Detailed category definitions with:
- Category metadata (id, label, description)
- Keywords for automatic categorization
- Naming conventions per category
- Visual properties (colors, ordering)

### `icon-metadata-schema.json`
Template for individual icon metadata:
- Icon identification (id, name, aliases)
- Variant availability
- Category and tags
- Usage examples
- Accessibility properties

## Icon Metadata

### Individual Icon Schema Files

Each SVG has a corresponding `.json` file with metadata. Files are organized by category with variant in the filename:

**File**: `icons/navigation/arrow-up-outline.json`
```json
{
  "$schema": "../icon.schema.json",
  "variant": "outline",
  "contributors": [
    "Jaya Raj Srivathsav Adari"
  ],
  "tags": [
    "arrow",
    "up",
    "direction",
    "navigate"
  ],
  "categories": [
    "navigation"
  ],
  "aliases": [],
  "deprecated": false
}
```

### Generated Component Metadata

Each icon also generates a comprehensive metadata file in `metadata/icons/` containing:

```json
{
  "id": "arrow-up",
  "name": "Arrow Up",
  "componentBaseName": "ArrowUp",
  "category": "navigation",
  "tags": ["arrow", "up", "direction", "navigate"],
  "variants": {
    "outline": {
      "available": true,
      "componentName": "ArrowUpOutline",
      "svgPath": "./icons/Regular/Outline/Arrow - Up.svg",
      "componentPath": "./components/icons/Outline/ArrowUpOutline"
    }
  },
  "metadata": {
    "addedDate": "2025-10-31",
    "version": "0.0.2",
    "popularity": 0
  },
  "usage": {
    "codeExample": "import { ArrowUpTwoTone } from 'magic-icons';..."
  },
  "accessibility": {
    "ariaLabel": "arrow up",
    "title": "ArrowUp"
  }
}
```

## Categories

Icons are automatically categorized based on keywords:

1. **User & Profile** - User accounts, profiles, avatars
2. **Communication** - Messages, calls, mail
3. **Navigation & Arrows** - Directional arrows, navigation
4. **Media & Entertainment** - Images, videos, audio controls
5. **Files & Documents** - Files, folders, documents
6. **E-Commerce & Shopping** - Shopping, payments, carts
7. **Actions & Operations** - Edit, delete, add, filter
8. **Security & Authentication** - Lock, password, login
9. **UI Elements** - Search, settings, menus
10. **Data & Analytics** - Charts, graphs, activity
11. **Time & Calendar** - Time, dates, schedules
12. **Location & Maps** - Location, discovery, maps
13. **Status & Indicators** - Alerts, notifications, status
14. **Work & Productivity** - Work, business, productivity
15. **Miscellaneous** - Other icons

## Naming Conventions

### SVG Files
- Use lowercase with hyphens (kebab-case): `arrow-up-outline.svg`
- Include variant in filename: `arrow-up-bulk.svg`, `arrow-up-two-tone.svg`
- Numbers as words: `two-user-outline.svg` not `2-user-outline.svg`
- Descriptive names: `arrow-up-circle-outline.svg` not `arr-up-c-outline.svg`
- No spaces, use hyphens: `arrow-up-outline.svg` not `Arrow Up Outline.svg`
- Organized by category folder: `icons/navigation/arrow-up-outline.svg`

### Component Names
- PascalCase with variant suffix: `ArrowUpTwoTone`
- Numbers as words: `TwoUser` not `2User`
- No special characters: `ArrowUp` not `Arrow-Up`

## Development Workflow

1. **Add new SVG files** to the appropriate category directory in `icons/{category}/`
   - Example: `icons/navigation/arrow-up-outline.svg`
   - Include variant in filename: `-outline`, `-bulk`, `-broken`, `-light`, `-two-tone`

2. **Generate components**:
   ```bash
   bun run build:icons
   ```
   This will:
   - Generate React components in `src/components/icons/`
   - Create JSON schema files for each icon
   - Copy/organize icons by category
   - Generate metadata files

3. **Build library**:
   ```bash
   bun run build
   ```

## Tips

- Always run `svg:check` before `svg:rename` to preview changes
- The scripts preserve original files in `svg:sort` (copies, doesn't move)
- Dry-run mode is enabled by default for safety
- Use descriptive icon names in lowercase kebab-case for better categorization
- Check generated metadata in `metadata/icons/` directory
