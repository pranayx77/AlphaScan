'use client';

import Image from 'next/image';

interface CoinImageProps {
  src: string;
  alt: string;
}

export default function CoinImage({ src, alt }: CoinImageProps) {
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-700">
      <Image
        src={src}
        alt={alt}
        width={40}
        height={40}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
