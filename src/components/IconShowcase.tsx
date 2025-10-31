import { useState, useMemo } from 'react';
import metadata from './icons/metadata.json';
import IconCard from './IconCard';
import IconControls from './IconControls';
import './IconShowcase.css';

interface IconData {
  name: string;
  originalName: string;
  variant: string;
  category: string;
  supportsStrokeWidth: boolean;
  defaultStrokeWidth: number;
  fillType: string;
}

interface VariantConfig {
  name: string;
  directory: string;
  description: string;
  defaultStrokeWidth: number;
  supportsStrokeWidth: boolean;
  fillType: string;
}

interface CategoryData {
  label: string;
  keywords: string[];
}

interface MetadataType {
  icons: IconData[];
  variants: VariantConfig[];
  categories: Record<string, CategoryData>;
  defaultSettings: {
    size: number;
    color: string;
    strokeWidth: number;
  };
  stats: {
    total: number;
    byVariant: Record<string, number>;
    byCategory: Record<string, number>;
  };
}

const IconShowcase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [size, setSize] = useState(24);
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(1.5);

  const typedMetadata = metadata as MetadataType;

  const filteredIcons = useMemo(() => {
    let icons = typedMetadata.icons;

    if (searchTerm) {
      icons = icons.filter((icon) =>
        icon.originalName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedVariant !== 'all') {
      icons = icons.filter((icon) => icon.variant === selectedVariant);
    }

    if (selectedCategory !== 'all') {
      icons = icons.filter((icon) => icon.category === selectedCategory);
    }

    return icons;
  }, [searchTerm, selectedVariant, selectedCategory, typedMetadata.icons]);

  const variants = typedMetadata.variants.map((v) => v.name);
  const categories = Object.entries(typedMetadata.categories).map(([key, value]) => ({
    key,
    label: value.label
  }));

  return (
    <div className="icon-showcase">
      <header className="showcase-header">
        <h1>Icon Library</h1>
        <p className="subtitle">
          {typedMetadata.stats.total} icons across {variants.length} variants
        </p>
      </header>

      <IconControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedVariant={selectedVariant}
        onVariantChange={setSelectedVariant}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        size={size}
        onSizeChange={setSize}
        color={color}
        onColorChange={setColor}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={setStrokeWidth}
        variants={variants}
        categories={categories}
      />

      <div className="showcase-stats">
        <div className="stat">
          <span className="stat-value">{filteredIcons.length}</span>
          <span className="stat-label">icons shown</span>
        </div>
        {Object.entries(typedMetadata.stats.byVariant).map(([variant, count]) => (
          <div key={variant} className="stat">
            <span className="stat-value">{count}</span>
            <span className="stat-label">{variant}</span>
          </div>
        ))}
      </div>

      <div className="icons-grid">
        {filteredIcons.map((icon) => (
          <IconCard
            key={`${icon.variant}-${icon.name}`}
            icon={icon}
            size={size}
            color={color}
            strokeWidth={strokeWidth}
          />
        ))}
      </div>

      {filteredIcons.length === 0 && (
        <div className="no-results">
          <p>No icons found matching your criteria</p>
          <button onClick={() => {
            setSearchTerm('');
            setSelectedVariant('all');
            setSelectedCategory('all');
          }}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default IconShowcase;
