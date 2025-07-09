import React, { useState, useEffect } from 'react';
import './App.css';
import { SupervisorCard } from './components/SupervisorCard';
import supervisorsData from './data/supervisors.json'; // Assuming this is your original data

// Define the type for a single badge
type Badge = {
  src: string;
  alt: string;
};

// Define the type for a supervisor
type Supervisor = {
  name: string;
  title: string;
  email: string;
  phone?: string;
  specialisation?: string;
  bio?: string[];
  badges?: Badge[]; // This will now always be these 4 badges after processing
  photoUrl?: string;
};

function App() {
  // Define the EXACT four badges that EVERYONE should have
  const mandatoryBadges: Badge[] = [
    { src: "/images/SGF.jpg", alt: "SPS Singapore" },
    { src: "/images/PENGUIN.jpg", alt: "Penguin Badge" },
    { src: "/images/ELEPHANT.jpg", alt: "Elephant Badge" },
    { src: "/images/MONKEY.jpg", alt: "Monkey Badge" }
  ];

  // Process the supervisorsData: for each supervisor, set their badges array
  // to be exactly the mandatoryBadges.
  const processedSupervisors: Supervisor[] = (supervisorsData as Supervisor[]).map(supervisor => {
    return {
      ...supervisor,
      badges: mandatoryBadges // Overwrite any existing badges with the mandatory set
    };
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAndSortedSupervisors, setFilteredAndSortedSupervisors] = useState<Supervisor[]>([]);

  // Use useEffect to re-filter and re-sort supervisors when searchTerm changes
  useEffect(() => {
    const filtered = processedSupervisors
      .filter((supervisor) => {
        if (searchTerm === '') return true;

        const lowerSearchTerm = searchTerm.toLowerCase();
        return (
          supervisor.name.toLowerCase().includes(lowerSearchTerm) ||
          supervisor.title.toLowerCase().includes(lowerSearchTerm) ||
          (supervisor.specialisation &&
            supervisor.specialisation.toLowerCase().includes(lowerSearchTerm)) ||
          supervisor.email.toLowerCase().includes(lowerSearchTerm)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    setFilteredAndSortedSupervisors(filtered);
  }, [searchTerm, processedSupervisors]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="app">
      <h1 className="header">Clinical Supervisor Directory</h1>

      {/* Search Section */}
      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Search by name, title, or specialisation..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
          aria-label="Search supervisors"
        />
      </div>

      {/* Directory Grid */}
      <div className="directory">
        {filteredAndSortedSupervisors.length > 0 ? (
          filteredAndSortedSupervisors.map((supervisor) => (
            <SupervisorCard key={supervisor.email} supervisor={supervisor} />
          ))
        ) : (
          <p className="no-results">No supervisors found matching your search criteria.</p>
        )}
      </div>

      {/* Footer */}
      <div className="footer">
        Last updated: July 9, 2025
      </div>
    </div>
  );
}

export default App;





