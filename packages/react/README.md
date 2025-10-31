# Magic Icons ✨

A comprehensive React icon library with **500 customizable icons** across 5 beautiful variants. Built with TypeScript and designed for modern React applications including Next.js.

[![npm version](https://img.shields.io/npm/v/magic-icons.svg)](https://www.npmjs.com/package/magic-icons)
[![npm downloads](https://img.shields.io/npm/dm/magic-icons.svg)](https://www.npmjs.com/package/magic-icons)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎨 **500 Icons**: 100 unique icons × 5 style variants
- 🎯 **5 Variants**: Outline, Bulk, Broken, Light, and TwoTone styles
- ⚡ **Lightweight**: Tree-shakeable, import only what you need
- 🔧 **Customizable**: Size, color, and stroke width props
- 📦 **TypeScript**: Full TypeScript support with type definitions
- ⚛️ **React**: Built for React 17+ and React 18+
- 🚀 **Next.js Ready**: Works seamlessly with Next.js SSR/SSG
- 📱 **Responsive**: SVG-based, perfect for all screen sizes

## 📦 Installation

```bash
npm install magic-icons
# or
yarn add magic-icons
# or
pnpm add magic-icons
# or
bun add magic-icons
```

## 🚀 Quick Start

```tsx
import { HomeOutline, SearchLight, HeartBulk } from 'magic-icons';

function App() {
  return (
    <div>
      <HomeOutline size={24} />
      <SearchLight size={32} color="#2563eb" strokeWidth={2} />
      <HeartBulk size={48} color="#ef4444" />
    </div>
  );
}
```

## 📖 Usage

### Basic Usage

```tsx
import { FolderOutline } from 'magic-icons';

<FolderOutline />
```

### Custom Size

```tsx
import { NotificationBulk } from 'magic-icons';

<NotificationBulk size={32} />
<NotificationBulk size="3rem" />
```

### Custom Color

```tsx
import { HeartBulk } from 'magic-icons';

<HeartBulk color="#ef4444" />
<HeartBulk color="red" />
<HeartBulk className="text-red-500" /> {/* with Tailwind */}
```

### Stroke Width (Light & TwoTone variants only)

```tsx
import { ProfileLight } from 'magic-icons';

<ProfileLight strokeWidth={1.5} />
<ProfileLight strokeWidth={2.5} />
```

### With Tailwind CSS

```tsx
import { SearchLight, StarBulk } from 'magic-icons';

<SearchLight className="text-blue-500 hover:text-blue-700" />
<StarBulk className="w-8 h-8 text-yellow-400" />
```

### Next.js App Router

```tsx
// app/page.tsx
import { HomeBulk, ProfileOutline } from 'magic-icons';

export default function Home() {
  return (
    <main>
      <HomeBulk size={24} />
      <ProfileOutline size={32} color="#3b82f6" />
    </main>
  );
}
```

### Next.js Pages Router

```tsx
// pages/index.tsx
import { CalendarLight, MessageBulk } from 'magic-icons';

export default function Home() {
  return (
    <div>
      <CalendarLight size={24} strokeWidth={1.5} />
      <MessageBulk size={32} />
    </div>
  );
}
```

## 🎨 Icon Variants

### Outline
Outlined icons with filled paths - clean and modern.
```tsx
import { HomeOutline, SearchOutline } from 'magic-icons';
```

### Bulk
Icons with solid fills - bold and impactful.
```tsx
import { HomeBulk, SearchBulk } from 'magic-icons';
```

### Broken
Broken line style - trendy and unique.
```tsx
import { HomeBroken, SearchBroken } from 'magic-icons';
```

### Light
Light stroke icons - delicate and minimal. **Supports strokeWidth prop**.
```tsx
import { HomeLight, SearchLight } from 'magic-icons';

<HomeLight strokeWidth={1} />
<SearchLight strokeWidth={2.5} />
```

### TwoTone
Two-tone style icons - rich and layered. **Supports strokeWidth prop**.
```tsx
import { HomeTwoTone, SearchTwoTone } from 'magic-icons';

<HomeTwoTone strokeWidth={1.5} />
```

## 🔧 Props

All icons accept these props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number \| string` | `24` | Icon width and height |
| `color` | `string` | `'currentColor'` | Icon color (CSS color value) |
| `strokeWidth`* | `number \| string` | Variant default | Stroke width (Light: 1, TwoTone: 1.5) |
| `className` | `string` | - | CSS class name |
| `style` | `CSSProperties` | - | Inline styles |
| `...props` | `SVGProps` | - | Any valid SVG attribute |

*`strokeWidth` is only available for **Light** and **TwoTone** variants.

## 📚 Available Icons

### Categories

- **User & Profile**: TwoUser, ThreeUser, Profile, AddUser
- **Communication**: Message, Chat, Call, Calling, Video, Voice, Send
- **Navigation**: Home, Location, ArrowUp, ArrowDown, ArrowLeft, ArrowRight
- **Media**: Image, Camera, Play, VolumeUp, VolumeDown, VolumeOff
- **Files & Folders**: Folder, Document, Paper, Download, Upload
- **Commerce**: Bag, Buy, Wallet, Ticket, Discount
- **Actions**: Edit, Delete, Plus, Swap, Filter
- **Security**: Lock, Unlock, Password, Shield, Login, Logout
- **UI Elements**: Show, Hide, Search, Setting, Notification, More
- **Data & Analytics**: Chart, Graph, Activity, Scan
- **Status & Indicators**: TickSquare, CloseSquare, Danger, Info, TimeCircle
- **Miscellaneous**: Star, Heart, Bookmark, Calendar, Game, Work

### Naming Convention

Each icon is available in all 5 variants:
- `IconNameOutline`
- `IconNameBulk`
- `IconNameBroken`
- `IconNameLight`
- `IconNameTwoTone`

Example:
```tsx
import {
  HomeOutline,
  HomeBulk,
  HomeBroken,
  HomeLight,
  HomeTwoTone
} from 'magic-icons';
```

## 🌐 Next.js Optimization

Magic Icons works perfectly with Next.js:

```tsx
// No need for 'use client' - icons are automatically optimized
import { SearchLight } from 'magic-icons';

export default function ServerComponent() {
  return <SearchLight size={24} />;
}
```

For client-side interactivity:

```tsx
'use client';

import { useState } from 'react';
import { HeartBulk, HeartOutline } from 'magic-icons';

export default function LikeButton() {
  const [liked, setLiked] = useState(false);

  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? (
        <HeartBulk color="red" size={24} />
      ) : (
        <HeartOutline size={24} />
      )}
    </button>
  );
}
```

## 💡 TypeScript

Full TypeScript support with exported types:

```tsx
import { IconProps, HomeOutline } from 'magic-icons';
import { FC } from 'react';

const CustomIcon: FC<IconProps> = (props) => {
  return <HomeOutline {...props} />;
};

// Or with specific props
interface MyIconProps {
  isActive?: boolean;
}

const MyIcon: FC<MyIconProps> = ({ isActive }) => {
  return (
    <HomeOutline
      size={24}
      color={isActive ? '#3b82f6' : '#6b7280'}
    />
  );
};
```

## 🎭 Examples

### Button with Icon

```tsx
import { ArrowRightBulk } from 'magic-icons';

<button className="flex items-center gap-2">
  Continue
  <ArrowRightBulk size={20} />
</button>
```

### Icon Button

```tsx
import { DeleteBroken } from 'magic-icons';

<button
  onClick={handleDelete}
  className="p-2 hover:bg-red-50 rounded"
>
  <DeleteBroken size={20} color="#ef4444" />
</button>
```

### Navigation Menu

```tsx
import { HomeBulk, SearchBulk, ProfileBulk } from 'magic-icons';

<nav className="flex gap-6">
  <a href="/" className="flex flex-col items-center">
    <HomeBulk size={24} />
    <span>Home</span>
  </a>
  <a href="/search" className="flex flex-col items-center">
    <SearchBulk size={24} />
    <span>Search</span>
  </a>
  <a href="/profile" className="flex flex-col items-center">
    <ProfileBulk size={24} />
    <span>Profile</span>
  </a>
</nav>
```

### With Refs

```tsx
import { useRef } from 'react';
import { SearchLight } from 'magic-icons';

const iconRef = useRef<SVGSVGElement>(null);

<SearchLight ref={iconRef} size={24} />
```

## 📦 Bundle Size

Magic Icons is tree-shakeable, meaning you only bundle the icons you actually import:

```tsx
// ✅ Good - Only HomeOutline is bundled
import { HomeOutline } from 'magic-icons';

// ❌ Avoid - Bundles everything
import * as Icons from 'magic-icons';
```

## 🛠️ Development

This repository includes an interactive Next.js showcase to browse all 500 icons:

```bash
# Install dependencies (root and web app)
npm install
cd apps/web && npm install

# Generate icon components from SVGs and copy to web app
npm run build:icons

# Start Next.js showcase development server
npm run dev

# Build the library for npm
npm run build:lib

# Build the Next.js showcase
npm run build:web

# Start production showcase server
npm run start:web
```

The showcase app is located in `apps/web` and provides:
- 🔍 Search through all 500 icons
- 🎨 Live customization (size, color, stroke width)
- 📋 Copy code snippets for multiple frameworks
- 🏷️ Category filtering
- 🎯 5 variant styles to choose from

## 📄 License

MIT © 2025 Magic Icons

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/magic-icons)
- [GitHub Repository](https://github.com/yourusername/magic-icons)
- [Report Issues](https://github.com/yourusername/magic-icons/issues)

---

**Made with ❤️ using React + TypeScript**
