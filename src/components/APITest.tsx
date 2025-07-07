'use client';

import { useState } from 'react';
import { getPopularMovies, getMovieGenres, verifyAPIKey } from '@/lib/api';

export default function APITest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testPopularMovies = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await getPopularMovies(1);
      setResult(data);
      console.log('Popular Movies API Test Success:', data);
    } catch (err: any) {
      setError(err.message);
      console.error('Popular Movies API Test Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testGenres = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await getMovieGenres();
      setResult(data);
      console.log('Genres API Test Success:', data);
    } catch (err: any) {
      setError(err.message);
      console.error('Genres API Test Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testAPIKey = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await verifyAPIKey();
      setResult(data);
      console.log('API Key Test Result:', data);
    } catch (err: any) {
      setError(err.message);
      console.error('API Key Test Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">API Test</h2>
      
      <div className="flex gap-4 mb-4">
        <button
          onClick={testAPIKey}
          disabled={loading}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg"
        >
          {loading ? 'Testing...' : 'Test API Key'}
        </button>
        
        <button
          onClick={testPopularMovies}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg"
        >
          {loading ? 'Testing...' : 'Test Popular Movies'}
        </button>
        
        <button
          onClick={testGenres}
          disabled={loading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg"
        >
          {loading ? 'Testing...' : 'Test Genres'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg mb-4">
          <h3 className="text-red-400 font-bold mb-2">Error:</h3>
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-900/50 border border-green-500 rounded-lg">
          <h3 className="text-green-400 font-bold mb-2">Success:</h3>
          <pre className="text-green-300 text-sm overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 