import { useState, lazy, Suspense } from 'react';
import './IconCard.css';

interface IconCardProps {
  icon: {
    name: string;
    originalName: string;
    variant: string;
    supportsStrokeWidth: boolean;
  };
  size: number;
  color: string;
  strokeWidth: number;
}

const IconCard = ({ icon, size, color, strokeWidth }: IconCardProps) => {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  // Dynamically import the icon component
  const IconComponent = lazy(() =>
    import(`./icons/${icon.variant}/${icon.name}.tsx`)
  );

  const getImportCode = () => {
    return `import { ${icon.name} } from '@/components/icons';`;
  };

  const getUsageCode = () => {
    const props: string[] = [];

    if (size !== 24) props.push(`size={${size}}`);
    if (color !== 'currentColor' && color !== '#000000') props.push(`color="${color}"`);
    if (icon.supportsStrokeWidth && strokeWidth !== 1.5) {
      props.push(`strokeWidth={${strokeWidth}}`);
    }

    const propsString = props.length > 0 ? ` ${props.join(' ')}` : '';
    return `<${icon.name}${propsString} />`;
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyImport = () => copyCode(getImportCode());
  const copyUsage = () => copyCode(getUsageCode());
  const copyBoth = () => copyCode(`${getImportCode()}\n\n${getUsageCode()}`);

  return (
    <div className="icon-card">
      <div className="icon-preview">
        <Suspense fallback={<div className="icon-loading">Loading...</div>}>
          <IconComponent
            size={size}
            color={color}
            {...(icon.supportsStrokeWidth ? { strokeWidth } : {})}
          />
        </Suspense>
      </div>

      <div className="icon-info">
        <h3 className="icon-name">{icon.originalName}</h3>
        <span className="icon-variant">{icon.variant}</span>
      </div>

      <div className="icon-actions">
        <button
          className="action-btn"
          onClick={() => setShowCode(!showCode)}
          title="View code"
        >
          {showCode ? '✕' : '</>'}
        </button>
        <button
          className={`action-btn ${copied ? 'copied' : ''}`}
          onClick={copyBoth}
          title="Copy code"
        >
          {copied ? '✓' : '📋'}
        </button>
      </div>

      {showCode && (
        <div className="icon-code">
          <div className="code-section">
            <div className="code-header">
              <span>Import</span>
              <button onClick={copyImport} className="copy-btn">Copy</button>
            </div>
            <pre><code>{getImportCode()}</code></pre>
          </div>

          <div className="code-section">
            <div className="code-header">
              <span>Usage</span>
              <button onClick={copyUsage} className="copy-btn">Copy</button>
            </div>
            <pre><code>{getUsageCode()}</code></pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default IconCard;
