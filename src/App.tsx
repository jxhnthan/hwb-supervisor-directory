import React, { useState, useEffect } from 'react';
import './App.css';
import { SupervisorCard } from './components/SupervisorCard';
import rawSupervisorsData from './data/supervisors.json'; // Your original data source

// Define the type for a supervisor
type Supervisor = {
  name: string;
  title: string;
  email: string;
  phone?: string;
  specialisation?: string; // This will be used for filtering
  suitableFor?: string;
  bio?: string[];
  photoUrl?: string;
};

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [filteredAndSortedSupervisors, setFilteredAndSortedSupervisors] = useState<Supervisor[]>([]);

  // State for active suitable-for filters
  const [activeSuitableForFilters, setActiveSuitableForFilters] = useState<string[]>([]);
  // State to hold all unique suitable-for values found in data
  const [allSuitableForOptions, setAllSuitableForOptions] = useState<string[]>([]);

  // Initialize supervisors state and extract unique suitable-for values when the component mounts
  useEffect(() => {
    const initialProcessedSupervisors = (rawSupervisorsData as Supervisor[]);
    setSupervisors(initialProcessedSupervisors);

    // Extract unique suitable-for values from the initial data
    const uniqueOptions = new Set<string>();
    initialProcessedSupervisors.forEach(s => {
      if (s.suitableFor) {
        s.suitableFor.split(',').forEach(option => {
          const trimmed = option.trim();
          if (trimmed) {
            uniqueOptions.add(trimmed);
          }
        });
      }
    });
    // Sort alphabetically for consistent display
    setAllSuitableForOptions(Array.from(uniqueOptions).sort());
  }, []); // Empty dependency array means this runs only once on mount

  // Handler for suitable-for filter buttons
  const handleSuitableForFilterToggle = (option: string) => {
    setActiveSuitableForFilters(prevFilters => {
      if (prevFilters.includes(option)) {
        // If already active, remove it
        return prevFilters.filter(filter => filter !== option);
      } else {
        // If not active, add it
        return [...prevFilters, option];
      }
    });
  };


  // Effect to filter and sort supervisors for display in the directory
  useEffect(() => {
    const filtered = supervisors
      .filter((supervisor) => {
        const lowerSearchTerm = searchTerm.toLowerCase();

        // 1. Search Term Filter
        const matchesSearchTerm = (
          searchTerm === '' || // Show all if no search term
          supervisor.name.toLowerCase().includes(lowerSearchTerm) ||
          supervisor.title.toLowerCase().includes(lowerSearchTerm) ||
          (supervisor.suitableFor &&
            supervisor.suitableFor.toLowerCase().includes(lowerSearchTerm)) ||
          supervisor.email.toLowerCase().includes(lowerSearchTerm)
        );

        // 2. Suitable For Filter
        const matchesSuitableForFilter = (
          activeSuitableForFilters.length === 0 || // If no filters are active, this condition passes
          (
            // Ensure supervisor.suitableFor exists before attempting to split or compare
            supervisor.suitableFor &&
            supervisor.suitableFor.split(',').some(option => // Split and check each part
              activeSuitableForFilters.some(filter =>
                option.trim().toLowerCase().includes(filter.toLowerCase())
              )
            )
          )
        );

        // A supervisor must pass BOTH the search term filter AND the suitable-for filter
        return matchesSearchTerm && matchesSuitableForFilter;
      })
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name
    setFilteredAndSortedSupervisors(filtered);
  }, [searchTerm, supervisors, activeSuitableForFilters]); // Re-run when search term, supervisor data, or active filters change

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="app">
      <h1 className="header">Clinical Supervisor Directory</h1> {/* Original text */}

      {/* Main Layout Container */}
      <div className="main-layout">
        {/* Main Content Area */}
        <div className="main-content">
          <div className="search-filter-container">
            <div className="search-input-wrapper">
              <span className="search-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by name or title…"
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
                aria-label="Search supervisors"
              />
              {searchTerm && (
                <button
                  className="clear-search-button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                  title="Clear search"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Suitable For Filters Section */}
            {allSuitableForOptions.length > 0 && (
              <div className="specialisation-filters">
                <span className="filter-label">I am a…</span>
                {allSuitableForOptions.map(option => (
                  <button
                    key={option}
                    className={`filter-button ${activeSuitableForFilters.includes(option) ? 'active' : ''}`}
                    onClick={() => handleSuitableForFilterToggle(option)}
                  >
                    {option}
                  </button>
                ))}
                {/* Clear Filters Button - appears only when filters are active */}
                {activeSuitableForFilters.length > 0 && (
                  <button
                    className="clear-filters-button"
                    onClick={() => setActiveSuitableForFilters([])}
                  >
                    &times; Clear All
                  </button>
                )}
              </div>
            )}
            <p className="results-count">
              Showing <strong>{filteredAndSortedSupervisors.length}</strong> of <strong>{supervisors.length}</strong> supervisors
            </p>
          </div>

          {/* Directory Grid */}
          <div className="directory">
            {filteredAndSortedSupervisors.length > 0 ? (
              filteredAndSortedSupervisors.map((supervisor) => (
                <SupervisorCard
                  key={supervisor.email} // Use a unique identifier for key
                  supervisor={supervisor}
                />
              ))
            ) : (
              <p className="no-results">No supervisors found matching your search criteria.</p> 
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        Last updated: June 22, 2026. NUS Health and Wellbeing 2026. {/* Original text */}
      </div>
    </div>
  );
}

export default App;



