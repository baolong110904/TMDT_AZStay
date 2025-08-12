'use client';

import React from 'react';
import image1 from '@/assets/card1.jpg';
import image2 from '@/assets/card2.jpg';
import image3 from '@/assets/card3.jpg';
import image4 from '@/assets/card4.jpg';
import Image from 'next/image';

const cards = [
  { src: image1, alt: 'Outdoor getaways', label: 'Outdoor getaways' },
  { src: image2, alt: 'Unique stays', label: 'Unique stays' },
  { src: image3, alt: 'Entire homes', label: 'Entire homes' },
  { src: image4, alt: 'Pet allowed', label: 'Pet allowed' },
];

const MediumCard: React.FC = () => {
  return (
    <div className="w-full px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="cursor-pointer hover:scale-105 transition-transform duration-300 ease-out flex flex-col items-center"
          >
            <Image
              src={card.src}
              alt={card.alt}
              className="rounded-xl"
              width={300}
              height={300}
              style={{ width: '100%', height: 'auto' }}
            />
            <p className="text-lg mt-2">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediumCard;
