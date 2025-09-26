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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Navigation arrows */}
      {onPrevious && (
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {onNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Photo container */}
      <div className="max-w-7xl max-h-[90vh] mx-4 flex flex-col">
        <img
          src={photo.url}
          alt={photo.caption || 'Plant photo'}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        
        {/* Photo info */}
        <div className="mt-4 text-center">
          {photo.caption && (
            <p className="text-white text-lg mb-2">{photo.caption}</p>
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

      {/* Click outside to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
      />
    </div>
  );
}

export default PhotoLightbox;