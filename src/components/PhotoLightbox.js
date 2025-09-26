import React, { useEffect } from 'react';

function PhotoLightbox({ photo, isOpen, onClose, onPrevious, onNext, currentIndex, totalPhotos }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const handleKeyNavigation = (e) => {
      if (e.key === 'ArrowLeft' && onPrevious) onPrevious();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleKeyNavigation);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleKeyNavigation);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, onPrevious, onNext]);

  if (!isOpen || !photo) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 backdrop-blur-sm overflow-auto">
      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-50 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Navigation arrows */}
      {onPrevious && (
        <button
          onClick={onPrevious}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {onNext && (
        <button
          onClick={onNext}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Scrollable content container */}
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="w-full max-w-6xl flex flex-col items-center">
          {/* Image container with responsive sizing */}
          <div className="relative w-full flex justify-center">
            <img
              src={photo.url}
              alt={photo.caption || 'Plant photo'}
              className="max-w-full h-auto max-h-[80vh] md:max-h-[85vh] object-contain rounded-lg shadow-2xl"
              style={{ maxWidth: '90vw' }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {/* Photo info */}
          <div className="mt-4 mb-8 text-center max-w-2xl">
            {photo.caption && (
              <p className="text-white text-lg mb-2 px-4">{photo.caption}</p>
            )}
            <div className="flex items-center justify-center space-x-4 text-gray-300 text-sm">
              {currentIndex !== undefined && totalPhotos && (
                <span>{currentIndex + 1} of {totalPhotos}</span>
              )}
              {photo.created_at && (
                <span>{new Date(photo.created_at).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
      />
    </div>
  );
}

export default PhotoLightbox;