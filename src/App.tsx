import React, { useState, useEffect } from 'react';
import './App.css';
import { SupervisorCard } from './components/SupervisorCard';
import supervisorsData from './data/supervisors.json';

// Define the type for a single badge
type Badge = {
  src: string;
  alt: string;
};

// Define the type for a supervisor, ensuring badges is an optional array of Badge
type Supervisor = {
  name: string;
  title: string;
  email: string;
  phone?: string;
  specialisation?: string;
  bio?: string[]; // Bio is an array of strings
  badges?: Badge[]; // Badges is an optional array of Badge objects
  photoUrl?: string; // Add photoUrl if it's part of your data and used
};

function App() {
  // Define the new badges to be added
  const newBadges: Badge[] = [
    { src: "/images/PENGUIN.jpg", alt: "Penguin Badge" },
    { src: "/images/ELEPHANT.jpg", alt: "Elephant Badge" },
    { src: "/images/MONKEY.jpg", alt: "Monkey Badge" }
  ];

  // Process the supervisorsData to ensure each supervisor has a badges array
  // and append the new badges to it.
  const processedSupervisors: Supervisor[] = (supervisorsData as Supervisor[]).map(supervisor => {
    // Create a new array for badges, including existing ones and then the new ones
    const updatedBadges = [
      ...(supervisor.badges || []), // Use existing badges, or an empty array if none
      ...newBadges // Add the new badges
    ];
    return { ...supervisor, badges: updatedBadges };
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
  }, [searchTerm]); // Dependency array: run when searchTerm changes

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






