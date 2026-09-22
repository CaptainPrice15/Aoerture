export const siteConfig = {
  photographer: {
    name: "Gourav",
    handle: "@gourav.visuals",
    title: "Visual Showcase",
    bio: "Curated photography collection streamed directly from ImageKit cloud media storage with responsive optimization.",
    location: "India",
    avatar: "https://ik.imagekit.io/fm5abuzok/Pics/ChatGPT%20Image%20Apr%203,%202025,%2009_39_36%20PM.png?tr=w-400,h-400,fo-auto",
    stats: {
      photosCount: "92",
      locationsCount: "ImageKit Cloud",
      experience: "Visuals",
    },
    social: {
      instagram: "https://instagram.com",
      twitter: "https://x.com",
      github: "https://github.com",
      email: "gourav@example.com"
    },
    gearList: [
      { category: "Cloud Storage", items: ["ImageKit.io Media Library", "Global CDN Streaming"] },
      { category: "Optimization", items: ["Auto WebP / AVIF format", "On-the-fly transformations"] },
      { category: "Display", items: ["Responsive Masonry Grid", "Full-res Lightbox & EXIF drawer"] }
    ]
  },
  imagekit: {
    // Verified user endpoint
    urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/fm5abuzok",
    defaultFolder: "Pics"
  }
};
