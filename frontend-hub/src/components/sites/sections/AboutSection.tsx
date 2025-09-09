import { CheckCircle } from 'lucide-react';

interface AboutSectionProps {
  content?: string;
  image?: string;
  features?: string[];
}

export function AboutSection({ content, image, features }: AboutSectionProps) {
  if (!content) return null;
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-4">À Propos de Notre Mission</h2>
              <div className="prose prose-lg text-gray-600" dangerouslySetInnerHTML={{ __html: content }} />
            </div>
            
            {features && features.length > 0 && (
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Image */}
          {image && (
            <div className="relative">
              <img 
                src={image} 
                alt="À propos" 
                className="rounded-lg shadow-xl w-full h-auto"
              />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-lg -z-10" />
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary/10 rounded-lg -z-10" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}