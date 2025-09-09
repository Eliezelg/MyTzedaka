'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface Block {
  id: string;
  type: string;
  content: any;
}

interface DynamicPageRendererProps {
  content: {
    blocks: Block[];
  };
  tenant: any;
}

export default function DynamicPageRenderer({ content, tenant }: DynamicPageRendererProps) {
  if (!content?.blocks) {
    return <div>Aucun contenu disponible</div>;
  }

  const renderBlock = (block: Block) => {
    switch (block.type) {
      case 'hero':
        return (
          <section key={block.id} className="relative bg-gradient-to-b from-blue-50 to-white py-20">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                {block.content.title || `Bienvenue chez ${tenant.name}`}
              </h1>
              {block.content.subtitle && (
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  {block.content.subtitle}
                </p>
              )}
              {block.content.buttonText && (
                <Link
                  href={block.content.buttonLink || '/donate'}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-block"
                >
                  {block.content.buttonText}
                </Link>
              )}
            </div>
          </section>
        );

      case 'text':
        return (
          <section key={block.id} className="py-12">
            <div className="container mx-auto px-4">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: block.content.text }}
              />
            </div>
          </section>
        );

      case 'features':
        return (
          <section key={block.id} className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              {block.content.title && (
                <h2 className="text-3xl font-bold text-center mb-12">{block.content.title}</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {block.content.features?.map((feature: any, index: number) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      {getIcon(feature.icon)}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'image':
        return (
          <section key={block.id} className="py-12">
            <div className="container mx-auto px-4">
              <img 
                src={block.content.url || '/api/placeholder/800/400'} 
                alt={block.content.alt || ''} 
                className="w-full rounded-lg shadow-lg"
              />
              {block.content.caption && (
                <p className="text-center text-gray-600 mt-4">{block.content.caption}</p>
              )}
            </div>
          </section>
        );

      case 'cta':
        return (
          <section key={block.id} className="bg-blue-600 text-white py-16">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-4">{block.content.title}</h2>
              <p className="text-xl mb-8">{block.content.description}</p>
              <Link
                href={block.content.buttonLink || '/donate'}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
              >
                {block.content.buttonText || 'En savoir plus'}
              </Link>
            </div>
          </section>
        );

      case 'cards':
        return (
          <section key={block.id} className="py-16">
            <div className="container mx-auto px-4">
              {block.content.title && (
                <h2 className="text-3xl font-bold text-center mb-12">{block.content.title}</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {block.content.cards?.map((card: any, index: number) => (
                  <Card key={index} className="p-6">
                    <h3 className="text-xl font-semibold mb-3">{card.title}</h3>
                    <p className="text-gray-600 mb-4">{card.description}</p>
                    {card.link && (
                      <Link href={card.link} className="text-blue-600 hover:underline">
                        En savoir plus →
                      </Link>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </section>
        );

      case 'video':
        return (
          <section key={block.id} className="py-12">
            <div className="container mx-auto px-4">
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={block.content.url}
                  title={block.content.title || 'Video'}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-lg"
                />
              </div>
            </div>
          </section>
        );

      case 'list':
        return (
          <section key={block.id} className="py-12">
            <div className="container mx-auto px-4">
              {block.content.title && (
                <h2 className="text-2xl font-bold mb-6">{block.content.title}</h2>
              )}
              <ul className="list-disc list-inside space-y-2">
                {block.content.items?.map((item: string, index: number) => (
                  <li key={index} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  const getIcon = (iconName: string) => {
    const iconClass = "w-8 h-8 text-blue-600";
    switch (iconName) {
      case 'heart':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'book':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'users':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen">
      {content.blocks.map(block => renderBlock(block))}
    </div>
  );
}