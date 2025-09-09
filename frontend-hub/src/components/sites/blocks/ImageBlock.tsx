interface ImageBlockProps {
  src: string;
  alt: string;
  caption?: string;
  width?: 'small' | 'medium' | 'large' | 'full';
  alignment?: 'left' | 'center' | 'right';
  rounded?: boolean;
  shadow?: boolean;
}

export default function ImageBlock({
  src,
  alt,
  caption,
  width = 'large',
  alignment = 'center',
  rounded = true,
  shadow = true,
}: ImageBlockProps) {
  const widthClasses = {
    small: 'max-w-sm',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    full: 'w-full',
  };

  const alignmentClasses = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto',
  };

  return (
    <figure className={`py-8 ${widthClasses[width]} ${alignmentClasses[alignment]}`}>
      <img
        src={src}
        alt={alt}
        className={`
          w-full h-auto
          ${rounded ? 'rounded-lg' : ''}
          ${shadow ? 'shadow-xl' : ''}
        `}
      />
      {caption && (
        <figcaption className="mt-3 text-sm text-center text-gray-600">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}