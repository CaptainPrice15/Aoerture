/**
 * Portfolio Analytics Engine
 * Tracks views, downloads, favorites (loves), and time spent viewing media.
 * Data is stored in this browser only. It is not a source of global analytics.
 */

// v2 intentionally starts clean; the old store contained generated demo counts.
const ANALYTICS_STORAGE_KEY = 'aperture_analytics_store_v2';

// Helper to get raw store
export const getAnalyticsStore = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read analytics from localStorage:', e);
  }
  return {};
};

// Helper to save store
export const saveAnalyticsStore = (store) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(store));
    // Dispatch a custom event so active dashboard components can update live
    window.dispatchEvent(new CustomEvent('aperture_analytics_updated'));
  } catch (e) {
    console.error('Failed to save analytics to localStorage:', e);
  }
};

/**
 * Record a photo view
 */
export const recordPhotoView = (photoId) => {
  if (!photoId) return;
  const store = getAnalyticsStore();
  const current = store[photoId] || { views: 0, downloads: 0, loves: 0, timeSpent: 0 };
  
  store[photoId] = {
    ...current,
    views: (current.views || 0) + 1,
    lastViewedAt: Date.now()
  };
  saveAnalyticsStore(store);
};

/**
 * Record a photo download
 */
export const recordPhotoDownload = (photoId) => {
  if (!photoId) return;
  const store = getAnalyticsStore();
  const current = store[photoId] || { views: 0, downloads: 0, loves: 0, timeSpent: 0 };

  store[photoId] = {
    ...current,
    downloads: (current.downloads || 0) + 1,
    lastViewedAt: Date.now()
  };
  saveAnalyticsStore(store);
};

/**
 * Record a photo love / favorite
 */
export const recordPhotoLove = (photoId, isLoved = true) => {
  if (!photoId) return;
  const store = getAnalyticsStore();
  const current = store[photoId] || { views: 0, downloads: 0, loves: 0, timeSpent: 0 };

  const delta = isLoved ? 1 : -1;
  const updatedLoves = Math.max(0, (current.loves || 0) + delta);

  store[photoId] = {
    ...current,
    loves: updatedLoves
  };
  saveAnalyticsStore(store);
};

/**
 * Record time spent actively viewing a photo (in seconds)
 */
export const recordTimeSpent = (photoId, durationSeconds) => {
  if (!photoId || !durationSeconds || durationSeconds <= 0) return;
  // Cap single session at 15 minutes (900 seconds) to prevent idle tab skew
  const sanitizedDuration = Math.min(Math.round(durationSeconds), 900);
  if (sanitizedDuration < 1) return;

  const store = getAnalyticsStore();
  const current = store[photoId] || { views: 0, downloads: 0, loves: 0, timeSpent: 0 };

  store[photoId] = {
    ...current,
    timeSpent: (current.timeSpent || 0) + sanitizedDuration,
    lastViewedAt: Date.now()
  };
  saveAnalyticsStore(store);
};

/**
 * Format seconds into human readable duration e.g. "2h 45m" or "4m 20s"
 */
export const formatDuration = (totalSeconds) => {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return '0s';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

/**
 * Aggregate summary metrics across all photos
 */
export const getAnalyticsSummary = (photos = []) => {
  const store = getAnalyticsStore();
  let totalViews = 0;
  let totalDownloads = 0;
  let totalLoves = 0;
  let totalTimeSpent = 0;

  photos.forEach((photo) => {
    const data = store[photo.id] || {};
    totalViews += data.views || 0;
    totalDownloads += data.downloads || 0;
    totalLoves += data.loves || 0;
    totalTimeSpent += data.timeSpent || 0;
  });

  const avgTimePerItem = photos.length > 0 ? Math.round(totalTimeSpent / photos.length) : 0;
  const avgViewsPerItem = photos.length > 0 ? Math.round(totalViews / photos.length) : 0;

  return {
    totalPhotos: photos.length,
    totalViews,
    totalDownloads,
    totalLoves,
    totalTimeSpent,
    formattedTotalTime: formatDuration(totalTimeSpent),
    avgTimePerItem,
    formattedAvgTime: formatDuration(avgTimePerItem),
    avgViewsPerItem
  };
};

/**
 * Return photos sorted by most viewed
 */
export const getMostViewedPhotos = (photos = [], limit = 20) => {
  const store = getAnalyticsStore();
  const list = photos.map((p) => {
    const data = store[p.id] || {};
    return {
      photo: p,
      views: data.views || 0,
      downloads: data.downloads || 0,
      loves: data.loves || 0,
      timeSpent: data.timeSpent || 0
    };
  });

  list.sort((a, b) => b.views - a.views);
  return limit ? list.slice(0, limit) : list;
};

/**
 * Return photos sorted by most downloaded
 */
export const getMostDownloadedPhotos = (photos = [], limit = 20) => {
  const store = getAnalyticsStore();
  const list = photos.map((p) => {
    const data = store[p.id] || {};
    return {
      photo: p,
      views: data.views || 0,
      downloads: data.downloads || 0,
      loves: data.loves || 0,
      timeSpent: data.timeSpent || 0
    };
  });

  list.sort((a, b) => b.downloads - a.downloads);
  return limit ? list.slice(0, limit) : list;
};

/**
 * Return photos sorted by most loved (favorites)
 */
export const getMostLovedPhotos = (photos = [], limit = 20) => {
  const store = getAnalyticsStore();
  const list = photos.map((p) => {
    const data = store[p.id] || {};
    return {
      photo: p,
      views: data.views || 0,
      downloads: data.downloads || 0,
      loves: data.loves || 0,
      timeSpent: data.timeSpent || 0
    };
  });

  list.sort((a, b) => b.loves - a.loves);
  return limit ? list.slice(0, limit) : list;
};

/**
 * Return photos sorted by most time spent
 */
export const getMostTimeSpentPhotos = (photos = [], limit = 20) => {
  const store = getAnalyticsStore();
  const list = photos.map((p) => {
    const data = store[p.id] || {};
    return {
      photo: p,
      views: data.views || 0,
      downloads: data.downloads || 0,
      loves: data.loves || 0,
      timeSpent: data.timeSpent || 0,
      formattedTime: formatDuration(data.timeSpent || 0),
      avgTimePerView: data.views > 0 ? Math.round(data.timeSpent / data.views) : data.timeSpent
    };
  });

  list.sort((a, b) => b.timeSpent - a.timeSpent);
  return limit ? list.slice(0, limit) : list;
};

/**
 * Return engagement aggregated by category
 */
export const getCategoryAnalytics = (photos = []) => {
  const store = getAnalyticsStore();
  const categoriesMap = {};

  photos.forEach((photo) => {
    const cat = photo.category || 'Uncategorized';
    if (!categoriesMap[cat]) {
      categoriesMap[cat] = {
        category: cat,
        count: 0,
        views: 0,
        downloads: 0,
        loves: 0,
        timeSpent: 0
      };
    }

    const data = store[photo.id] || {};
    categoriesMap[cat].count += 1;
    categoriesMap[cat].views += data.views || 0;
    categoriesMap[cat].downloads += data.downloads || 0;
    categoriesMap[cat].loves += data.loves || 0;
    categoriesMap[cat].timeSpent += data.timeSpent || 0;
  });

  const result = Object.values(categoriesMap);
  result.sort((a, b) => b.views - a.views);
  return result;
};

/**
 * Clear analytics recorded in this browser
 */
export const resetAnalyticsData = () => {
  if (typeof window !== 'undefined') {
    saveAnalyticsStore({});
  }
  return {};
};
