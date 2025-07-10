import React, { useState, useEffect } from 'react';
import './App.css';
import { SupervisorCard } from './components/SupervisorCard';
import rawSupervisorsData from './data/supervisors.json'; // Your original data source

// Define the type for a single badge
type Badge = {
  id: string; // Crucial for unique identification in drag-and-drop
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
  badges: Badge[]; // Each supervisor now has their own mutable badges array
  photoUrl?: string;
};

// Initial set of badges for the sidebar (the "palette" of available badges)
const sidebarBadges: Badge[] = [
  { id: 'badge-sgf', src: "/images/SGF.jpg", alt: "SPS Singapore" },
  { id: 'badge-elephant', src: "/images/ELEPHANT.jpg", alt: "Elephant Badge" },
  { id: 'badge-penguin', src: "/images/PENGUIN.jpg", alt: "Penguin Badge" },
  { id: 'badge-monkey', src: "/images/MONKEY.jpg", alt: "Monkey Badge" },
  { id: 'badge-sushi', src: "/images/SUSHI.jpg", alt: "Sushi Badge" },
  { id: 'badge-dog', src: "/images/DOG.png", alt: "Dog Badge" },
  { id: 'badge-otter', src: "/images/OTTER.png", alt: "Otter Badge" },
  { id: 'badge-mbs', src: "/images/MBS.png", alt: "MBS Badge" },
  { id: 'badge-tea', src: "/images/TEA.png", alt: "TEA Badge" },
  { id: 'badge-pizza', src: "/images/PIZZA.png", alt: "PIZZA Badge" },
  { id: 'badge-taco', src: "/images/TACO.png", alt: "Taco Badge" },
  { id: 'badge-icecream', src: "/images/icecream.png", alt: "Ice Cream Badge" },
  { id: 'badge-marvel', src: "/images/MARVEL.png", alt: "Marvel Badge" },
  { id: 'badge-spiderman', src: "/images/SPIDERMAN.png", alt: "Spiderman Badge" },
];

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  // `supervisors` holds the main data, including dynamically added badges
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [filteredAndSortedSupervisors, setFilteredAndSortedSupervisors] = useState<Supervisor[]>([]);
  // State for sidebar collapse/expand - Starts TRUE (collapsed)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Initialize supervisors state when the component mounts
  // This ensures existing badges from JSON are preserved and 'badges' array always exists
  useEffect(() => {
    const initialProcessedSupervisors = (rawSupervisorsData as Supervisor[]).map(s => ({
      ...s,
      badges: s.badges || [] // If 'badges' is missing in JSON, provide an empty array
    }));
    setSupervisors(initialProcessedSupervisors);
  }, []); // Empty dependency array means this runs only once on mount

  // --- Native Drag-and-Drop Handlers for SIDEBAR Badges (Source) ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, badgeId: string) => {
    e.dataTransfer.setData("text/plain", badgeId); // Store the badge's ID for retrieval on drop
    // Optional: Add a class to the dragged item for visual feedback
    e.currentTarget.classList.add('dragging-source');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    // Optional: Remove the visual feedback class when dragging ends
    e.currentTarget.classList.remove('dragging-source');
  };
  // --- End Native Drag-and-Drop Handlers for SIDEBAR Badges ---

  // --- Callback to handle badge drop on a SupervisorCard ---
  // This function is passed to each SupervisorCard and updates the main 'supervisors' state
  const handleBadgeDropOnSupervisor = (supervisorEmail: string, droppedBadgeId: string) => {
    setSupervisors(prevSupervisors => {
      return prevSupervisors.map(supervisor => {
        if (supervisor.email === supervisorEmail) {
          // Find the badge that was dropped from the sidebar's palette
          const badgeToAdd = sidebarBadges.find(b => b.id === droppedBadgeId);

          if (badgeToAdd) {
            // Prevent adding the same badge multiple times to one supervisor
            const badgeAlreadyExists = supervisor.badges.some(b => b.id === badgeToAdd.id);
            if (!badgeAlreadyExists) {
              return {
                ...supervisor,
                // Add the new badge to this supervisor's existing badges
                badges: [...supervisor.badges, badgeToAdd]
              };
            }
          }
        }
        return supervisor; // Return supervisor unchanged if not the target or badge already exists
      });
    });
  };

  // Callback to handle badge removal from a SupervisorCard
  const handleBadgeRemoveFromSupervisor = (supervisorEmail: string, badgeIdToRemove: string) => {
    setSupervisors(prevSupervisors => {
      return prevSupervisors.map(supervisor => {
        if (supervisor.email === supervisorEmail) {
          return {
            ...supervisor,
            badges: supervisor.badges.filter(badge => badge.id !== badgeIdToRemove) // Filter out the badge to remove
          };
        }
        return supervisor;
      });
    });
  };

  // Effect to filter and sort supervisors for display in the directory
  useEffect(() => {
    const filtered = supervisors
      .filter((supervisor) => {
        if (searchTerm === '') return true; // Show all if no search term

        const lowerSearchTerm = searchTerm.toLowerCase();
        return (
          supervisor.name.toLowerCase().includes(lowerSearchTerm) ||
          supervisor.title.toLowerCase().includes(lowerSearchTerm) ||
          (supervisor.specialisation &&
            supervisor.specialisation.toLowerCase().includes(lowerSearchTerm)) ||
          supervisor.email.toLowerCase().includes(lowerSearchTerm)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name
    setFilteredAndSortedSupervisors(filtered);
  }, [searchTerm, supervisors]); // Re-run filtering/sorting when search term or supervisor data changes

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="app">
      <h1 className="header">Clinical Supervisor Directory</h1>

      {/* Main Layout Container: Conditional class for sidebar collapse */}
      <div className={`main-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Main Content Area (Left) */}
        <div className="main-content">
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
                <SupervisorCard
                  key={supervisor.email} // Use a unique identifier for key
                  supervisor={supervisor}
                  onBadgeDrop={handleBadgeDropOnSupervisor} // Pass the drop handler to each card
                  onBadgeRemove={handleBadgeRemoveFromSupervisor} // Pass the badge remover function
                />
              ))
            ) : (
              <p className="no-results">No supervisors found matching your search criteria.</p>
            )}
          </div>
        </div>

        {/* Sidebar (Right) with Draggable Badges (Source Palette) */}
        <div className="sidebar">
          {/* Sidebar Toggle Button - uses unicode characters for sleeker arrows */}
          <button
            className="sidebar-toggle"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            aria-expanded={!isSidebarCollapsed}
            aria-controls="sidebar-content"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? '»' : '«'} {/* Unicode right/left pointing double angle quotation mark */}
          </button>

          <div id="sidebar-content" className="sidebar-content">
            <h2 className="sidebar-header">Badges!</h2>
            <div className="sidebar-badges-palette">
              {sidebarBadges.map((badge) => (
                <div
                  key={badge.id}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, badge.id)}
                  onDragEnd={handleDragEnd}
                  className="draggable-badge-item"
                >
                  <img src={badge.src} alt={badge.alt} className="badge-icon" />
                </div>
              ))}
            </div>
            <p className="sidebar-tip">Try dragging badges to profiles!</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        Last updated: July 9, 2025
      </div>
    </div>
  );
}

export default App;



