import React from 'react';

interface LogoProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'full' | 'icon' | 'text';
}

const Logo: React.FC<LogoProps> = ({
  width = 200,
  height = 120,
  className,
  style,
  variant = 'full'
}) => {
  const imgStyle = {
    display: 'block',
    maxWidth: '100%',
    height: 'auto',
    ...style
  };

  // For all variants, use the same logo.png file
  return (
    <img
      src="/logo.png"
      alt="DBDocs Logo"
      width={width}
      height={height}
      className={className}
      style={imgStyle}
    />
  );
};

export default Logo; 