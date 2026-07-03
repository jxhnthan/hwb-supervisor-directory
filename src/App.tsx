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

  // State for active specialization filters
  const [activeSpecialisationFilters, setActiveSpecialisationFilters] = useState<string[]>([]);
  // State to hold all unique specializations found in data
  const [allSpecialisations, setAllSpecialisations] = useState<string[]>([]);

  // Initialize supervisors state and extract unique specialisations when the component mounts
  useEffect(() => {
    const initialProcessedSupervisors = (rawSupervisorsData as Supervisor[]);
    setSupervisors(initialProcessedSupervisors);

    // Extract unique specializations from the initial data
    const uniqueSpecs = new Set<string>();
    initialProcessedSupervisors.forEach(s => {
      if (s.specialisation) {
        // Assuming specialisation can be a comma-separated string (e.g., "Counselling Psychologist, Family Therapy")
        s.specialisation.split(',').forEach(spec => {
          const trimmedSpec = spec.trim();
          if (trimmedSpec) {
            uniqueSpecs.add(trimmedSpec);
          }
        });
      }
    });
    // Sort the specializations alphabetically for consistent display
    setAllSpecialisations(Array.from(uniqueSpecs).sort());
  }, []); // Empty dependency array means this runs only once on mount

  // Handler for specialization filter buttons
  const handleSpecialisationFilterToggle = (specialisation: string) => {
    setActiveSpecialisationFilters(prevFilters => {
      if (prevFilters.includes(specialisation)) {
        // If already active, remove it
        return prevFilters.filter(filter => filter !== specialisation);
      } else {
        // If not active, add it
        return [...prevFilters, specialisation];
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
          (supervisor.specialisation &&
            supervisor.specialisation.toLowerCase().includes(lowerSearchTerm)) ||
          supervisor.email.toLowerCase().includes(lowerSearchTerm)
        );

        // 2. Specialisation Filter (FIXED LOGIC)
        const matchesSpecialisationFilter = (
          activeSpecialisationFilters.length === 0 || // If no filters are active, this condition passes
          (
            // Ensure supervisor.specialisation exists before attempting to split or compare
            supervisor.specialisation &&
            supervisor.specialisation.split(',').some(specPart => // Split and check each part of the specialization string
              activeSpecialisationFilters.some(filter =>
                specPart.trim().toLowerCase().includes(filter.toLowerCase())
              )
            )
          )
        );

        // A supervisor must pass BOTH the search term filter AND the specialization filter
        return matchesSearchTerm && matchesSpecialisationFilter;
      })
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name
    setFilteredAndSortedSupervisors(filtered);
  }, [searchTerm, supervisors, activeSpecialisationFilters]); // Re-run when search term, supervisor data, or active filters change

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
                placeholder="Search by name, title, or specialisation..."
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

            {/* Specialisation Filters Section (retained) */}
            {allSpecialisations.length > 0 && (
              <div className="specialisation-filters">
                <span className="filter-label">Filter by Expertise:</span>
                {allSpecialisations.map(spec => (
                  <button
                    key={spec}
                    className={`filter-button ${activeSpecialisationFilters.includes(spec) ? 'active' : ''}`}
                    onClick={() => handleSpecialisationFilterToggle(spec)}
                  >
                    {spec}
                  </button>
                ))}
                {/* Clear Filters Button - appears only when filters are active */}
                {activeSpecialisationFilters.length > 0 && (
                  <button
                    className="clear-filters-button"
                    onClick={() => setActiveSpecialisationFilters([])}
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



