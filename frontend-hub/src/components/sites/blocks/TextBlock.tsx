interface TextBlockProps {
  content: string;
  columns?: 1 | 2 | 3;
  className?: string;
  format?: 'html' | 'markdown' | 'plain';
}

export default function TextBlock({ 
  content, 
  columns = 1,
  className = '',
  format = 'html'
}: TextBlockProps) {
  const columnClasses = {
    1: '',
    2: 'md:columns-2 gap-8',
    3: 'md:columns-3 gap-8',
  };

  const renderContent = () => {
    switch (format) {
      case 'html':
        return (
          <div 
            className={`prose prose-lg max-w-none ${columnClasses[columns]} ${className}`}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        );
      case 'markdown':
        // TODO: Add markdown processor
        return (
          <div className={`prose prose-lg max-w-none ${columnClasses[columns]} ${className}`}>
            {content}
          </div>
        );
      case 'plain':
      default:
        return (
          <div className={`text-lg leading-relaxed ${columnClasses[columns]} ${className}`}>
            {content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="py-8">
      {renderContent()}
    </div>
  );
}