import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface HeroBlockProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  height?: 'small' | 'medium' | 'large' | 'full';
  primaryButton?: {
    text: string;
    link: string;
    style?: 'default' | 'outline';
  };
  secondaryButton?: {
    text: string;
    link: string;
  };
  alignment?: 'left' | 'center' | 'right';
}

export default function HeroBlock({
  title,
  subtitle,
  backgroundImage,
  backgroundVideo,
  overlay = true,
  overlayOpacity = 50,
  height = 'medium',
  primaryButton,
  secondaryButton,
  alignment = 'center',
}: HeroBlockProps) {
  const heightClasses = {
    small: 'min-h-[300px]',
    medium: 'min-h-[500px]',
    large: 'min-h-[700px]',
    full: 'min-h-screen',
  };

  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  return (
    <section className={`relative ${heightClasses[height]} flex items-center justify-center overflow-hidden`}>
      {/* Background Video */}
      {backgroundVideo && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      )}
      
      {/* Background Image */}
      {backgroundImage && !backgroundVideo && (
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      
      {/* Overlay */}
      {overlay && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity / 100 }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className={`flex flex-col ${alignmentClasses[alignment]} max-w-4xl ${alignment === 'center' ? 'mx-auto' : ''}`}>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {title}
          </h1>
          
          {subtitle && (
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl">
              {subtitle}
            </p>
          )}
          
          {(primaryButton || secondaryButton) && (
            <div className="flex flex-col sm:flex-row gap-4">
              {primaryButton && (
                <Button 
                  asChild 
                  size="lg"
                  variant={primaryButton.style === 'outline' ? 'outline' : 'default'}
                  className={primaryButton.style === 'outline' ? 'bg-white/10 backdrop-blur border-white text-white hover:bg-white/20' : ''}
                >
                  <Link href={primaryButton.link}>
                    {primaryButton.text}
                  </Link>
                </Button>
              )}
              
              {secondaryButton && (
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg"
                  className="bg-white/10 backdrop-blur border-white text-white hover:bg-white/20"
                >
                  <Link href={secondaryButton.link}>
                    {secondaryButton.text}
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}