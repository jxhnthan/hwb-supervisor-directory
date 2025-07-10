import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

// Define the type for a single badge
type Badge = {
  id: string;
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
  bio?: string | string[];
  photoUrl?: string;
  badges: Badge[];
};

type SupervisorCardProps = {
  supervisor: Supervisor;
  onBadgeDrop: (supervisorEmail: string, droppedBadgeId: string) => void;
  onBadgeRemove: (supervisorEmail: string, badgeIdToRemove: string) => void;
};

export function SupervisorCard({ supervisor, onBadgeDrop, onBadgeRemove }: SupervisorCardProps) {
  const [showBio, setShowBio] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showRemoveBadgeMessage, setShowRemoveBadgeMessage] = useState(false); // State for custom message

  const cardRef = useRef<HTMLDivElement>(null); // To target the card for screenshot

  // Function to render bio content, handling both string and array of strings
  const renderBio = (bioContent: string | string[]) => {
    if (Array.isArray(bioContent)) {
      return bioContent.map((paragraph, idx) => (
        <p key={idx}>{paragraph}</p>
      ));
    } else {
      return <p>{bioContent}</p>;
    }
  };

  // Drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedBadgeId = e.dataTransfer.getData("text/plain");

    if (droppedBadgeId) {
      onBadgeDrop(supervisor.email, droppedBadgeId);
    }
  };

  // Handles badge click for removal, using a custom message instead of window.confirm
  const handleBadgeClick = (badgeId: string) => {
    // Show a temporary message to indicate badge removal
    setShowRemoveBadgeMessage(true);
    setTimeout(() => {
      onBadgeRemove(supervisor.email, badgeId);
      setShowRemoveBadgeMessage(false);
    }, 500); // Remove after 0.5 seconds
  };

  // Handles downloading the profile card as a PNG
  const handleDownloadProfile = async () => {
    if (!cardRef.current) {
      console.error("Card ref is not available for screenshot.");
      return;
    }

    setIsDownloading(true);

    // Get a reference to the main layout and sidebar elements
    // This is a direct DOM manipulation for a specific visual effect during screenshot.
    const mainLayout = document.querySelector('.main-layout');
    const sidebar = document.querySelector('.sidebar');
    let wasSidebarCollapsed = false; // To store original sidebar state

    // Temporarily hide the sidebar if it's currently visible
    if (mainLayout && sidebar) {
      // Check if sidebar is currently NOT collapsed (i.e., visible)
      if (!mainLayout.classList.contains('sidebar-collapsed')) {
        mainLayout.classList.add('sidebar-collapsed');
        wasSidebarCollapsed = true; // Mark that we collapsed it
        // Wait for CSS transition to complete (0.3s as per --transition-speed)
        await new Promise(resolve => setTimeout(resolve, 350));
      }
    }

    // Temporarily expand bio if it's collapsed, to capture full content
    const bioElement = cardRef.current.querySelector('.supervisor-bio');
    const wasBioCollapsed = bioElement && bioElement.classList.contains('bio-hide');

    if (wasBioCollapsed) {
      setShowBio(true); // Expand bio before screenshot
      await new Promise(resolve => setTimeout(resolve, 100)); // Give React a moment to render
    }

    try {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true, // Essential if your images are hosted on a different domain
        scale: 2, // Increase scale for higher resolution image
        backgroundColor: null, // Ensure transparent background if card has rounded corners
      });

      // Reset bio state if it was temporarily expanded
      if (wasBioCollapsed) {
        setShowBio(false);
      }

      // Revert sidebar state if we temporarily collapsed it
      if (wasSidebarCollapsed && mainLayout) {
        mainLayout.classList.remove('sidebar-collapsed');
        // No need to wait for transition here, as the user already has the screenshot
      }

      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png'); // Get image data as PNG
      link.download = `${supervisor.name.replace(/\s+/g, '-')}-profile.png`; // Set filename
      document.body.appendChild(link); // Append to body (required for click)
      link.click(); // Programmatically click the link to start download
      document.body.removeChild(link); // Clean up the link element

    } catch (error) {
      console.error("Error capturing profile:", error);
      // Display a custom error message instead of alert
      // You might want a more sophisticated modal for this
      const errorMessage = document.createElement('div');
      errorMessage.textContent = "Failed to capture profile image. Please try again.";
      errorMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #f8d7da;
        color: #721c24;
        padding: 15px 25px;
        border-radius: 8px;
        border: 1px solid #f5c6cb;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        font-family: 'Inter', sans-serif;
      `;
      document.body.appendChild(errorMessage);
      setTimeout(() => document.body.removeChild(errorMessage), 3000); // Remove after 3 seconds

    } finally {
      setIsDownloading(false);
    }
  };


  return (
    <div
      ref={cardRef}
      className={`supervisor-card ${isDragOver ? 'drag-over-target' : ''}`}
      aria-expanded={showBio}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="supervisor-header">
        {supervisor.photoUrl && (
          <img
            src={supervisor.photoUrl}
            alt={supervisor.name}
            className="supervisor-photo"
          />
        )}
        <div className="info">
          {/* Download Button - Moved slightly and icon instead of text */}
          <button
            className="download-profile-button"
            onClick={handleDownloadProfile}
            disabled={isDownloading}
            title="Download Profile as PNG"
          >
            {isDownloading ? '...' : '📸'} {/* Using camera emoji */}
          </button>

          <h2 className="supervisor-name">{supervisor.name}</h2>
          <p className="supervisor-title">{supervisor.title}</p>

          <div className="divider-small" />

          {supervisor.specialisation && (
            <p className="supervisor-specialisation">{supervisor.specialisation}</p>
          )}

          {/* Display badges currently assigned to this supervisor */}
          <div className="badges-container">
            {supervisor.badges.length > 0 ? (
              supervisor.badges.map((badge) => (
                <img
                  key={badge.id}
                  src={badge.src}
                  alt={badge.alt}
                  className="badge-icon badge-clickable"
                  onClick={() => handleBadgeClick(badge.id)}
                  title={`Click to remove ${badge.alt}`}
                />
              ))
            ) : (
              <p className="no-badges-yet">Drag badges here to add!</p>
            )}
          </div>
        </div>
      </div>

      <div className="divider" />

      <div className="contact">
        <p>
          Email: <a href={`mailto:${supervisor.email}`}>{supervisor.email}</a>
        </p>
        {supervisor.phone && <p>Phone: {supervisor.phone}</p>}
      </div>

      {supervisor.bio && (
        <>
          <div className={`supervisor-bio ${showBio ? 'bio-show' : 'bio-hide'}`}>
            {renderBio(supervisor.bio)}
          </div>
          <p
            className="bio-toggle"
            onClick={() => setShowBio(!showBio)}
            role="button"
            tabIndex={0}
            aria-label={showBio ? 'Collapse bio' : 'Expand bio'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowBio(!showBio);
              }
            }}
          >
            {showBio ? 'Show less ▲' : 'Read more ▼'}
          </p>
        </>
      )}

      {/* Custom message for badge removal */}
      {showRemoveBadgeMessage && (
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#d1e7dd',
          color: '#0f5132',
          padding: '8px 15px',
          borderRadius: '5px',
          fontSize: '0.85rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 10,
          whiteSpace: 'nowrap'
        }}>
          Badge removed!
        </div>
      )}
    </div>
  );
}





