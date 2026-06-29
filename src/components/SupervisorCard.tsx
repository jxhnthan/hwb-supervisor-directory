import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

// Define the type for a supervisor
type Supervisor = {
  name: string;
  title: string;
  email: string;
  phone?: string;
  specialisation?: string;
  bio?: string | string[];
  photoUrl?: string;
};

type SupervisorCardProps = {
  supervisor: Supervisor;
};

export function SupervisorCard({ supervisor }: SupervisorCardProps) {
  const [showBio, setShowBio] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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

  // Handles downloading the profile card as a PNG
  const handleDownloadProfile = async () => {
    if (!cardRef.current) {
      console.error("Card ref is not available for screenshot.");
      return;
    }

    setIsDownloading(true);

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
      className="supervisor-card"
      aria-expanded={showBio}
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
            {isDownloading ? '...' : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            )}
          </button>

          <h2 className="supervisor-name">{supervisor.name}</h2>
          <p className="supervisor-title">{supervisor.title}</p>

          <div className="divider-small" />

          {supervisor.specialisation && (
            <div className="specialisation-pills">
              {supervisor.specialisation.split(',').map((spec, idx) => (
                <span key={idx} className="specialisation-chip">{spec.trim()}</span>
              ))}
            </div>
          )}
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
          <button
            className="bio-toggle"
            onClick={() => setShowBio(!showBio)}
            aria-label={showBio ? 'Collapse bio' : 'Expand bio'}
          >
            {showBio ? 'Show less ▲' : 'Read more ▼'}
          </button>
        </>
      )}
    </div>
  );
}





