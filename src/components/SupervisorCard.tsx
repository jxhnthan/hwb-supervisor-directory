import React, { useState, useRef } from 'react'; // Import useRef
import html2canvas from 'html2canvas'; // Import html2canvas

// ... (Badge and Supervisor types remain unchanged) ...

type Badge = {
  id: string;
  src: string;
  alt: string;
};

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

  const cardRef = useRef<HTMLDivElement>(null); // To target the card for screenshot

  const renderBio = (bioContent: string | string[]) => {
    if (Array.isArray(bioContent)) {
      return bioContent.map((paragraph, idx) => (
        <p key={idx}>{paragraph}</p>
      ));
    } else {
      return <p>{bioContent}</p>;
    }
  };

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

  const handleBadgeClick = (badgeId: string) => {
    if (window.confirm("Remove this badge from the profile?")) {
      onBadgeRemove(supervisor.email, badgeId);
    }
  };

  const handleDownloadProfile = async () => {
    if (!cardRef.current) {
      console.error("Card ref is not available for screenshot.");
      return;
    }

    setIsDownloading(true);

    try {
      // Temporarily expand bio if it's collapsed, to capture full content
      const wasBioCollapsed = !showBio && supervisor.bio && (Array.isArray(supervisor.bio) ? supervisor.bio.length > 1 : (supervisor.bio as string).length > 100); // Check if bio is likely truncated
      if (wasBioCollapsed) {
        setShowBio(true); // Expand bio before screenshot
        await new Promise(resolve => setTimeout(resolve, 100)); // Give React a moment to render
      }

      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        // scale: 2, // Consider adding this for higher resolution images
      });

      // Reset bio state if it was temporarily expanded
      if (wasBioCollapsed) {
        setShowBio(false);
      }

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${supervisor.name.replace(/\s+/g, '-')}-profile.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Error capturing profile:", error);
      alert("Failed to capture profile image. Please try again.");
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
            {isDownloading ? '...' : '📸'} {/* Using camera emoji or Unicode download icon */}
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
    </div>
  );
}





