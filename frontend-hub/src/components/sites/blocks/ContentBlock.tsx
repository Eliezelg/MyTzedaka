'use client';

import dynamic from 'next/dynamic';

// Import dynamique des blocs pour optimisation
const blocks = {
  hero: dynamic(() => import('./HeroBlock')),
  text: dynamic(() => import('./TextBlock')),
  image: dynamic(() => import('./ImageBlock')),
  video: dynamic(() => import('./VideoBlock')),
  gallery: dynamic(() => import('./GalleryBlock')),
  donation: dynamic(() => import('./DonationBlock')),
  campaign: dynamic(() => import('./CampaignBlock')),
  events: dynamic(() => import('./EventsBlock')),
  accordion: dynamic(() => import('./AccordionBlock')),
  testimonial: dynamic(() => import('./TestimonialBlock')),
  stats: dynamic(() => import('./StatsBlock')),
  team: dynamic(() => import('./TeamBlock')),
  cta: dynamic(() => import('./CTABlock')),
  map: dynamic(() => import('./MapBlock')),
  form: dynamic(() => import('./FormBlock')),
  zmanim: dynamic(() => import('./ZmanimBlock')),
};

interface ContentBlockProps {
  type: string;
  props: Record<string, any>;
  tenantId?: string;
}

export function ContentBlock({ type, props, tenantId }: ContentBlockProps) {
  const BlockComponent = blocks[type as keyof typeof blocks];
  
  if (!BlockComponent) {
    console.warn(`Unknown block type: ${type}`);
    return null;
  }
  
  return <BlockComponent {...props} tenantId={tenantId} />;
}