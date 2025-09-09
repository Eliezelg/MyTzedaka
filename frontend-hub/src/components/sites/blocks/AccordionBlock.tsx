'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  title: string;
  content: string;
}

interface AccordionBlockProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: number[];
}

export default function AccordionBlock({
  items,
  allowMultiple = false,
  defaultOpen = [],
}: AccordionBlockProps) {
  const [openItems, setOpenItems] = useState<number[]>(defaultOpen);

  const toggleItem = (index: number) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    } else {
      setOpenItems((prev) =>
        prev.includes(index) ? [] : [index]
      );
    }
  };

  return (
    <div className="space-y-3 my-8">
      {items.map((item, index) => {
        const isOpen = openItems.includes(index);
        
        return (
          <div
            key={index}
            className="border rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">{item.title}</span>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-6 py-4 border-t bg-gray-50">
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}