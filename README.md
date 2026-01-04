<div align="center">
  <h1>🎨 Creative Showcase</h1>
  <p><strong>Where Artists Come to Shine</strong></p>
  <p>A modern full-stack web application where artists can upload, showcase, and share their digital artwork.</p>

  <p>
    <a href="https://full-stack-web-application-creative.vercel.app/">
      <img src="https://img.shields.io/badge/Live%20Demo-Visit%20Now-brightgreen?style=for-the-badge&logo=vercel" alt="Live Demo">
    </a>
    <a href="https://github.com/debangshucode/Full-Stack-Web-Application-Creative-Showcase">
      <img src="https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github" alt="GitHub">
    </a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react" alt="React">
    <img src="https://img.shields.io/badge/Bolt Database-Backend-3ECF8E?style=flat-square&logo=supabase" alt="Supabase">
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind">
    <img src="https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  </p>
</div>

---

## 📖 About

**Creative Showcase** is a comprehensive platform built for artists and creators to display their digital masterpieces. With a stunning animated landing page featuring WebGL light rays, secure authentication, and a responsive masonry-style gallery, it provides everything an artist needs to build their online presence.

Join a vibrant community where you can upload unlimited artwork, create your public profile, and connect with fellow creatives in a secure, beautifully designed environment.

---

## ✨ Features

### 🌐 Public Access
- **Animated Landing Page** - Eye-catching WebGL light rays hero section
- **Public Gallery** - Browse all uploaded artworks in a responsive masonry layout
- **User Profiles** - Visit any artist's profile at `/profile/:username`
- **Responsive Design** - Seamless experience across all devices

### 🔐 Authentication & Security
- **Email & Password Authentication** - Powered by Bolt Database Auth
- **Protected Routes** - Dashboard accessible only to authenticated users
- **Row Level Security (RLS)** - Database-level security on all tables
- **Data Ownership** - Users can only modify their own content

### 🎨 Artist Dashboard
- **Image Upload** - Select and upload artwork from your device
- **Live Preview** - Preview images before uploading
- **Secure Storage** - Images stored in Bolt Database Storage buckets
- **Manage Artwork** - View, edit, and delete your uploaded pieces
- **Instant Feedback** - Toast notifications for all actions

### 🎯 User Experience
- **Dark/Light Mode** - Toggle between themes for comfortable viewing
- **Smooth Animations** - Polished transitions throughout the app
- **Toast Notifications** - Clear success and error messages
- **Fast Performance** - Optimized loading and rendering

---

## 🛠️ Tech Stack

### Frontend
- **React** - UI library for building interactive interfaces
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **react-hot-toast** - Toast notifications
- **lucide-react** - Beautiful icon library
- **OGL** - WebGL library for visual effects

### Backend
- **Bolt Database** - Complete backend solution
  - PostgreSQL database
  - Authentication service
  - Storage buckets
  - Row Level Security (RLS)

---

## 🗄️ Database Schema

### `profiles` Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key, references `auth.users` |
| `username` | text | Unique username for the artist |
| `full_name` | text | Display name |
| `bio` | text | Artist biography |
| `avatar_url` | text | Profile picture URL |
| `created_at` | timestamp | Account creation date |
| `updated_at` | timestamp | Last profile update |

### `images` Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Foreign key → `profiles.id` |
| `title` | text | Artwork title |
| `description` | text | Artwork description |
| `image_url` | text | Image file URL |
| `created_at` | timestamp | Upload date |
| `views` | integer | View count |

> **Note:** User profiles are automatically created via database trigger on signup.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase


