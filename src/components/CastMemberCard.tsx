'use client';

import { CastMember } from "@/types";
import Image from "next/image";
import { FiUser, FiStar } from "react-icons/fi";
import Link from "next/link";

interface CastMemberCardProps {
  member: CastMember;
}

export default function CastMemberCard({ member }: CastMemberCardProps) {
  const profileImageUrl = member.profile_path 
    ? `https://image.tmdb.org/t/p/w185${member.profile_path}`
    : null;

  // Generar URL con formato id-name
  const getPersonUrl = () => {
    const nameSlug = member.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `/person/${member.id}-${encodeURIComponent(nameSlug)}`;
  };

  return (
    <Link href={getPersonUrl()} className="block">
      <div className="group relative bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 cursor-pointer min-w-[200px] flex-shrink-0 hover:scale-105">
        {/* Imagen de perfil */}
        <div className="relative aspect-[2/3] bg-gray-700 overflow-hidden">
          {profileImageUrl ? (
            <Image
              src={profileImageUrl}
              alt={member.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <FiUser className="h-12 w-12 text-gray-500" />
            </div>
          )}
          
          {/* Overlay con información */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
            <div className="p-4 w-full">
              <div className="flex items-center gap-1 mb-1">
                <FiStar className="h-3 w-3 text-yellow-400" />
                <span className="text-xs text-white font-medium">
                  {member.popularity?.toFixed(1) || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Información del actor */}
        <div className="p-4">
          <h3 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-blue-400 transition-colors duration-200">
            {member.name}
          </h3>
          <p className="text-gray-400 text-xs line-clamp-2 mt-1">
            {member.character}
          </p>
          
          {/* Información adicional */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {member.known_for_department || 'Actor'}
            </span>
            {member.order !== undefined && (
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                #{member.order + 1}
              </span>
            )}
          </div>
        </div>
        
        {/* Efecto de brillo en hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </Link>
  );
}
