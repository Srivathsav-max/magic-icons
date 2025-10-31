# Magic Icons Studio

A web-based management interface for the Magic Icons library. This studio allows you to upload SVG icons, create and edit metadata, and manage your icon library without manually editing files.

## Features

- **Upload SVG Icons**: Upload SVG files directly through the UI with category and variant selection
- **Create Metadata**: Generate metadata entries for new icons with all required fields
- **Edit Metadata**: Update existing icon metadata including names, descriptions, tags, and accessibility properties
- **Icon Library Browser**: Search and filter icons by category, view all existing icons
- **Real-time Updates**: Changes are immediately reflected in the icon library

## Getting Started

Run the development server from the studio directory:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the studio.

## Usage

### Upload Icon

1. Select the "Upload Icon" tab
2. Enter the icon ID in kebab-case (e.g., `arrow-up`)
3. Choose the category (action, navigation, etc.)
4. Select the variant (outline, bulk, broken, light, twoTone)
5. Upload the SVG file
6. Click "Upload Icon"

### Create Metadata

1. Select the "Create Metadata" tab
2. Fill in the icon details:
   - Icon ID (kebab-case)
   - Display Name
   - Category
   - Description (optional)
   - Tags (comma-separated)
   - Author
3. Click "Create Metadata"

### Edit Metadata

1. Browse icons in the Icon Library panel
2. Click on an icon to select it
3. The "Edit Metadata" tab will open automatically
4. Update any fields as needed
5. Click "Save Metadata"

## API Routes

The studio includes the following API endpoints:

- `GET /api/icons` - List all icons (optional `?category=` filter)
- `POST /api/icons` - Upload new SVG icon
- `GET /api/metadata?iconId=` - Get metadata for specific icon
- `POST /api/metadata` - Create new metadata
- `PUT /api/metadata` - Update existing metadata
- `DELETE /api/metadata?iconId=` - Delete metadata
- `GET /api/categories` - Get all available categories

## File Structure

```
apps/studio/
├── app/
│   ├── api/
│   │   ├── icons/route.ts       # Icon upload and listing
│   │   ├── metadata/route.ts    # Metadata CRUD operations
│   │   └── categories/route.ts  # Category information
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Main studio interface
├── components/
│   ├── icon-upload.tsx          # Icon upload form
│   ├── metadata-creator.tsx     # Metadata creation form
│   ├── metadata-editor.tsx      # Metadata editing interface
│   └── icon-list.tsx            # Icon library browser
└── package.json
```

## Development Notes

- SVG files are saved to `packages/react/icons/{category}/`
- Metadata files are saved to `packages/react/metadata/icons/`
- All metadata follows the schema defined in `packages/react/icon-metadata-schema.json`
- Icon IDs must be in kebab-case format
- After uploading icons, run the generation script to create React components
