import React, { useState } from 'react';
import './App.css';
import { SupervisorCard } from './components/SupervisorCard';
import supervisorsData from './data/supervisors.json';

type Badge = {
  src: string;
  alt: string;
};

type Supervisor = {
  name: string;
  title: string;
  email: string;
  phone?: string;
  specialisation?: string;
  bio?: string;
  badges?: Badge[];
};

function App() {
  const allSupervisors: Supervisor[] = supervisorsData as Supervisor[];
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredAndSortedSupervisors = [...allSupervisors]
    .filter((supervisor) => {
      if (searchTerm === '') return true;

      const lower = searchTerm.toLowerCase();
      return (
        supervisor.name.toLowerCase().includes(lower) ||
        supervisor.title.toLowerCase().includes(lower) ||
        (supervisor.specialisation &&
          supervisor.specialisation.toLowerCase().includes(lower)) ||
        supervisor.email.toLowerCase().includes(lower)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));

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






