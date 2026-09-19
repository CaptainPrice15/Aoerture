# 📸 Aperture & Light — Modern Photo Portfolio

A high-performance, responsive photography showcase website built with **React**, **Tailwind CSS**, and powered by **ImageKit.io** free cloud media storage & CDN.

![Showcase Preview](https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Features

- **Fluid Masonry Layout**: Responsive multi-column grid (1 to 4 columns) adapting seamlessly to portrait, landscape, and panoramic aspect ratios without layout shifts.
- **Progressive Blur-Up Loading**: Instant low-quality image placeholder (LQIP) blurred in the background while high-resolution photos stream in.
- **Full-Screen Lightbox**: Deep zoom, pinch-to-zoom, filmstrip thumbnails, keyboard arrow navigation (`←`, `→`, `ESC`), and swipe gestures.
- **EXIF Metadata Inspector**: Slide-over drawer revealing camera body, lens, focal length, aperture, shutter speed, and ISO.
- **Dynamic Category & Search Filtering**: Filter by category (`Landscapes`, `Street`, `Portraits`, `Architecture`, `Wildlife`) or search by camera gear, place, or tag.
- **Dark & Light Mode**: Default cinematic dark theme with one-click toggle to light mode.
- **Photographer Bio & Gear Bag**: Dedicated modal highlighting your equipment and commercial licensing/contact info.
- **ImageKit.io Cloud CDN**: Free 20 GB/month bandwidth, automatic WebP/AVIF format delivery, and URL-based transformations.

---

## 🚀 Quick Start

### 1. Run Locally

```bash
# Clone or open the project folder
cd Pic_display

# Install dependencies (already installed if setting up here)
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## ☁️ How to Connect Your Free ImageKit.io Account

1. **Sign up**: Go to [imagekit.io](https://imagekit.io) and register for a **Forever Free account** (20 GB bandwidth/month, no credit card needed).
2. **Find Your URL-Endpoint**:
   - In your ImageKit dashboard, open **Developer Options**.
   - Copy your **URL-endpoint** (e.g. `https://ik.imagekit.io/your_id`).
3. **Configure `.env`**:
   - Open `.env` in this project and set:
     ```env
     VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
     ```
4. **Upload Photos**:
   - Go to ImageKit's **Media Library** tab and upload your pictures into a folder (e.g. `photos/`).
5. **Add Photos to Catalogue**:
   - Open [`src/data/photos.js`](src/data/photos.js) and add an entry with your ImageKit path:
     ```javascript
     {
       id: "mountain-sunrise",
       title: "Dawn on the Ridge",
       category: "Landscapes",
       location: "Alps",
       date: "2026-09-01",
       aspectRatio: "3/2",
       src: "/photos/mountain-sunrise.jpg", // Your ImageKit relative path
       exif: {
         camera: "Sony A7 IV",
         lens: "24-70mm f/2.8",
         focalLength: "35mm",
         aperture: "f/8.0",
         shutterSpeed: "1/250s",
         iso: "100"
       }
     }
     ```

---

## 🛠️ Project Structure

```text
Pic_display/
├── public/
│   └── favicon.svg              # Aperture icon favicon
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Glassmorphism header with controls
│   │   ├── HeroSection.jsx      # Bio, stats, and social links
│   │   ├── FilterBar.jsx        # Category pills, search bar, sort dropdown
│   │   ├── GalleryGrid.jsx      # Responsive Masonry image grid
│   │   ├── PhotoCard.jsx        # Image card with blur-up loader & hover info
│   │   ├── LightboxModal.jsx    # Fullscreen viewer with zoom & thumbnails
│   │   ├── ExifDrawer.jsx       # Camera EXIF technical drawer
│   │   ├── AboutModal.jsx       # Photographer bio & gear bag
│   │   ├── ImageKitGuideModal.jsx # In-app ImageKit setup guide
│   │   └── Footer.jsx           # Copyright & smooth back-to-top
│   ├── data/
│   │   ├── photos.js            # Photo catalogue with EXIF & tags
│   │   └── siteConfig.js        # Photographer details & ImageKit settings
│   ├── hooks/
│   │   └── useTheme.js          # Dark/light theme persistence
│   ├── utils/
│   │   └── imagekit.js          # On-the-fly URL transformation builder
│   ├── App.jsx                  # Main application orchestrator
│   ├── index.css                # Tailwind directives & styles
│   └── main.jsx                 # Application entry point
├── .env                         # Local environment variables
├── .env.example                 # Example environment variables
├── package.json
└── vite.config.js
```

---

## 🚢 Deploying to Production (Free)

### Deploy to Vercel
1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import this repository.
4. In **Environment Variables**, add:
   - `VITE_IMAGEKIT_URL_ENDPOINT` = `https://ik.imagekit.io/your_id`
5. Click **Deploy**.

### Deploy to Netlify
1. Go to [netlify.com](https://netlify.com) and select **"Add new site"** -> **"Import an existing project"**.
2. Connect your GitHub repository.
3. Build command: `npm run build`, Publish directory: `dist`.
4. Add your `VITE_IMAGEKIT_URL_ENDPOINT` environment variable.
5. Click **Deploy**.
