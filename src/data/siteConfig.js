export const siteConfig = {
  photographer: {
    name: "Gourav",
    handle: "@gourav.visuals",
    title: "Landscape & Street Photographer",
    bio: "Chasing fleeting light, dramatic vistas, and candid urban rhythms. Creating visual stories through deep contrasts, natural color palettes, and thoughtful composition.",
    location: "India",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    stats: {
      photosCount: "12+",
      locationsCount: "8 Countries",
      experience: "5+ Years",
    },
    social: {
      instagram: "https://instagram.com",
      twitter: "https://x.com",
      github: "https://github.com",
      email: "gourav@example.com"
    },
    gearList: [
      { category: "Camera Bodies", items: ["Sony Alpha A7 IV", "Fujifilm X-T5"] },
      { category: "Lenses", items: ["Sony FE 24-70mm f/2.8 GM II", "Sony FE 70-200mm f/4 G OSS", "Fujinon XF 33mm f/1.4 R LM WR", "Sigma 85mm f/1.4 DG DN Art"] },
      { category: "Accessories", items: ["Peak Design Carbon Fiber Tripod", "PolarPro QuartzLine ND Filters", "Shimoda Action X30 V2 Backpack"] },
      { category: "Editing", items: ["Adobe Lightroom Classic", "Photoshop", "Capture One Pro"] }
    ]
  },
  imagekit: {
    // Default demo endpoint; user can replace this with their own free ImageKit ID in .env
    urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/demo",
    defaultFolder: "photography"
  }
};
