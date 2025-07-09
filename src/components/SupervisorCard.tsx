import { useState } from 'react';

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
  bio?: string | string[]; // support string or array of paragraphs
  photoUrl?: string;
  badges?: Badge[];
};

export function SupervisorCard({ supervisor }: { supervisor: Supervisor }) {
  const [showBio, setShowBio] = useState(false);

  return (
    <div className="card" aria-expanded={showBio}>
      <div className="card-header">
        {supervisor.photoUrl && (
          <img
            src={supervisor.photoUrl}
            alt={supervisor.name}
            className="profile-pic"
          />
        )}
        <div className="info">
          <h2 className="name">{supervisor.name}</h2>
          <p className="title">{supervisor.title}</p>

          {/* Small divider between title and specialisation */}
          <div className="divider-small" />

          {supervisor.specialisation && (
            <p className="specialisation">{supervisor.specialisation}</p>
          )}

          {/* BADGES */}
          {supervisor.badges && supervisor.badges.length > 0 && (
            <div className="badges">
              {supervisor.badges.map((badge, index) => (
                <img
                  key={index}
                  src={badge.src}
                  alt={badge.alt}
                  className="badge-image"
                />
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
          <div className={`bio ${showBio ? 'bio-show' : 'bio-hide'}`}>
            {Array.isArray(supervisor.bio)
              ? supervisor.bio.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))
              : supervisor.bio}
          </div>
          <p
            className="bio-toggle"
            onClick={() => setShowBio(!showBio)}
            role="button"
            tabIndex={0}
            aria-label={showBio ? 'Collapse bio' : 'Expand bio'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setShowBio(!showBio);
            }}
          >
            {showBio ? 'Show less ▲' : 'Read more ▼'}
          </p>
        </>
      )}
    </div>
  );
}






