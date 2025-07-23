"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface Project {
  _id: string;
  websiteIdea: string;
  sections: string[];
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data?: Project;
  error?: string;
}

interface CacheEntry {
  sections: string[];
  timestamp: number;
}

export function WebsiteGenerator() {
  const [websiteIdea, setWebsiteIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const DEBOUNCE_DELAY = 500;
  const CACHE_DURATION = 5 * 60 * 1000;

  const getCachedSections = (idea: string): string[] | null => {
    const cached = cacheRef.current.get(idea.toLowerCase());
    return cached && Date.now() - cached.timestamp < CACHE_DURATION ? cached.sections : null;
  };

  const cacheSections = (idea: string, sections: string[]) => {
    cacheRef.current.set(idea.toLowerCase(), { sections, timestamp: Date.now() });
  };

  const generateOptimisticSections = (idea: string): string[] => {
    const lowerIdea = idea.toLowerCase();
    
    const templates = {
      bakery: ['Hero - Fresh Baked Goods', 'Our Story', 'Menu & Specialties', 'Location & Hours', 'Contact Us'],
      restaurant: ['Hero - Fine Dining Experience', 'About Our Chef', 'Menu & Wine List', 'Reservations', 'Contact & Location'],
      shop: ['Hero - Welcome to Our Store', 'Featured Products', 'About Us', 'Customer Reviews', 'Contact & Location'],
      portfolio: ['Hero - Welcome', 'About Me', 'Portfolio Gallery', 'Skills & Experience', 'Contact']
    };

    if (lowerIdea.includes('bakery')) return templates.bakery;
    if (lowerIdea.includes('restaurant')) return templates.restaurant;
    if (lowerIdea.includes('shop') || lowerIdea.includes('store')) return templates.shop;
    if (lowerIdea.includes('portfolio')) return templates.portfolio;
    
    return ['Hero Section', 'About', 'Services', 'Testimonials', 'Contact'];
  };

  const createAndFetchProject = async (idea: string, signal?: AbortSignal) => {
    const createResponse = await fetch("http://localhost:3001/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ websiteIdea: idea }),
      signal,
    });

    const createResult = await createResponse.json() as ApiResponse;
    if (!createResult.success) {
      throw new Error(createResult.error ?? "Failed to create project");
    }

    if (!createResult.data?._id) return null;

    const fetchResponse = await fetch(
      `http://localhost:3001/api/projects/${createResult.data._id}`,
      { signal }
    );
    const fetchResult = await fetchResponse.json() as ApiResponse;

    return fetchResult.success && fetchResult.data ? fetchResult.data.sections : null;
  };

  const generateSectionsAutomatically = async (idea: string) => {
    const cachedSections = getCachedSections(idea);
    if (cachedSections) {
      setSections(cachedSections);
      setError(null);
      return;
    }

    const optimisticSections = generateOptimisticSections(idea);
    setSections(optimisticSections);
    setIsGenerating(true);
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const realSections = await createAndFetchProject(idea, abortControllerRef.current.signal);
      if (realSections) {
        cacheSections(idea, realSections);
        setSections(realSections);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
        setSections(optimisticSections);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const debouncedGenerateSections = useCallback((idea: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      if (idea.trim().length > 3) {
        void generateSectionsAutomatically(idea.trim());
      }
    }, DEBOUNCE_DELAY);
  }, []);

  const handleInputChange = (value: string) => {
    setWebsiteIdea(value);
    
    if (value.trim().length > 3) {
      debouncedGenerateSections(value);
    } else {
      setSections([]);
      setError(null);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!websiteIdea.trim()) {
      setError("Please enter a website idea");
      return;
    }

    setIsLoading(true);
    setError(null);

    const cachedSections = getCachedSections(websiteIdea.trim());
    if (cachedSections) {
      setSections(cachedSections);
      setIsLoading(false);
      setWebsiteIdea("");
      return;
    }

    try {
      const realSections = await createAndFetchProject(websiteIdea);
      if (realSections) {
        cacheSections(websiteIdea.trim(), realSections);
        setSections(realSections);
      }
      setWebsiteIdea("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        Website Section Generator
      </h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="space-y-4">
          <div>
            <label htmlFor="website-idea" className="block text-sm font-medium text-gray-700 mb-2">
              Website Idea
              {isGenerating && (
                <span className="ml-2 text-xs text-blue-600 animate-pulse">
                  Generating preview...
                </span>
              )}
            </label>
            <input
              id="website-idea"
              type="text"
              value={websiteIdea}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="e.g., A bakery in downtown, A restaurant with fine dining..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Start typing to see a live preview (minimum 4 characters)
            </p>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !websiteIdea.trim()}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors text-white ${
              isLoading || !websiteIdea.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            }`}
          >
            {isLoading ? "Generating..." : "Generate & Save Sections"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {sections.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            Generated Sections
            {isGenerating && (
              <div className="ml-2 flex items-center space-x-1 text-blue-600">
                {[0, 0.1, 0.2].map((delay, i) => (
                  <div 
                    key={i}
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" 
                    style={{ animationDelay: `${delay}s` }}
                  />
                ))}
              </div>
            )}
          </h2>
          <ul className="space-y-2">
            {sections.map((section, index) => (
              <li
                key={index}
                className={`flex items-center space-x-2 text-gray-700 transition-all duration-300 ${
                  isGenerating ? 'opacity-70' : 'opacity-100'
                }`}
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>{section}</span>
              </li>
            ))}
          </ul>
          {!isGenerating && sections.length > 0 && (
            <p className="text-xs text-gray-500 mt-3">
              💡 These sections are cached for faster loading next time
            </p>
          )}
        </div>
      )}
    </div>
  );
}