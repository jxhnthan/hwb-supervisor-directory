# Clinical Supervisor Directory
A React-based interactive directory for clinical supervisors, featuring searchable and filterable supervisor profiles with drag-and-drop badge assignment.
---

## Overview
This app provides a directory of clinical supervisors with their profiles, specialisations, and badges. Users can:
- Search supervisors by name, title, email, or specialisation.
- Filter supervisors by specialisation using dynamically generated filter buttons.
- Assign badges to supervisors by dragging badges from a sidebar palette onto their profiles.
- Remove badges from supervisors directly.
- Collapse or expand the sidebar containing badges for better screen space usage.

---
## Features
- **Search and Filter:** Quickly find supervisors by typing keywords or selecting specialisation filters.
- **Drag-and-Drop Badges:** Easily assign badges from a sidebar to supervisor profiles.
- **Badge Removal:** Remove badges from a supervisor profile by clicking a remove action (implemented in `SupervisorCard`).
- **Dynamic Specialisation Filters:** Specialisation filters are automatically generated based on the data.
- **Responsive UI:** Sidebar can be toggled (collapsed/expanded) for more screen space.
- **Live Updates:** Supervisors and badges are managed in React state for real-time changes.

---

## Technologies Used

- React (with TypeScript)
- CSS (via `App.css`)
- Native HTML5 Drag-and-Drop API
- React Hooks (`useState`, `useEffect`)
---

## Project Structure
- `App.tsx` — Main component managing state, search, filters, drag-drop, and rendering.
- `components/SupervisorCard.tsx` — Individual supervisor profile card with badges.
- `data/supervisors.json` — Supervisor data.
- `public/images/` — Badge and supervisor photos.
- `App.css` — Styling.
---

## Supervisor Data Model
```ts
type Badge = {
  id: string;     // Unique badge identifier
  src: string;    // Badge image source URL
  alt: string;    // Alt text for accessibility
};

type Supervisor = {
  name: string;
  title: string;
  email: string;
  phone?: string;
  specialisation?: string;  // Comma-separated specialisations
  bio?: string[];           // Bio paragraphs
  badges: Badge[];          // Assigned badges
  photoUrl?: string;        // Profile photo URL
};


