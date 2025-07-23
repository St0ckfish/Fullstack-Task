"use client";

import { useState } from "react";

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

export function WebsiteGenerator() {
  const [websiteIdea, setWebsiteIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!websiteIdea.trim()) {
      setError("Please enter a website idea");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSections([]);

    try {
      const createResponse = await fetch("http://localhost:3001/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ websiteIdea }),
      });

      const createResult = await createResponse.json() as ApiResponse;

      if (!createResult.success) {
        throw new Error(createResult.error ?? "Failed to create project");
      }

      if (createResult.data?._id) {
        const fetchResponse = await fetch(
          `http://localhost:3001/api/projects/${createResult.data._id}`
        );
        const fetchResult = await fetchResponse.json() as ApiResponse;

        if (fetchResult.success && fetchResult.data) {
          setSections(fetchResult.data.sections);
        }
      }

      setWebsiteIdea("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        Website Section Generator
      </h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="space-y-4">
          <div>
            <label 
              htmlFor="website-idea" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Website Idea
            </label>
            <input
              id="website-idea"
              type="text"
              value={websiteIdea}
              onChange={(e) => setWebsiteIdea(e.target.value)}
              placeholder="e.g., A bakery in downtown, A restaurant with fine dining..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            } text-white`}
          >
            {isLoading ? "Generating..." : "Generate Sections"}
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
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Generated Sections
          </h2>
          <ul className="space-y-2">
            {sections.map((section, index) => (
              <li
                key={index}
                className="flex items-center space-x-2 text-gray-700"
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>{section}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
