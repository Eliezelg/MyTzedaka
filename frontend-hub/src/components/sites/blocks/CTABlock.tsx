import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CTABlockProps {
  title: string;
  description?: string;
  primaryButton: {
    text: string;
    link: string;
  };
  secondaryButton?: {
    text: string;
    link: string;
  };
  backgroundColor?: string;
  textColor?: string;
  centered?: boolean;
}

export default function CTABlock({
  title,
  description,
  primaryButton,
  secondaryButton,
  backgroundColor = 'bg-primary',
  textColor = 'text-white',
  centered = true,
}: CTABlockProps) {
  return (
    <div className={`${backgroundColor} ${textColor} rounded-xl p-12 my-8`}>
      <div className={`max-w-4xl ${centered ? 'mx-auto text-center' : ''}`}>
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        
        {description && (
          <p className="text-lg mb-8 opacity-90">
            {description}
          </p>
        )}
        
        <div className={`flex flex-col sm:flex-row gap-4 ${centered ? 'justify-center' : ''}`}>
          <Button 
            asChild 
            size="lg"
            variant="secondary"
          >
            <Link href={primaryButton.link} className="group">
              {primaryButton.text}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          
          {secondaryButton && (
            <Button 
              asChild 
              size="lg"
              variant="outline"
              className="bg-transparent border-current hover:bg-white/10"
            >
              <Link href={secondaryButton.link}>
                {secondaryButton.text}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}