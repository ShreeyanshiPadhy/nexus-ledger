import React, { useState, useMemo } from 'react';
import formConfig from '../../config/formConfig.json';

export default function FormSearch({ onJumpToField }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const allSearchableFields = useMemo(() => {
    const list = [];
    formConfig.tabs.forEach(tab => {
      if (!tab.fields) return;
      tab.fields.forEach(field => {
        list.push({
          tabId: tab.id,
          tabLabel: tab.label,
          fieldId: field.name || field.id, 
          fieldLabel: field.label || field.title || field.name
        });
      });
    });
    return list;
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 1) {
      const lowerQuery = query.toLowerCase();
      const matches = allSearchableFields.filter(f => 
        f.fieldLabel?.toLowerCase().includes(lowerQuery)
      );
      setSearchResults(matches);
      setIsSearchOpen(true);
    } else {
      setIsSearchOpen(false);
    }
  };

  return (
    <div className="flex justify-end mb-3 relative z-50">
      <div className="relative w-80">
        <input
          type="text"
          className="w-full bg-white border border-slate-300 text-slate-700 py-2 pl-4 pr-4 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
          placeholder="Search for a specific field..."
          value={searchQuery}
          onChange={handleSearchChange}
          onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
        />
        
        {isSearchOpen && searchResults.length > 0 && (
          <div className="absolute mt-1 w-full bg-white border border-slate-200 rounded-md shadow-xl max-h-72 overflow-y-auto z-50">
            {searchResults.map((match, i) => (
              <div 
                key={`${match.fieldId}-${i}`}
                onClick={() => {
                  onJumpToField(match);
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }}
                className="px-4 py-3 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer border-b border-slate-100 last:border-none transition-colors text-left"
              >
                <div className="text-sm font-semibold text-slate-800">{match.fieldLabel}</div>
                <div className="text-xs text-slate-500 mt-0.5 font-medium">Tab: {match.tabLabel}</div>
              </div>
            ))}
          </div>
        )}
        {isSearchOpen && searchQuery.length > 1 && searchResults.length === 0 && (
           <div className="absolute mt-1 w-full bg-white border border-slate-200 rounded-md shadow-xl p-4 text-center z-50">
             <span className="text-sm text-slate-500">No fields found for "{searchQuery}"</span>
           </div>
        )}
      </div>
    </div>
  );
}