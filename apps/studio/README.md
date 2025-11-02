# Magic Icons Studio

A production-ready web application for creating and managing your icon library.

## Features

### 🎨 Complete Workflow
1. **Variant Selection** - Choose or create icon style variants (lines, filled, etc.)
2. **Category Management** - Select existing categories or create new ones
3. **Icon Upload** - Upload single or multiple SVG files
4. **Metadata Editor** - Edit icon metadata with live preview
5. **Build & Generate** - Generate React components with one click

### ✨ Key Capabilities

- **Multi-file Upload** - Upload multiple SVG icons at once
- **SVG Sanitization** - Automatically sanitizes SVGs for the lines variant
- **Live Preview** - See your icons rendered in real-time
- **Metadata Management** - Edit names, descriptions, tags, and aliases
- **Category System** - Organize icons into categories
- **Variant System** - Support multiple icon styles
- **Build Integration** - Generate React components directly from the UI

## Getting Started

### Start the Studio

```bash
# From the root of the monorepo
bun run dev:studio

# Or from the studio directory
cd apps/studio
bun run dev
```

The studio will be available at `http://localhost:3000`

## Workflow

### Step 1: Select Variant

Choose an existing variant or create a new one:
- **Lines** - Clean line-based icons with stroke
- **Filled** - Solid filled icons
- **Outline** - Outlined icons
- *Create custom variants as needed*

### Step 2: Select Category

Choose a category for your icons or create a new one:
- Categories help organize your icon library
- Each category can have a title, description, and icon
- After creating a category, you'll automatically proceed to upload

### Step 3: Upload & Edit

1. **Upload Icons**
   - Click the upload area or drag and drop SVG files
   - Upload single or multiple files at once
   - Icons are automatically sanitized for the selected variant

2. **Edit Metadata**
   - Select an icon from the list
   - View live preview
   - Edit:
     - Icon name
     - Description
     - Tags (for search)
     - Aliases (alternative names)
     - Stroke width
     - Deprecated status

3. **Save & Build**
   - Save metadata for each icon
   - Click "Build Icons" to generate React components
   - Components are generated in `packages/react/icons/`

## SVG Sanitization

For the **lines** variant, SVGs are automatically sanitized to ensure consistency:

### Standard Format
```svg
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="..." />
</svg>
```

### Sanitization Process
- Normalizes SVG attributes
- Sets standard dimensions (24x24)
- Removes inline fills and strokes from paths
- Ensures consistent stroke properties
- Cleans up whitespace

## API Endpoints

### Variants
- `GET /api/variants` - List all variants
- `POST /api/variants` - Create new variant

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create new category

### Icons
- `POST /api/icons/upload` - Upload icon files
- `GET /api/icons/preview?path=...` - Preview icon/metadata
- `PUT /api/icons/metadata` - Update icon metadata
- `POST /api/build` - Build React components

## File Structure

```
apps/studio/
├── app/
│   ├── components/
│   │   ├── VariantSelector.tsx    # Step 1: Variant selection
│   │   ├── CategorySelector.tsx   # Step 2: Category selection
│   │   └── IconUploader.tsx       # Step 3: Upload & edit
│   ├── api/
│   │   ├── variants/              # Variant management
│   │   ├── categories/            # Category management
│   │   ├── icons/                 # Icon operations
│   │   └── build/                 # Build process
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main page with workflow
└── package.json
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Runtime**: Bun

## Development

### Adding New Features

1. **New Variant Type**: Create variant config in `icons/{variant-name}/variant.json`
2. **New Category**: Use the UI or create JSON in `categories/{category-name}.json`
3. **Custom Sanitization**: Modify `app/api/icons/upload/route.ts`

### Customization

- **Styles**: Edit `app/globals.css` for theme colors
- **Workflow**: Modify `app/page.tsx` to change the step flow
- **Components**: Update individual components in `app/components/`

## Production Deployment

1. Build the application:
   ```bash
   bun run build
   ```

2. Start production server:
   ```bash
   bun run start
   ```

3. Or deploy to Vercel/Netlify for automatic builds

## Tips

- **Batch Upload**: Upload multiple icons at once to save time
- **Naming**: Use kebab-case for icon names (e.g., `arrow-left`)
- **Tags**: Add relevant tags for better searchability
- **Aliases**: Add common alternative names
- **Build Often**: Build after uploading batches to test components

## Troubleshooting

### Icons not appearing
- Check that SVG files are valid
- Ensure metadata files exist alongside SVGs
- Verify variant and category are correct

### Build fails
- Check console for errors
- Ensure all metadata is valid JSON
- Verify icon names are unique

### Upload fails
- Check file format (must be .svg)
- Ensure variant and category exist
- Check file permissions

## Support

For issues or questions:
1. Check the main README at the root of the monorepo
2. Review the structure documentation in `README-STRUCTURE.md`
3. Check API responses in browser DevTools
