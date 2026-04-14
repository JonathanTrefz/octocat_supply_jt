import { useState } from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';
import { api } from '../../../api/config';
import { useTheme } from '../../../context/ThemeContext';

interface Cat {
  catId: number;
  name: string;
  breed: string;
  personality: string;
  bio?: string;
  zoomiesPerHour: number;
  napsPerDay: number;
  judginessLevel: number;
  favoriteProductId?: number | null;
  imgName?: string | null;
}

const PERSONALITY_COLORS: Record<string, string> = {
  Lawful: 'bg-green-100 text-green-800',
  Neutral: 'bg-blue-100 text-blue-800',
  Chaotic: 'bg-orange-100 text-orange-800',
  True: 'bg-blue-100 text-blue-800',
};

function getPersonalityBadgeClass(personality: string): string {
  const prefix = personality.split(' ')[0];
  return PERSONALITY_COLORS[prefix] ?? 'bg-gray-100 text-gray-800';
}

function JudginessBar({ level, darkMode }: { level: number; darkMode: boolean }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Judginess level ${level} out of 10`}>
      {Array.from({ length: 10 }, (_, i) => (
        <span
          key={i}
          className={`text-sm ${i < level ? 'text-primary' : darkMode ? 'text-gray-600' : 'text-gray-300'}`}
          aria-hidden="true"
        >
          🐾
        </span>
      ))}
    </div>
  );
}

const fetchCats = async (): Promise<Cat[]> => {
  const { data } = await axios.get(`${api.baseURL}${api.endpoints.cats}`);
  return data;
};

export default function Cats() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: cats, isLoading, error } = useQuery('cats', fetchCats);
  const { darkMode } = useTheme();

  const filteredCats = cats?.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.breed.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-red-500 text-center">Failed to fetch cats</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          <h1
            className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
          >
            Meet the Cats
          </h1>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
            The distinguished feline residents of OctoCAT Supply. Each one is thoroughly opinionated about your life choices.
          </p>

          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or breed..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-800 text-light border-gray-700' : 'bg-white text-gray-800 border-gray-300'} rounded-lg border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors duration-300`}
              aria-label="Search cats by name or breed"
            />
            <svg
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>

          {(!filteredCats || filteredCats.length === 0) && (
            <div
              className={`flex flex-col items-center justify-center text-center py-20 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              role="status"
              aria-live="polite"
            >
              <span className="text-5xl mb-4" aria-hidden="true">🐱</span>
              <p className={`${darkMode ? 'text-light' : 'text-gray-800'} text-lg font-medium`}>
                No cats found
              </p>
              {searchTerm && (
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                  Try clearing or changing your search term.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCats?.map((cat) => (
              <article
                key={cat.catId}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(118,184,82,0.3)] flex flex-col`}
              >
                {/* Avatar */}
                <div
                  className={`flex items-center justify-center h-40 text-8xl ${darkMode ? 'bg-gradient-to-t from-gray-700 to-gray-800' : 'bg-gradient-to-t from-gray-100 to-white'} transition-colors duration-300`}
                  aria-hidden="true"
                >
                  {cat.imgName ? (
                    <img
                      src={`/${cat.imgName}`}
                      alt={cat.name}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    '🐱'
                  )}
                </div>

                {/* Card body */}
                <div className="p-4 flex flex-col flex-grow space-y-3">
                  <div>
                    <h2
                      className={`text-lg font-bold ${darkMode ? 'text-light' : 'text-gray-800'} leading-tight transition-colors duration-300`}
                    >
                      {cat.name}
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>
                      {cat.breed}
                    </p>
                  </div>

                  {/* Personality badge */}
                  <span
                    className={`inline-block text-xs font-semibold px-2 py-1 rounded-full w-fit ${getPersonalityBadgeClass(cat.personality)}`}
                  >
                    {cat.personality}
                  </span>

                  {/* Bio */}
                  {cat.bio && (
                    <p
                      className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} flex-grow italic transition-colors duration-300`}
                    >
                      "{cat.bio}"
                    </p>
                  )}

                  {/* Stats */}
                  <div className={`space-y-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                    <div className="flex items-center gap-2">
                      <span aria-hidden="true">⚡</span>
                      <span>{cat.zoomiesPerHour} zoomies/hr</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span aria-hidden="true">💤</span>
                      <span>{cat.napsPerDay} naps/day</span>
                    </div>
                  </div>

                  {/* Judginess level */}
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1 transition-colors duration-300`}>
                      Judginess Level
                    </p>
                    <JudginessBar level={cat.judginessLevel} darkMode={darkMode} />
                  </div>

                  {/* Favorite product link */}
                  {cat.favoriteProductId && (
                    <a
                      href="/products"
                      className="inline-block mt-auto text-xs text-primary hover:text-accent font-medium transition-colors"
                      aria-label={`View ${cat.name}'s favorite product`}
                    >
                      ❤️ Has a favorite product →
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
