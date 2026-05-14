import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Input } from './ui/input';

export function LocationAutocomplete({ 
  value, 
  onLocationSelect, 
  placeholder = "Search for a city...",
  className = "" 
}) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLocation = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 3) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&featuretype=city`);
      const data = await res.json();
      
      const formattedResults = data.map(item => {
        // Extract meaningful name
        const displayParts = item.display_name.split(', ');
        const city = displayParts[0];
        const country = displayParts[displayParts.length - 1];
        
        return {
          id: item.place_id,
          displayName: `${city}, ${country}`,
          city: city,
          country: country,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          raw: item.display_name
        };
      });
      
      setResults(formattedResults);
      setIsOpen(true);
    } catch (error) {
      console.error("Error fetching location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // If input is cleared, notify parent
    if (!newQuery) {
      onLocationSelect(null);
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(() => {
      searchLocation(newQuery);
    }, 600);
  };

  const handleSelect = (location) => {
    setQuery(location.displayName);
    setIsOpen(false);
    onLocationSelect({
      name: location.displayName,
      city: location.city,
      country: location.country,
      lat: location.lat,
      lon: location.lon
    });
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-9 pr-10"
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={(e) => {
                e.preventDefault();
                handleSelect(result);
              }}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-start gap-3 transition-colors"
            >
              <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-slate-900">{result.city}</div>
                <div className="text-xs text-slate-500">{result.raw}</div>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {isOpen && query.length >= 3 && results.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center text-slate-500 text-sm">
          No locations found.
        </div>
      )}
    </div>
  );
}
