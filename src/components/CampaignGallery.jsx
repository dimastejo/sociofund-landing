import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils.js';

export default function CampaignGallery({ imageUrl, altText }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

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

    if (isLeftSwipe && currentSlide === 0) setCurrentSlide(1);
    if (isRightSwipe && currentSlide === 1) setCurrentSlide(0);
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
        {/* Slide 1: Enhanced Image */}
        <div className="min-w-full h-full flex-shrink-0 relative select-none">
          <img 
            src={imageUrl} 
            alt={`${altText} - Photo 1`} 
            className="w-full h-full object-cover img-enhanced pointer-events-none" 
            draggable="false"
          />
        </div>
        
        {/* Slide 2: Video Placeholder (Enhanced Image + Play Button Overlay) */}
        <div className="min-w-full h-full flex-shrink-0 relative select-none">
          <img 
            src={imageUrl} 
            alt={`${altText} - Video`} 
            className="w-full h-full object-cover img-enhanced pointer-events-none" 
            draggable="false"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
            <button 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white shadow-xl transition-all duration-300 hover:scale-110 hover:bg-black/80 pointer-events-auto"
              aria-label="Play video"
              onClick={() => console.log('Play video clicked')}
            >
              <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1.5" fill="currentColor" />
            </button>
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-none">
        {[0, 1].map((index) => (
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
    </div>
  );
}