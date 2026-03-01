import { useActiveAnnouncements, Announcement } from '@/hooks/useAnnouncements';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

export function AnnouncementsSlider() {
  const { data: announcements } = useActiveAnnouncements();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: document.dir === 'rtl' ? 'rtl' : 'ltr' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  if (!announcements || announcements.length === 0) return null;

  const showNav = announcements.length > 1;

  return (
    <section className="w-full max-w-[1000px] mx-auto px-4">
      <div className="relative">
        <div
          ref={emblaRef}
          className="overflow-hidden rounded-[20px]"
          style={{
            background: 'linear-gradient(135deg, hsl(34 30% 93%), hsl(270 15% 88%))',
            boxShadow: '0 4px 20px -4px hsl(270 10% 70% / 0.2)',
          }}
        >
          <div className="flex">
            {announcements.map((ann) => (
              <AnnouncementSlide key={ann.id} announcement={ann} />
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        {showNav && (
          <>
            <button
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canScrollPrev}
              className="absolute top-1/2 -translate-y-1/2 left-3 w-9 h-9 rounded-full flex items-center justify-center bg-background/60 backdrop-blur-sm text-foreground/70 hover:bg-background/80 hover:text-foreground transition-all disabled:opacity-30"
              aria-label="Previous announcement"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canScrollNext}
              className="absolute top-1/2 -translate-y-1/2 right-3 w-9 h-9 rounded-full flex items-center justify-center bg-background/60 backdrop-blur-sm text-foreground/70 hover:bg-background/80 hover:text-foreground transition-all disabled:opacity-30"
              aria-label="Next announcement"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {showNav && (
          <div className="flex justify-center gap-2 mt-4">
            {announcements.map((_, idx) => (
              <button
                key={idx}
                onClick={() => emblaApi?.scrollTo(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === selectedIndex
                    ? 'bg-foreground/50 w-5'
                    : 'bg-foreground/20 hover:bg-foreground/30'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function AnnouncementSlide({ announcement }: { announcement: Announcement }) {
  const hasImage = !!announcement.image_url;

  return (
    <div className="flex-[0_0_100%] min-w-0" dir="rtl">
      <div className={`p-8 md:p-10 ${hasImage ? 'md:flex md:items-center md:gap-8' : ''}`}>
        {/* Text content */}
        <div className={`flex-1 text-right ${hasImage ? 'md:max-w-[55%]' : 'text-center max-w-2xl mx-auto'}`}>
          <h3
            className="text-xl md:text-2xl font-bold mb-3"
            style={{ fontFamily: 'var(--font-serif)', color: 'hsl(0 0% 30%)' }}
          >
            {announcement.title}
          </h3>
          {announcement.description && (
            <p
              className="text-sm md:text-base leading-relaxed mb-5"
              style={{ color: 'hsl(0 0% 45%)' }}
            >
              {announcement.description}
            </p>
          )}
          {announcement.button_text && announcement.button_link && (
            <a
              href={announcement.button_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, hsl(270 12% 72%), hsl(270 12% 65%))',
                color: 'hsl(0 0% 100%)',
                boxShadow: '0 2px 8px -2px hsl(270 12% 60% / 0.4)',
              }}
            >
              {announcement.button_text}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        {/* Image */}
        {hasImage && (
          <div className="mt-6 md:mt-0 md:flex-1 md:max-w-[40%]">
            <img
              src={announcement.image_url!}
              alt={announcement.title}
              className="w-full h-auto max-h-[250px] object-cover rounded-2xl"
              style={{ boxShadow: '0 4px 16px -4px hsl(270 10% 50% / 0.2)' }}
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  );
}
