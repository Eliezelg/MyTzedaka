import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export function HeroSection({
  title,
  subtitle,
  backgroundImage,
  ctaText = 'Faire un don',
  ctaLink = '/donate',
  secondaryCtaText,
  secondaryCtaLink
}: HeroSectionProps) {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
          {title}
        </h1>
        
        {subtitle && (
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-100">
            {subtitle}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-200">
          <Button asChild size="lg" className="group">
            <Link href={ctaLink}>
              {ctaText}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          
          {secondaryCtaText && secondaryCtaLink && (
            <Button asChild variant="outline" size="lg" className="bg-white/10 backdrop-blur border-white text-white hover:bg-white/20">
              <Link href={secondaryCtaLink}>
                {secondaryCtaText}
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}