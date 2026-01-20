# Preservice Attendance

An offline-first attendance tracking system for executives in a preservice community, implemented using Next.js 14 with TypeScript, Tailwind CSS, and PWA features.

## Features

- ✅ **Offline-First Architecture**: Works seamlessly without internet connection
- ✅ **IndexedDB Storage**: Local data persistence for offline functionality
- ✅ **NextAuth.js Authentication**: Secure user authentication and session management
- ✅ **PWA Support**: Progressive Web App with service worker for offline capabilities
- ✅ **Real-time Attendance Tracking**: Mark attendance as present, late, or absent
- ✅ **Excuses Submission**: Submit and track excuses for absences
- ✅ **Automatic Sync**: Automatic synchronization when connection is restored
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile devices
- ✅ **Role-based Access**: Support for both executives and admins

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: IndexedDB (via idb library)
- **PWA**: next-pwa
- **Offline Sync**: Custom sync logic

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/moladeji2302025-ctrl/Preservice-attendance.git
cd Preservice-attendance
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration (especially `NEXTAUTH_SECRET` for production)

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Usage

### First Time Setup

1. Navigate to the registration page (`/auth/register`)
2. Create an account with your details
3. Select your role (Executive or Admin)
4. Login with your credentials

### Marking Attendance

1. Login to your account
2. Click "Mark Attendance" from the dashboard
3. Select your status (Present, Late, or Absent)
4. Optionally add a location
5. Submit the attendance record

### Submitting Excuses

1. Navigate to the Excuses page
2. Click "Submit Excuse"
3. Select the absence you want to excuse
4. Provide a detailed reason
5. Submit the excuse

### Offline Mode

- The app automatically detects when you're offline
- All data is stored locally in IndexedDB
- When connection is restored, data syncs automatically
- You can also manually trigger sync from the navigation bar

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth configuration
│   │   ├── register/     # User registration
│   │   ├── attendance/   # Attendance endpoints
│   │   └── excuses/      # Excuses endpoints
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard page
│   ├── attendance/       # Attendance marking page
│   ├── excuses/          # Excuses page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # Reusable components
├── lib/
│   ├── auth/            # Authentication utilities
│   ├── db/              # Database schema and IndexedDB
│   └── sync/            # Offline sync logic
├── public/              # Static assets and PWA files
└── package.json
```

## Security Features

- Password hashing with bcrypt
- Secure session management with NextAuth.js
- Client-side validation
- Protected API routes
- Role-based access control

## Performance Optimizations

- Next.js App Router for optimal performance
- Service Worker for offline caching
- IndexedDB for efficient local storage
- Lazy loading components
- Optimized images and assets

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers with PWA support

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
