import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils.js';

const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov', 'm4v', 'avi', 'mkv']);

function parseSliderContent(sliderContent) {
  if (Array.isArray(sliderContent)) return sliderContent;
  if (typeof sliderContent !== 'string' || !sliderContent.trim()) return [];

  try {
    const parsed = JSON.parse(sliderContent);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error parsing campaign slider_content:', error);
    return [];
  }
}

function getMediaUrl(item) {
  if (typeof item === 'string') return item;
  if (!item || typeof item !== 'object') return '';

  return (
    item.url ||
    item.src ||
    item.image_url ||
    item.imageUrl ||
    item.video_url ||
    item.videoUrl ||
    item.file ||
    item.path ||
    ''
  );
}

function getMediaExtension(url) {
  if (typeof url !== 'string') return '';

  const cleanUrl = url.split('?')[0].split('#')[0];
  return cleanUrl.includes('.') ? cleanUrl.split('.').pop().toLowerCase() : '';
}

function isVideoMedia(item, url) {
  const explicitType = typeof item === 'object' && item ? String(item.type || item.mime_type || item.mimeType || '') : '';
  return explicitType.toLowerCase().includes('video') || VIDEO_EXTENSIONS.has(getMediaExtension(url));
}

function normalizeSlides(sliderContent, fallbackImageUrl) {
  const sliderItems = parseSliderContent(sliderContent)
    .map((item) => {
      const url = getMediaUrl(item);
      if (!url) return null;

      return {
        url,
        isVideo: isVideoMedia(item, url),
      };
    })
    .filter(Boolean);

  if (sliderItems.length > 0) return sliderItems;

  return fallbackImageUrl ? [{ url: fallbackImageUrl, isVideo: false }] : [];
}

export default function CampaignGallery({ imageUrl, altText, sliderContent }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const slides = useMemo(() => normalizeSlides(sliderContent, imageUrl), [sliderContent, imageUrl]);
  const hasMultipleSlides = slides.length > 1;
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === slides.length - 1;

  // Minimum distance to register a swipe
  const minSwipeDistance = 50;

  // Touch Handlers for Mobile
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) setCurrentSlide((slide) => Math.min(slide + 1, slides.length - 1));
    if (isRightSwipe) setCurrentSlide((slide) => Math.max(slide - 1, 0));
  };

  // Mouse Handlers for Desktop Swiping
  const onMouseDown = (e) => {
    setTouchEnd(null);
    setTouchStart(e.clientX);
  };

  const onMouseMove = (e) => {
    if (touchStart !== null) {
      setTouchEnd(e.clientX);
    }
  };

  const onMouseUp = () => {
    onTouchEndHandler();
    setTouchStart(null);
    setTouchEnd(null);
  };

  const goToPreviousSlide = () => {
    setCurrentSlide((slide) => Math.max(slide - 1, 0));
  };

  const goToNextSlide = () => {
    setCurrentSlide((slide) => Math.min(slide + 1, slides.length - 1));
  };

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-sm border border-border/50 bg-muted group">
      <div
        className="flex transition-transform duration-500 ease-out h-[300px] sm:h-[400px] cursor-grab active:cursor-grabbing"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEndHandler}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {slides.map((slide, index) => (
          <div key={`${slide.url}-${index}`} className="min-w-full h-full flex-shrink-0 relative select-none">
            {slide.isVideo ? (
              <video
                src={slide.url}
                className="w-full h-full object-cover pointer-events-none"
                preload="metadata"
                muted
                playsInline
                draggable="false"
              />
            ) : (
              <img
                src={slide.url}
                alt={`${altText} - Photo ${index + 1}`}
                className="w-full h-full object-cover img-enhanced pointer-events-none"
                draggable="false"
              />
            )}

            {slide.isVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white shadow-xl">
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1.5" fill="currentColor" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {hasMultipleSlides && (
        <>
          <button
            type="button"
            onClick={goToPreviousSlide}
            disabled={isFirstSlide}
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 backdrop-blur-sm text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-black/75 disabled:opacity-35 disabled:cursor-not-allowed sm:left-4 sm:w-11 sm:h-11",
              !isFirstSlide && "hover:scale-105"
            )}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={goToNextSlide}
            disabled={isLastSlide}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 backdrop-blur-sm text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-black/75 disabled:opacity-35 disabled:cursor-not-allowed sm:right-4 sm:w-11 sm:h-11",
              !isLastSlide && "hover:scale-105"
            )}
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {hasMultipleSlides && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-none">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-2.5 rounded-full transition-all duration-300 pointer-events-auto shadow-sm",
                currentSlide === index
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/80 w-2.5"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
