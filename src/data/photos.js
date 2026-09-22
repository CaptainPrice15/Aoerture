export const CATEGORIES = [
  "All",
  "Pics",
  "Videos"
];

export const INITIAL_FOLDERS = [
  { name: "Pics", path: "/Pics" },
  { name: "Darjeeling", path: "/Darjeeling" },
  { name: "Sikkim", path: "/Sikkim" }
];

/**
 * Static photo & video catalogue
 * 
 * 💡 Pro-tip:
 * 1. Automatic Live Sync (Zero manual editing):
 *    Add your `IMAGEKIT_PRIVATE_KEY=...` to `.env` (and Vercel environment variables).
 *    Every new picture and video uploaded to your ImageKit account will show up automatically!
 * 
 * 2. Manual Catalogue:
 *    If you don't want to use an API key, add your uploaded photo or video paths directly below.
 *    For videos, specify `mediaType: "video"` and the path to your video (e.g. `/Pics/video.mp4`).
 */
export const photos = [
  {
    id: "uploaded-pics-chatgpt-image",
    title: "Frame 01",
    category: "Pics",
    folder: "Pics",
    folderPath: "/Pics",
    mediaType: "photo",
    location: "ImageKit /Pics Cloud",
    date: "2025-04-03",
    aspectRatio: "1/1",
    featured: true,
    description: "Original photo streamed directly from your ImageKit /Pics cloud folder with automatic responsive optimization.",
    tags: ["imagekit", "pics-folder", "cloud", "featured"],
    src: "/Pics/ChatGPT%20Image%20Apr%203,%202025,%2009_39_36%20PM.png",
    exif: {
      camera: "Cloud Uploaded Photo",
      lens: "ImageKit Media Library",
      focalLength: "Native",
      aperture: "Auto",
      shutterSpeed: "Instant",
      iso: "20GB Free CDN"
    }
  }
];
