import Image from 'next/image';

export function ExternalIcon({ name, alt, className = "w-6 h-6" }: { name: string, alt?: string, className?: string }) {
  // Uses absolute path referencing the assumed public folder mapping, or it could just be used as standard image
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <Image 
        src={`/assets/icons/${name}.svg`} 
        alt={alt || name} 
        fill 
        className="object-contain"
        unoptimized // in case the icons are simple SVGs that shouldn't be optimized
      />
    </div>
  );
}
