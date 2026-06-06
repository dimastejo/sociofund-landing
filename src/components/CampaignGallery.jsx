import React, { useEffect, useMemo, useRef, useState } from 'react';
import NextImage from 'next/image';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog.jsx';
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

function getOptimizedImageUrl(imageUrl, width = 1200, quality = 75) {
  if (!imageUrl || imageUrl.startsWith('data:')) return imageUrl;

  return `/_next/image?url=${encodeURIComponent(imageUrl)}&w=${width}&q=${quality}`;
}

export default function CampaignGallery({ imageUrl, altText, sliderContent }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fullscreenSlide, setFullscreenSlide] = useState(null);
  const [isMobileFullscreenEnabled, setIsMobileFullscreenEnabled] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [imageRatios, setImageRatios] = useState({});
  const didDragSlide = useRef(false);
  const fullscreenTouchStart = useRef(null);
  const fullscreenTouchEnd = useRef(null);
  const slides = useMemo(() => normalizeSlides(sliderContent, imageUrl), [sliderContent, imageUrl]);
  const hasMultipleSlides = slides.length > 1;
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === slides.length - 1;
  const isFullscreenOpen = isMobileFullscreenEnabled && fullscreenSlide !== null;
  const isFirstFullscreenSlide = fullscreenSlide === 0;
  const isLastFullscreenSlide = fullscreenSlide === slides.length - 1;
  const currentSlideRatio = imageRatios[currentSlide] || 4 / 3;

  useEffect(() => {
    const preloadedImages = slides
      .filter((slide) => !slide.isVideo)
      .map((slide) => {
        const image = new window.Image();
        image.src = getOptimizedImageUrl(slide.url);
        return image;
      });

    return () => {
      preloadedImages.forEach((image) => {
        image.src = '';
      });
    };
  }, [slides]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 639px)');
    const syncMobileFullscreen = () => {
      const isMobile = mediaQuery.matches;
      setIsMobileFullscreenEnabled(isMobile);

      if (!isMobile) {
        setFullscreenSlide(null);
      }
    };

    syncMobileFullscreen();
    mediaQuery.addEventListener('change', syncMobileFullscreen);

    return () => {
      mediaQuery.removeEventListener('change', syncMobileFullscreen);
    };
  }, []);

  useEffect(() => {
    if (!isFullscreenOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'ArrowLeft' && !isFirstFullscreenSlide) {
        goToPreviousFullscreenSlide();
      }

      if (event.key === 'ArrowRight' && !isLastFullscreenSlide) {
        goToNextFullscreenSlide();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isFullscreenOpen, isFirstFullscreenSlide, isLastFullscreenSlide]);

  // Minimum distance to register a swipe
  const minSwipeDistance = 50;

  // Touch Handlers for Mobile
  const onTouchStart = (e) => {
    didDragSlide.current = false;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    const nextTouchEnd = e.targetTouches[0].clientX;
    if (touchStart !== null && Math.abs(touchStart - nextTouchEnd) > 8) {
      didDragSlide.current = true;
    }
    setTouchEnd(nextTouchEnd);
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
    didDragSlide.current = false;
    setTouchEnd(null);
    setTouchStart(e.clientX);
  };

  const onMouseMove = (e) => {
    if (touchStart !== null) {
      if (Math.abs(touchStart - e.clientX) > 8) {
        didDragSlide.current = true;
      }
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

  const openFullscreenSlide = (index) => {
    if (!isMobileFullscreenEnabled) return;

    if (didDragSlide.current) {
      didDragSlide.current = false;
      return;
    }

    setFullscreenSlide(index);
    setCurrentSlide(index);
  };

  const goToPreviousFullscreenSlide = () => {
    setFullscreenSlide((slide) => {
      const previousSlide = Math.max((slide || 0) - 1, 0);
      setCurrentSlide(previousSlide);
      return previousSlide;
    });
  };

  const goToNextFullscreenSlide = () => {
    setFullscreenSlide((slide) => {
      const nextSlide = Math.min((slide || 0) + 1, slides.length - 1);
      setCurrentSlide(nextSlide);
      return nextSlide;
    });
  };

  const goToFullscreenSlide = (index) => {
    setFullscreenSlide(index);
    setCurrentSlide(index);
  };

  const onFullscreenTouchStart = (event) => {
    fullscreenTouchEnd.current = null;
    fullscreenTouchStart.current = event.targetTouches[0].clientX;
  };

  const onFullscreenTouchMove = (event) => {
    fullscreenTouchEnd.current = event.targetTouches[0].clientX;
  };

  const onFullscreenTouchEnd = () => {
    if (fullscreenTouchStart.current === null || fullscreenTouchEnd.current === null) return;

    const distance = fullscreenTouchStart.current - fullscreenTouchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && !isLastFullscreenSlide) {
      goToNextFullscreenSlide();
    }

    if (isRightSwipe && !isFirstFullscreenSlide) {
      goToPreviousFullscreenSlide();
    }

    fullscreenTouchStart.current = null;
    fullscreenTouchEnd.current = null;
  };

  const handleImageLoad = (index, event) => {
    const image = event.currentTarget;
    const naturalRatio = image.naturalWidth && image.naturalHeight
      ? image.naturalWidth / image.naturalHeight
      : null;

    if (!naturalRatio) return;

    setImageRatios((ratios) => {
      if (ratios[index] === naturalRatio) return ratios;

      return {
        ...ratios,
        [index]: naturalRatio,
      };
    });
  };

  if (slides.length === 0) return null;

  return (
    <>
      <div className="relative w-full overflow-hidden rounded-2xl shadow-sm border border-border/50 bg-muted group">
        <div
          className="flex transition-[transform,height] duration-500 ease-out w-full cursor-grab active:cursor-grabbing"
          style={{
            aspectRatio: currentSlideRatio,
            transform: `translateX(-${currentSlide * 100}%)`,
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEndHandler}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {slides.map((slide, index) => (
            <button
              key={`${slide.url}-${index}`}
              type="button"
              className="min-w-full h-full flex-shrink-0 relative select-none cursor-zoom-in sm:cursor-grab"
              onClick={() => openFullscreenSlide(index)}
              tabIndex={isMobileFullscreenEnabled ? 0 : -1}
              aria-label={isMobileFullscreenEnabled ? `Open slide ${index + 1} fullscreen` : `Slide ${index + 1}`}
            >
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
                <NextImage
                  src={slide.url}
                  alt={`${altText} - Photo ${index + 1}`}
                  fill
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  preload={index === 0}
                  loading={index === 0 ? undefined : 'eager'}
                  className="object-contain img-enhanced pointer-events-none"
                  onLoad={(event) => handleImageLoad(index, event)}
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
            </button>
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

      <Dialog open={isFullscreenOpen} onOpenChange={(open) => !open && setFullscreenSlide(null)}>
        <DialogContent className="h-dvh max-h-dvh w-screen max-w-none border-0 bg-black/20 p-0 text-white shadow-none sm:h-[calc(100dvh-4rem)] sm:max-h-[calc(100dvh-4rem)] sm:w-[calc(100vw-4rem)] sm:rounded-xl [&>button]:bg-black/35 [&>button]:text-white [&>button]:opacity-100 [&>button]:hover:bg-black/55">
          <DialogTitle className="sr-only">{altText || 'Campaign gallery'}</DialogTitle>
          <DialogDescription className="sr-only">
            Fullscreen campaign media gallery
          </DialogDescription>

          {isFullscreenOpen && (
            <div
              className="relative flex h-full w-full touch-pan-y items-center justify-center"
              onTouchStart={onFullscreenTouchStart}
              onTouchMove={onFullscreenTouchMove}
              onTouchEnd={onFullscreenTouchEnd}
            >
              {slides[fullscreenSlide].isVideo ? (
                <video
                  src={slides[fullscreenSlide].url}
                  className="max-h-full w-full object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <div className="relative h-full w-full">
                  <NextImage
                    src={slides[fullscreenSlide].url}
                    alt={`${altText} - Photo ${fullscreenSlide + 1}`}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    draggable="false"
                  />
                </div>
              )}

              {hasMultipleSlides && (
                <>
                  <button
                    type="button"
                    onClick={goToPreviousFullscreenSlide}
                    disabled={isFirstFullscreenSlide}
                    className={cn(
                      "absolute left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-35 sm:left-6 sm:flex sm:h-12 sm:w-12",
                      !isFirstFullscreenSlide && "hover:scale-105"
                    )}
                    aria-label="Previous fullscreen slide"
                  >
                    <ChevronLeft className="h-7 w-7" />
                  </button>

                  <button
                    type="button"
                    onClick={goToNextFullscreenSlide}
                    disabled={isLastFullscreenSlide}
                    className={cn(
                      "absolute right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-35 sm:right-6 sm:flex sm:h-12 sm:w-12",
                      !isLastFullscreenSlide && "hover:scale-105"
                    )}
                    aria-label="Next fullscreen slide"
                  >
                    <ChevronRight className="h-7 w-7" />
                  </button>

                  <div className="absolute bottom-5 left-0 right-0 z-10 flex justify-center gap-2 px-6">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => goToFullscreenSlide(index)}
                        className={cn(
                          "h-2.5 rounded-full transition-all",
                          fullscreenSlide === index ? "w-7 bg-white" : "w-2.5 bg-white/45 hover:bg-white/75"
                        )}
                        aria-label={`Go to fullscreen slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
