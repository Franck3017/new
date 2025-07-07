'use client';

import { useState } from 'react';
import { FiPlay, FiX, FiExternalLink } from 'react-icons/fi';

interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

interface VideoPlayerProps {
  videos: Video[];
}

export default function VideoPlayer({ videos }: VideoPlayerProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const trailers = videos.filter(video => 
    video.type === 'Trailer' && video.site === 'YouTube'
  );

  const otherVideos = videos.filter(video => 
    video.type !== 'Trailer' || video.site !== 'YouTube'
  );

  const allVideos = [...trailers, ...otherVideos];

  const openVideo = (video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const closeVideo = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  if (allVideos.length === 0) {
    return (
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 text-center">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiPlay className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No hay videos disponibles</h3>
        <p className="text-gray-400">No se encontraron tráilers o videos para esta película.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Videos principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allVideos.slice(0, 6).map((video) => (
            <div
              key={video.id}
              className="group relative bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 cursor-pointer"
              onClick={() => openVideo(video)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-700">
                <img
                  src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
                  alt={video.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`;
                  }}
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                    <FiPlay className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                {/* Badge de tipo */}
                <div className="absolute top-2 left-2">
                  <span className="bg-blue-500/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium">
                    {video.type}
                  </span>
                </div>
                
                {/* Badge oficial */}
                {video.official && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-green-500/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium">
                      Oficial
                    </span>
                  </div>
                )}
              </div>
              
              {/* Información */}
              <div className="p-4">
                <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-blue-400 transition-colors duration-200">
                  {video.name}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">{video.site}</span>
                  <FiExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors duration-200" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lista completa de videos */}
        {allVideos.length > 6 && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-xl font-bold text-white mb-4">Todos los videos ({allVideos.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allVideos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer"
                  onClick={() => openVideo(video)}
                >
                  <div className="relative w-16 h-12 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={`https://img.youtube.com/vi/${video.key}/default.jpg`}
                      alt={video.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <FiPlay className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white text-sm line-clamp-2">
                      {video.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{video.type}</span>
                      {video.official && (
                        <span className="text-xs bg-green-500/90 text-white px-1 rounded">Oficial</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de video */}
      {isModalOpen && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">{selectedVideo.name}</h3>
              <button
                onClick={closeVideo}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                <FiX className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            {/* Video */}
            <div className="relative aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.key}?autoplay=1&rel=0`}
                title={selectedVideo.name}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{selectedVideo.site}</span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-400">{selectedVideo.type}</span>
                  {selectedVideo.official && (
                    <>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm bg-green-500/90 text-white px-2 py-1 rounded">Oficial</span>
                    </>
                  )}
                </div>
                <a
                  href={`https://www.youtube.com/watch?v=${selectedVideo.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  <FiExternalLink className="h-4 w-4" />
                  Ver en YouTube
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
