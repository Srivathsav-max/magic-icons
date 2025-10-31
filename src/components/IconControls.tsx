import './IconControls.css';

interface IconControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedVariant: string;
  onVariantChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  size: number;
  onSizeChange: (value: number) => void;
  color: string;
  onColorChange: (value: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (value: number) => void;
  variants: string[];
  categories: Array<{ key: string; label: string }>;
}

const IconControls = ({
  searchTerm,
  onSearchChange,
  selectedVariant,
  onVariantChange,
  selectedCategory,
  onCategoryChange,
  size,
  onSizeChange,
  color,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  variants,
  categories,
}: IconControlsProps) => {
  return (
    <div className="icon-controls">
      <div className="controls-section">
        <h3>Search & Filter</h3>
        <div className="control-group">
          <input
            type="text"
            placeholder="Search icons..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="control-row">
          <div className="control-group">
            <label>Variant</label>
            <select
              value={selectedVariant}
              onChange={(e) => onVariantChange(e.target.value)}
              className="select-input"
            >
              <option value="all">All Variants</option>
              {variants.map((variant) => (
                <option key={variant} value={variant}>
                  {variant}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="select-input"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.key} value={category.key}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="controls-section">
        <h3>Customize</h3>
        <div className="control-row">
          <div className="control-group">
            <label>
              Size: <span className="value">{size}px</span>
            </label>
            <input
              type="range"
              min="16"
              max="64"
              value={size}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              className="range-input"
            />
          </div>

          <div className="control-group">
            <label>
              Color: <span className="value">{color}</span>
            </label>
            <div className="color-input-wrapper">
              <input
                type="color"
                value={color}
                onChange={(e) => onColorChange(e.target.value)}
                className="color-input"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => onColorChange(e.target.value)}
                className="color-text-input"
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="control-group">
            <label>
              Stroke Width: <span className="value">{strokeWidth}</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.1"
              value={strokeWidth}
              onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
              className="range-input"
            />
            <small className="help-text">
              (Only applies to Outline, Broken, Light, and TwoTone variants)
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconControls;
