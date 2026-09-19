export const CATEGORIES = [
  "All",
  "Landscapes",
  "Portraits",
  "Street",
  "Architecture",
  "Wildlife"
];

export const photos = [
  {
    id: "dolomites-morning",
    title: "Alpenglow on the Tre Cime",
    category: "Landscapes",
    location: "Dolomites, Italy",
    date: "2026-07-14",
    aspectRatio: "3/2",
    featured: true,
    description: "First morning light hitting the iconic peaks of Tre Cime di Lavaredo under freezing alpine winds.",
    tags: ["mountains", "alps", "sunrise", "italy", "golden-hour"],
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    exif: {
      camera: "Sony Alpha A7 IV",
      lens: "FE 24-70mm f/2.8 GM II",
      focalLength: "35mm",
      aperture: "f/8.0",
      shutterSpeed: "1/125s",
      iso: "100"
    }
  },
  {
    id: "kyoto-alley",
    title: "Lanterns of Gion",
    category: "Street",
    location: "Kyoto, Japan",
    date: "2026-05-20",
    aspectRatio: "4/5",
    featured: true,
    description: "Quiet cobblestone alleys of Gion just after a spring evening rainfall with reflections on wet stones.",
    tags: ["japan", "kyoto", "night", "street", "rain"],
    src: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
    exif: {
      camera: "Fujifilm X-T5",
      lens: "XF 33mm f/1.4 R LM WR",
      focalLength: "33mm",
      aperture: "f/1.4",
      shutterSpeed: "1/60s",
      iso: "800"
    }
  },
  {
    id: "misty-forest",
    title: "Silence of the Redwoods",
    category: "Landscapes",
    location: "California, USA",
    date: "2026-06-03",
    aspectRatio: "2/3",
    featured: false,
    description: "Thick coastal fog rolling through century-old redwood groves during early dawn.",
    tags: ["forest", "fog", "trees", "california", "moody"],
    src: "https://images.unsplash.com/photo-1448375240586-882707db888b",
    exif: {
      camera: "Sony Alpha A7 IV",
      lens: "FE 70-200mm f/4 G OSS",
      focalLength: "135mm",
      aperture: "f/5.6",
      shutterSpeed: "1/40s",
      iso: "200"
    }
  },
  {
    id: "tokyo-portrait",
    title: "Neon Reverie",
    category: "Portraits",
    location: "Shinjuku, Tokyo",
    date: "2026-05-22",
    aspectRatio: "3/4",
    featured: true,
    description: "Ambient street portrait bathed in the vibrant cyan and magenta lights of Shinjuku's neon signs.",
    tags: ["portrait", "neon", "tokyo", "cyberpunk", "night"],
    src: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6",
    exif: {
      camera: "Sony Alpha A7 IV",
      lens: "Sigma 85mm f/1.4 DG DN Art",
      focalLength: "85mm",
      aperture: "f/1.8",
      shutterSpeed: "1/160s",
      iso: "640"
    }
  },
  {
    id: "reykjavik-minimal",
    title: "Nordic Monolith",
    category: "Architecture",
    location: "Reykjavik, Iceland",
    date: "2026-03-11",
    aspectRatio: "3/2",
    featured: false,
    description: "Geometric glass facades of Harpa Concert Hall capturing shifting arctic sunlight.",
    tags: ["iceland", "architecture", "minimal", "glass", "geometry"],
    src: "https://images.unsplash.com/photo-1513694203232-719a280e022f",
    exif: {
      camera: "Fujifilm X-T5",
      lens: "XF 16-55mm f/2.8 R LM WR",
      focalLength: "24mm",
      aperture: "f/9.0",
      shutterSpeed: "1/320s",
      iso: "125"
    }
  },
  {
    id: "wild-stag",
    title: "Guardian of the Glen",
    category: "Wildlife",
    location: "Highlands, Scotland",
    date: "2026-04-18",
    aspectRatio: "3/2",
    featured: true,
    description: "A red stag pausing amidst heather and rolling mist in the Scottish Highlands.",
    tags: ["wildlife", "scotland", "stag", "nature", "highlands"],
    src: "https://images.unsplash.com/photo-1500463959177-e0869687df26",
    exif: {
      camera: "Sony Alpha A7 IV",
      lens: "FE 200-600mm f/5.6-6.3 G OSS",
      focalLength: "400mm",
      aperture: "f/6.3",
      shutterSpeed: "1/1000s",
      iso: "500"
    }
  },
  {
    id: "desert-solitude",
    title: "Dune Curves at Sunset",
    category: "Landscapes",
    location: "Namib Desert, Namibia",
    date: "2026-02-09",
    aspectRatio: "16/9",
    featured: false,
    description: "Sculpted sand ridges casting razor-sharp shadows during the final golden minutes of sunset.",
    tags: ["desert", "sand", "minimal", "namibia", "shadows"],
    src: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9",
    exif: {
      camera: "Sony Alpha A7 IV",
      lens: "FE 24-70mm f/2.8 GM II",
      focalLength: "50mm",
      aperture: "f/11.0",
      shutterSpeed: "1/80s",
      iso: "100"
    }
  },
  {
    id: "candid-elder",
    title: "The Watchmaker",
    category: "Portraits",
    location: "Geneva, Switzerland",
    date: "2026-07-28",
    aspectRatio: "4/5",
    featured: false,
    description: "An artisan at work in his workshop, illuminated solely by a small brass desk lamp.",
    tags: ["portrait", "craft", "candid", "switzerland", "chiaroscuro"],
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    exif: {
      camera: "Fujifilm X-T5",
      lens: "XF 33mm f/1.4 R LM WR",
      focalLength: "33mm",
      aperture: "f/2.0",
      shutterSpeed: "1/100s",
      iso: "400"
    }
  },
  {
    id: "brooklyn-bridge",
    title: "Steel & Suspension",
    category: "Architecture",
    location: "New York, USA",
    date: "2026-01-15",
    aspectRatio: "4/5",
    featured: false,
    description: "Gothic arches framing the Manhattan skyline against a moody overcast winter morning.",
    tags: ["new-york", "architecture", "bridge", "monochrome", "urban"],
    src: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25",
    exif: {
      camera: "Sony Alpha A7 IV",
      lens: "FE 24-70mm f/2.8 GM II",
      focalLength: "28mm",
      aperture: "f/8.0",
      shutterSpeed: "1/200s",
      iso: "160"
    }
  },
  {
    id: "monsoon-cycle",
    title: "Mumbai in the Downpour",
    category: "Street",
    location: "Mumbai, India",
    date: "2026-08-04",
    aspectRatio: "3/2",
    featured: true,
    description: "A cyclist navigating waterlogged streets under vibrant yellow umbrellas during the monsoon peak.",
    tags: ["india", "mumbai", "monsoon", "street", "rain", "color"],
    src: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da",
    exif: {
      camera: "Fujifilm X-T5",
      lens: "XF 23mm f/2.0 R WR",
      focalLength: "23mm",
      aperture: "f/2.8",
      shutterSpeed: "1/500s",
      iso: "320"
    }
  },
  {
    id: "snow-owl",
    title: "Eyes of the Arctic",
    category: "Wildlife",
    location: "Lapland, Finland",
    date: "2026-01-29",
    aspectRatio: "1/1",
    featured: false,
    description: "Intense golden stare of a snowy owl perched upon a frost-covered pine bough.",
    tags: ["wildlife", "owl", "bird", "arctic", "snow"],
    src: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23",
    exif: {
      camera: "Sony Alpha A7 IV",
      lens: "FE 200-600mm f/5.6-6.3 G OSS",
      focalLength: "550mm",
      aperture: "f/6.3",
      shutterSpeed: "1/1600s",
      iso: "800"
    }
  },
  {
    id: "spiral-staircase",
    title: "Vortex of Modernity",
    category: "Architecture",
    location: "Vatican Museums, Rome",
    date: "2026-07-08",
    aspectRatio: "2/3",
    featured: true,
    description: "Looking down the double helix staircase designed by Giuseppe Momo.",
    tags: ["rome", "spiral", "architecture", "vatican", "symmetry"],
    src: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7",
    exif: {
      camera: "Sony Alpha A7 IV",
      lens: "FE 16-35mm f/2.8 GM",
      focalLength: "16mm",
      aperture: "f/7.1",
      shutterSpeed: "1/60s",
      iso: "400"
    }
  }
];
