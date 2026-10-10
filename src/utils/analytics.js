/**
 * Portfolio Analytics Engine
 * Tracks browser-local lifetime totals and dated activity for time filtering.
 */

const ANALYTICS_STORAGE_KEY = 'aperture_analytics_store_v3';
const LEGACY_STORAGE_KEY = 'aperture_analytics_store_v2';
const EMPTY_STORE = { photos: {}, events: [] };

const normalizeStore = (parsed) => {
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    if (parsed.photos && typeof parsed.photos === 'object' && Array.isArray(parsed.events)) {
      return { photos: parsed.photos, events: parsed.events };
    }
    // Migrate the previous per-photo lifetime totals without inventing dates.
    return { photos: parsed, events: [] };
  }
  return { ...EMPTY_STORE };
};

export const getAnalyticsStore = () => {
  if (typeof window === 'undefined') return { ...EMPTY_STORE };
  try {
    const current = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (current) return normalizeStore(JSON.parse(current));
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    return legacy ? normalizeStore(JSON.parse(legacy)) : { ...EMPTY_STORE };
  } catch (e) {
    console.error('Failed to read analytics from localStorage:', e);
    return { ...EMPTY_STORE };
  }
};

export const saveAnalyticsStore = (store) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(normalizeStore(store)));
    window.dispatchEvent(new CustomEvent('aperture_analytics_updated'));
  } catch (e) {
    console.error('Failed to save analytics to localStorage:', e);
  }
};

const recordEvent = (store, photoId, type, value = 1) => {
  store.events.push({ photoId: String(photoId), type, value, timestamp: Date.now() });
};

export const recordPhotoView = (photoId) => {
  if (!photoId) return;
  const store = getAnalyticsStore();
  const current = store.photos[photoId] || { views: 0, downloads: 0, loves: 0, timeSpent: 0 };
  store.photos[photoId] = { ...current, views: (current.views || 0) + 1, lastViewedAt: Date.now() };
  recordEvent(store, photoId, 'view');
  saveAnalyticsStore(store);
};

export const recordPhotoDownload = (photoId) => {
  if (!photoId) return;
  const store = getAnalyticsStore();
  const current = store.photos[photoId] || { views: 0, downloads: 0, loves: 0, timeSpent: 0 };
  store.photos[photoId] = { ...current, downloads: (current.downloads || 0) + 1, lastViewedAt: Date.now() };
  recordEvent(store, photoId, 'download');
  saveAnalyticsStore(store);
};

export const recordPhotoLove = (photoId, isLoved = true) => {
  if (!photoId) return;
  const store = getAnalyticsStore();
  const current = store.photos[photoId] || { views: 0, downloads: 0, loves: 0, timeSpent: 0 };
  const updatedLoves = Math.max(0, (current.loves || 0) + (isLoved ? 1 : -1));
  store.photos[photoId] = { ...current, loves: updatedLoves };
  recordEvent(store, photoId, isLoved ? 'love' : 'unlove');
  saveAnalyticsStore(store);
};

export const recordTimeSpent = (photoId, durationSeconds) => {
  if (!photoId || !durationSeconds || durationSeconds <= 0) return;
  const sanitizedDuration = Math.min(Math.round(durationSeconds), 900);
  if (sanitizedDuration < 1) return;
  const store = getAnalyticsStore();
  const current = store.photos[photoId] || { views: 0, downloads: 0, loves: 0, timeSpent: 0 };
  store.photos[photoId] = {
    ...current,
    timeSpent: (current.timeSpent || 0) + sanitizedDuration,
    lastViewedAt: Date.now()
  };
  recordEvent(store, photoId, 'timeSpent', sanitizedDuration);
  saveAnalyticsStore(store);
};

export const formatDuration = (totalSeconds) => {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return '0s';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

const isInRange = (timestamp, range) => {
  if (!range || range.type === 'all') return true;
  const date = new Date(timestamp);
  if (range.start && date < new Date(range.start)) return false;
  if (range.end && date > new Date(range.end)) return false;
  return true;
};

const getPhotoMetrics = (photoId, store, range) => {
  const total = store.photos[photoId] || {};
  if (!range || range.type === 'all') {
    return {
      views: total.views || 0,
      downloads: total.downloads || 0,
      loves: total.loves || 0,
      timeSpent: total.timeSpent || 0
    };
  }
  const metrics = { views: 0, downloads: 0, loves: 0, timeSpent: 0 };
  store.events.forEach((event) => {
    if (event.photoId !== String(photoId) || !isInRange(event.timestamp, range)) return;
    if (event.type === 'view') metrics.views += event.value || 1;
    if (event.type === 'download') metrics.downloads += event.value || 1;
    if (event.type === 'love') metrics.loves += event.value || 1;
    if (event.type === 'timeSpent') metrics.timeSpent += event.value || 0;
  });
  return metrics;
};

export const getAnalyticsSummary = (photos = [], range = { type: 'all' }) => {
  const store = getAnalyticsStore();
  const totals = photos.reduce((acc, photo) => {
    const data = getPhotoMetrics(photo.id, store, range);
    acc.totalViews += data.views;
    acc.totalDownloads += data.downloads;
    acc.totalLoves += data.loves;
    acc.totalTimeSpent += data.timeSpent;
    return acc;
  }, { totalViews: 0, totalDownloads: 0, totalLoves: 0, totalTimeSpent: 0 });
  const avgTimePerItem = photos.length ? Math.round(totals.totalTimeSpent / photos.length) : 0;
  return {
    totalPhotos: photos.length,
    ...totals,
    formattedTotalTime: formatDuration(totals.totalTimeSpent),
    avgTimePerItem,
    formattedAvgTime: formatDuration(avgTimePerItem),
    avgViewsPerItem: photos.length ? Math.round(totals.totalViews / photos.length) : 0
  };
};

const getRankedPhotos = (photos, limit, range, sortMetric, includeTimeFields = false) => {
  const store = getAnalyticsStore();
  const list = photos.map((photo) => {
    const metrics = getPhotoMetrics(photo.id, store, range);
    return {
      photo,
      ...metrics,
      ...(includeTimeFields ? {
        formattedTime: formatDuration(metrics.timeSpent),
        avgTimePerView: metrics.views > 0 ? Math.round(metrics.timeSpent / metrics.views) : metrics.timeSpent
      } : {})
    };
  });
  list.sort((a, b) => b[sortMetric] - a[sortMetric]);
  return limit ? list.slice(0, limit) : list;
};

export const getMostViewedPhotos = (photos = [], limit = 20, range = { type: 'all' }) => getRankedPhotos(photos, limit, range, 'views');
export const getMostDownloadedPhotos = (photos = [], limit = 20, range = { type: 'all' }) => getRankedPhotos(photos, limit, range, 'downloads');
export const getMostLovedPhotos = (photos = [], limit = 20, range = { type: 'all' }) => getRankedPhotos(photos, limit, range, 'loves');
export const getMostTimeSpentPhotos = (photos = [], limit = 20, range = { type: 'all' }) => getRankedPhotos(photos, limit, range, 'timeSpent', true);

export const getCategoryAnalytics = (photos = [], range = { type: 'all' }) => {
  const store = getAnalyticsStore();
  const categories = {};
  photos.forEach((photo) => {
    const category = photo.category || 'Uncategorized';
    if (!categories[category]) categories[category] = { category, count: 0, views: 0, downloads: 0, loves: 0, timeSpent: 0 };
    const metrics = getPhotoMetrics(photo.id, store, range);
    categories[category].count += 1;
    categories[category].views += metrics.views;
    categories[category].downloads += metrics.downloads;
    categories[category].loves += metrics.loves;
    categories[category].timeSpent += metrics.timeSpent;
  });
  return Object.values(categories).sort((a, b) => b.views - a.views);
};

export const resetAnalyticsData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    saveAnalyticsStore({ ...EMPTY_STORE });
  }
  return { ...EMPTY_STORE };
};
