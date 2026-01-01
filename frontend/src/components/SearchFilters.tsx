import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp, Star, Calendar, Save, Trash2, Share2 } from 'lucide-react';

export interface FilterState {
  searchQuery: string;
  positions: string[];
  stages: string[];
  ratingMin: number;
  ratingMax: number;
  dateFrom: string;
  dateTo: string;
  hasResume: boolean | null;
  hasNotes: boolean | null;
  hasLinkedIn: boolean | null;
  hasPortfolio: boolean | null;
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: string;
  isShared: boolean;
}

interface SearchFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  positions: string[];
  stages: { id: string; label: string }[];
  savedFilters: SavedFilter[];
  onSaveFilter: (name: string, filters: FilterState) => void;
  onDeleteFilter: (id: string) => void;
  onShareFilter: (id: string) => void;
  onLoadFilter: (filter: SavedFilter) => void;
  resultCount: number;
}

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  positions: [],
  stages: [],
  ratingMin: 0,
  ratingMax: 5,
  dateFrom: '',
  dateTo: '',
  hasResume: null,
  hasNotes: null,
  hasLinkedIn: null,
  hasPortfolio: null,
};

export function SearchFilters({
  onFilterChange,
  positions,
  stages,
  savedFilters,
  onSaveFilter,
  onDeleteFilter,
  onShareFilter,
  onLoadFilter,
  resultCount,
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange(filters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, onFilterChange]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const saveRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  }, [recentSearches]);

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, searchQuery: value }));
  };

  const handleSearchSubmit = () => {
    if (filters.searchQuery.trim()) {
      saveRecentSearch(filters.searchQuery.trim());
    }
    setShowRecentSearches(false);
  };

  const handlePositionToggle = (position: string) => {
    setFilters(prev => ({
      ...prev,
      positions: prev.positions.includes(position)
        ? prev.positions.filter(p => p !== position)
        : [...prev.positions, position]
    }));
  };

  const handleStageToggle = (stageId: string) => {
    setFilters(prev => ({
      ...prev,
      stages: prev.stages.includes(stageId)
        ? prev.stages.filter(s => s !== stageId)
        : [...prev.stages, stageId]
    }));
  };

  const handleRatingChange = (min: number, max: number) => {
    setFilters(prev => ({ ...prev, ratingMin: min, ratingMax: max }));
  };

  const handleDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleFilter = (field: 'hasResume' | 'hasNotes' | 'hasLinkedIn' | 'hasPortfolio') => {
    setFilters(prev => ({
      ...prev,
      [field]: prev[field] === null ? true : prev[field] === true ? false : null
    }));
  };

  const clearAllFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      onSaveFilter(filterName.trim(), filters);
      setFilterName('');
      setShowSaveDialog(false);
    }
  };

  const removeFilterChip = (type: string, value?: string) => {
    switch (type) {
      case 'search':
        setFilters(prev => ({ ...prev, searchQuery: '' }));
        break;
      case 'position':
        if (value) handlePositionToggle(value);
        break;
      case 'stage':
        if (value) handleStageToggle(value);
        break;
      case 'rating':
        setFilters(prev => ({ ...prev, ratingMin: 0, ratingMax: 5 }));
        break;
      case 'dateFrom':
        setFilters(prev => ({ ...prev, dateFrom: '' }));
        break;
      case 'dateTo':
        setFilters(prev => ({ ...prev, dateTo: '' }));
        break;
      case 'hasResume':
        setFilters(prev => ({ ...prev, hasResume: null }));
        break;
      case 'hasNotes':
        setFilters(prev => ({ ...prev, hasNotes: null }));
        break;
      case 'hasLinkedIn':
        setFilters(prev => ({ ...prev, hasLinkedIn: null }));
        break;
      case 'hasPortfolio':
        setFilters(prev => ({ ...prev, hasPortfolio: null }));
        break;
    }
  };

  // Count active filters
  const activeFilterCount = 
    (filters.searchQuery ? 1 : 0) +
    filters.positions.length +
    filters.stages.length +
    (filters.ratingMin > 0 || filters.ratingMax < 5 ? 1 : 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0) +
    (filters.hasResume !== null ? 1 : 0) +
    (filters.hasNotes !== null ? 1 : 0) +
    (filters.hasLinkedIn !== null ? 1 : 0) +
    (filters.hasPortfolio !== null ? 1 : 0);

  const getToggleButtonClass = (value: boolean | null) => {
    if (value === true) return 'bg-green-100 text-green-700 border-green-300';
    if (value === false) return 'bg-red-100 text-red-700 border-red-300';
    return 'bg-gray-100 text-gray-600 border-gray-300';
  };

  const getToggleLabel = (value: boolean | null, label: string) => {
    if (value === true) return `Has ${label}`;
    if (value === false) return `No ${label}`;
    return label;
  };

  return (
    <div className="space-y-4" data-testid="search-filters">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowRecentSearches(true)}
            onBlur={() => setTimeout(() => setShowRecentSearches(false), 200)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            placeholder="Search by name, email, phone, or position..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            data-testid="search-input"
          />
          
          {/* Recent Searches Dropdown */}
          {showRecentSearches && recentSearches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Recent Searches</span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    handleSearchChange(search);
                    setShowRecentSearches(false);
                  }}
                  className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  {search}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
          className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
            isFilterPanelOpen || activeFilterCount > 0
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          data-testid="filter-toggle-btn"
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
          {isFilterPanelOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Active Filters Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center" data-testid="active-filters">
          <span className="text-sm text-gray-500">Active filters:</span>
          
          {filters.searchQuery && (
            <FilterChip
              label={`Search: "${filters.searchQuery}"`}
              onRemove={() => removeFilterChip('search')}
            />
          )}
          
          {filters.positions.map(pos => (
            <FilterChip
              key={pos}
              label={`Position: ${pos}`}
              onRemove={() => removeFilterChip('position', pos)}
            />
          ))}
          
          {filters.stages.map(stage => (
            <FilterChip
              key={stage}
              label={`Stage: ${stages.find(s => s.id === stage)?.label || stage}`}
              onRemove={() => removeFilterChip('stage', stage)}
            />
          ))}
          
          {(filters.ratingMin > 0 || filters.ratingMax < 5) && (
            <FilterChip
              label={`Rating: ${filters.ratingMin}-${filters.ratingMax} stars`}
              onRemove={() => removeFilterChip('rating')}
            />
          )}
          
          {filters.dateFrom && (
            <FilterChip
              label={`From: ${filters.dateFrom}`}
              onRemove={() => removeFilterChip('dateFrom')}
            />
          )}
          
          {filters.dateTo && (
            <FilterChip
              label={`To: ${filters.dateTo}`}
              onRemove={() => removeFilterChip('dateTo')}
            />
          )}
          
          {filters.hasResume !== null && (
            <FilterChip
              label={filters.hasResume ? 'Has Resume' : 'No Resume'}
              onRemove={() => removeFilterChip('hasResume')}
            />
          )}
          
          {filters.hasNotes !== null && (
            <FilterChip
              label={filters.hasNotes ? 'Has Notes' : 'No Notes'}
              onRemove={() => removeFilterChip('hasNotes')}
            />
          )}
          
          {filters.hasLinkedIn !== null && (
            <FilterChip
              label={filters.hasLinkedIn ? 'Has LinkedIn' : 'No LinkedIn'}
              onRemove={() => removeFilterChip('hasLinkedIn')}
            />
          )}
          
          {filters.hasPortfolio !== null && (
            <FilterChip
              label={filters.hasPortfolio ? 'Has Portfolio' : 'No Portfolio'}
              onRemove={() => removeFilterChip('hasPortfolio')}
            />
          )}
          
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-700 ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Result Count */}
      <div className="text-sm text-gray-500" data-testid="result-count">
        {resultCount} {resultCount === 1 ? 'candidate' : 'candidates'} found
      </div>

      {/* Filter Panel */}
      {isFilterPanelOpen && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6" data-testid="filter-panel">
          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Saved Filters</h4>
              <div className="flex flex-wrap gap-2">
                {savedFilters.map(filter => (
                  <div
                    key={filter.id}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg group"
                  >
                    <button
                      onClick={() => onLoadFilter(filter)}
                      className="text-sm text-gray-700 hover:text-blue-600"
                    >
                      {filter.name}
                    </button>
                    <button
                      onClick={() => onShareFilter(filter.id)}
                      className="p-1 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Share filter"
                    >
                      <Share2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteFilter(filter.id)}
                      className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete filter"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Position Filter */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Position</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {positions.map(position => (
                  <label key={position} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.positions.includes(position)}
                      onChange={() => handlePositionToggle(position)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{position}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Pipeline Stage Filter */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Pipeline Stage</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {stages.map(stage => (
                  <label key={stage.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.stages.includes(stage.id)}
                      onChange={() => handleStageToggle(stage.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{stage.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Rating Score</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Min:</span>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        onClick={() => handleRatingChange(num, filters.ratingMax)}
                        className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                          filters.ratingMin === num
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Max:</span>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        onClick={() => handleRatingChange(filters.ratingMin, num)}
                        className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                          filters.ratingMax === num
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>{filters.ratingMin} - {filters.ratingMax} stars</span>
                </div>
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Applied Date</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">From</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">To</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => handleDateChange('dateTo', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Toggle Filters */}
            <div className="lg:col-span-2">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Filters</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleToggleFilter('hasResume')}
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${getToggleButtonClass(filters.hasResume)}`}
                >
                  {getToggleLabel(filters.hasResume, 'Resume')}
                </button>
                <button
                  onClick={() => handleToggleFilter('hasNotes')}
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${getToggleButtonClass(filters.hasNotes)}`}
                >
                  {getToggleLabel(filters.hasNotes, 'Notes')}
                </button>
                <button
                  onClick={() => handleToggleFilter('hasLinkedIn')}
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${getToggleButtonClass(filters.hasLinkedIn)}`}
                >
                  {getToggleLabel(filters.hasLinkedIn, 'LinkedIn')}
                </button>
                <button
                  onClick={() => handleToggleFilter('hasPortfolio')}
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${getToggleButtonClass(filters.hasPortfolio)}`}
                >
                  {getToggleLabel(filters.hasPortfolio, 'Portfolio')}
                </button>
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Reset all filters
            </button>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Filter
            </button>
          </div>
        </div>
      )}

      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Filter</h3>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Enter filter name..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveFilter}
                disabled={!filterName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setFilterName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Filter Chip Component
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
      {label}
      <button
        onClick={onRemove}
        className="p-0.5 hover:bg-blue-200 rounded-full transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
