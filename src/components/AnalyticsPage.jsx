import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Eye,
  Download,
  Heart,
  Clock,
  Timer,
  Sparkles,
  Search,
  RotateCcw,
  Maximize2,
  Filter,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Layers,
  Award,
  Calendar,
  Share2
} from 'lucide-react';
import {
  getAnalyticsSummary,
  getMostViewedPhotos,
  getMostDownloadedPhotos,
  getMostLovedPhotos,
  getMostTimeSpentPhotos,
  getCategoryAnalytics,
  resetAnalyticsData,
  formatDuration
} from '../utils/analytics';
import { getThumbnailUrl } from '../utils/imagekit';

export const AnalyticsPage = ({
  photos = [],
  onBack,
  onSelectPhoto
}) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'viewed', 'downloads_loved', 'time_spent', 'categories'
  const [downloadSort, setDownloadSort] = useState('combined'); // 'combined', 'downloads', 'loved'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timeFilter, setTimeFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const analyticsRange = useMemo(() => {
    if (timeFilter === 'all') return { type: 'all' };
    if (timeFilter === 'custom') {
      const start = customStartDate ? new Date(`${customStartDate}T00:00:00`).getTime() : null;
      const end = customEndDate ? new Date(`${customEndDate}T23:59:59.999`).getTime() : null;
      return { type: 'custom', start, end };
    }
    const days = Number(timeFilter);
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - days + 1);
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    return { type: 'range', start: startDate.getTime(), end: endDate.getTime() };
  }, [timeFilter, customStartDate, customEndDate]);

  // Listen for live analytics update events
  useEffect(() => {
    const handleUpdate = () => {
      setRefreshKey((k) => k + 1);
    };
    window.addEventListener('aperture_analytics_updated', handleUpdate);
    return () => window.removeEventListener('aperture_analytics_updated', handleUpdate);
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('Clear the analytics recorded in this browser?')) {
      resetAnalyticsData();
      setRefreshKey((k) => k + 1);
      showToast('Browser analytics cleared.');
    }
  };

  // Compute analytics summaries
  const summary = useMemo(() => {
    return getAnalyticsSummary(photos, analyticsRange);
  }, [photos, refreshKey, analyticsRange]);

  // Compute most viewed
  const allViewedPhotos = useMemo(() => {
    return getMostViewedPhotos(photos, null, analyticsRange);
  }, [photos, refreshKey, analyticsRange]);

  // Compute most downloaded
  const allDownloadedPhotos = useMemo(() => {
    return getMostDownloadedPhotos(photos, null, analyticsRange);
  }, [photos, refreshKey, analyticsRange]);

  // Compute most loved
  const allLovedPhotos = useMemo(() => {
    return getMostLovedPhotos(photos, null, analyticsRange);
  }, [photos, refreshKey, analyticsRange]);

  // Compute most time spent
  const allTimeSpentPhotos = useMemo(() => {
    return getMostTimeSpentPhotos(photos, null, analyticsRange);
  }, [photos, refreshKey, analyticsRange]);

  // Compute category analytics
  const categoryStats = useMemo(() => {
    return getCategoryAnalytics(photos, analyticsRange);
  }, [photos, refreshKey, analyticsRange]);

  // Find top category
  const topCategory = categoryStats[0]?.category || 'None';

  // Categories list for filter
  const categoriesList = useMemo(() => {
    const set = new Set(['All']);
    photos.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [photos]);

  // Filter photos based on search and category
  const filterList = (list) => {
    return list.filter((item) => {
      const p = item.photo;
      if (!p) return false;
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (p.title || '').toLowerCase().includes(q);
        const matchCategory = (p.category || '').toLowerCase().includes(q);
        const matchLoc = (p.location || '').toLowerCase().includes(q);
        return matchTitle || matchCategory || matchLoc;
      }
      return true;
    });
  };

  const filteredViewed = useMemo(() => filterList(allViewedPhotos), [allViewedPhotos, searchQuery, selectedCategory]);
  const filteredTimeSpent = useMemo(() => filterList(allTimeSpentPhotos), [allTimeSpentPhotos, searchQuery, selectedCategory]);

  // Combined / Downloaded & Loved list
  const filteredDownloadsAndLoved = useMemo(() => {
    const list = photos.map((p) => {
      const viewedItem = allViewedPhotos.find((item) => item.photo.id === p.id) || { views: 0, downloads: 0, loves: 0, timeSpent: 0 };
      return {
        photo: p,
        views: viewedItem.views,
        downloads: viewedItem.downloads,
        loves: viewedItem.loves,
        combinedScore: viewedItem.downloads * 2 + viewedItem.loves * 3
      };
    });

    const filtered = filterList(list);

    if (downloadSort === 'downloads') {
      return filtered.sort((a, b) => b.downloads - a.downloads);
    } else if (downloadSort === 'loved') {
      return filtered.sort((a, b) => b.loves - a.loves);
    }
    // Combined engagement score
    return filtered.sort((a, b) => b.combinedScore - a.combinedScore);
  }, [photos, allViewedPhotos, downloadSort, searchQuery, selectedCategory]);

  // Highest metric values for relative progress bars
  const maxViews = useMemo(() => Math.max(...allViewedPhotos.map((p) => p.views), 1), [allViewedPhotos]);
  const maxDownloads = useMemo(() => Math.max(...allDownloadedPhotos.map((p) => p.downloads), 1), [allDownloadedPhotos]);
  const maxLoves = useMemo(() => Math.max(...allLovedPhotos.map((p) => p.loves), 1), [allLovedPhotos]);
  const maxTimeSpent = useMemo(() => Math.max(...allTimeSpentPhotos.map((p) => p.timeSpent), 1), [allTimeSpentPhotos]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-20 transition-colors">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-zinc-950 text-white border border-purple-500/60 shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in zoom-in-95 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Admin Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-zinc-900 text-white border-b border-purple-500/30 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-purple-200">
              Analytics Console
            </span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-mono">
              This Browser Only
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
              title="Clear analytics recorded in this browser"
            >
              <RotateCcw className="w-3.5 h-3.5 text-purple-300" />
              <span>Clear Data</span>
            </button>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Gallery</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-semibold flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Portfolio Intelligence</span>
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                {photos.length} Works Tracked
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Analytics & Insights
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              These counts are recorded in this browser only. They are not shared across visitors or devices and may be cleared with browser storage.
            </p>
          </div>
        </div>

        {/* High-Level KPI Summary Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {/* 1. Total Views */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 shadow-xs hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Total Views
              </span>
              <div className="w-9 h-9 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                {summary.totalViews.toLocaleString()}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              Avg <strong className="font-semibold text-zinc-700 dark:text-zinc-200">{summary.avgViewsPerItem}</strong> views per photo
            </p>
          </div>

          {/* 2. Total Downloads */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 shadow-xs hover:border-indigo-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Total Downloads
              </span>
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                {summary.totalDownloads.toLocaleString()}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              <strong className="font-semibold text-zinc-700 dark:text-zinc-200">
                {summary.totalViews > 0 ? ((summary.totalDownloads / summary.totalViews) * 100).toFixed(1) : 0}%
              </strong> download rate
            </p>
          </div>

          {/* 3. Total Loved / Favorites */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 shadow-xs hover:border-rose-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Loved / Favorites
              </span>
              <div className="w-9 h-9 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 flex items-center justify-center">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                {summary.totalLoves.toLocaleString()}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              Favorites recorded in this browser
            </p>
          </div>

          {/* 4. Total Time Spent */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 shadow-xs hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Total Time Spent
              </span>
              <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                {summary.formattedTotalTime}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              Avg <strong className="font-semibold text-zinc-700 dark:text-zinc-200">{summary.formattedAvgTime}</strong> retention per work
            </p>
          </div>
        </div>

        {/* Tab Navigation and Search/Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-2">
          {/* Main Analytics View Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar shadow-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Full Leaderboard</span>
            </button>
            <button
              onClick={() => setActiveTab('viewed')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'viewed'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Most Viewed</span>
            </button>
            <button
              onClick={() => setActiveTab('downloads_loved')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'downloads_loved'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Most Downloaded & Loved</span>
            </button>
            <button
              onClick={() => setActiveTab('time_spent')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'time_spent'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Most Time Spent</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'categories'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Categories</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <select
                aria-label="Filter analytics by time"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="py-2 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-purple-500 shadow-xs cursor-pointer"
              >
                <option value="all">All time</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            {timeFilter === 'custom' && (
              <div className="flex items-center gap-1.5">
                <input
                  aria-label="Start date"
                  type="date"
                  value={customStartDate}
                  max={customEndDate || undefined}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="max-w-[140px] py-2 px-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-purple-500 shadow-xs"
                />
                <span className="text-xs text-zinc-400">to</span>
                <input
                  aria-label="End date"
                  type="date"
                  value={customEndDate}
                  min={customStartDate || undefined}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="max-w-[140px] py-2 px-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-purple-500 shadow-xs"
                />
              </div>
            )}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search photo title, tag..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-purple-500 dark:focus:border-purple-500 shadow-xs"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-purple-500 shadow-xs cursor-pointer"
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Collections' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* TAB 1: ALL / LEADERBOARD SUMMARY */}
        {/* ------------------------------------------------------------------- */}
        {(activeTab === 'all' || activeTab === 'viewed') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Most Viewed Photographs & Media</span>
                </h2>
                <p className="text-xs text-zinc-500">
                  Ranking your showcase by highest impression and full visual clicks
                </p>
              </div>
              <span className="text-xs text-zinc-500 font-mono">
                Showing top {Math.min(filteredViewed.length, 25)} works
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900/90 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Rank</th>
                      <th className="py-3.5 px-4">Work / Preview</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4 text-right">Views</th>
                      <th className="py-3.5 px-4 text-right">Downloads</th>
                      <th className="py-3.5 px-4 text-right">Loved</th>
                      <th className="py-3.5 px-4 text-right">Time Spent</th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                    {filteredViewed.slice(0, 25).map((item, idx) => {
                      const p = item.photo;
                      const viewPercent = Math.round((item.views / maxViews) * 100);
                      const originalIndex = photos.findIndex((orig) => orig.id === p.id);

                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors group"
                        >
                          {/* Rank Badge */}
                          <td className="py-3 px-4 font-mono font-bold">
                            {idx === 0 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-zinc-950 text-xs shadow-xs">
                                🥇
                              </span>
                            ) : idx === 1 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-zinc-950 text-xs shadow-xs">
                                🥈
                              </span>
                            ) : idx === 2 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white text-xs shadow-xs">
                                🥉
                              </span>
                            ) : (
                              <span className="text-zinc-400">#{idx + 1}</span>
                            )}
                          </td>

                          {/* Work Title & Thumbnail */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3 min-w-[200px]">
                              <div
                                onClick={() => onSelectPhoto && originalIndex >= 0 && onSelectPhoto(originalIndex)}
                                className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 cursor-pointer border border-zinc-200 dark:border-zinc-800 relative group/thumb shadow-xs"
                              >
                                <img
                                  src={getThumbnailUrl(p)}
                                  alt={p.title}
                                  className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <Maximize2 className="w-3.5 h-3.5" />
                                </div>
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                  {p.title}
                                </p>
                                <p className="text-[11px] text-zinc-500 truncate">
                                  {p.location || p.category}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                              {p.category}
                            </span>
                          </td>

                          {/* Views with Progress Bar */}
                          <td className="py-3 px-4 text-right">
                            <div className="font-extrabold text-sm text-zinc-900 dark:text-white font-mono">
                              {item.views.toLocaleString()}
                            </div>
                            <div className="w-20 ml-auto h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mt-1">
                              <div
                                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                                style={{ width: `${viewPercent}%` }}
                              />
                            </div>
                          </td>

                          {/* Downloads */}
                          <td className="py-3 px-4 text-right font-mono font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1">
                              <Download className="w-3 h-3 text-indigo-500" />
                              {item.downloads}
                            </span>
                          </td>

                          {/* Loved */}
                          <td className="py-3 px-4 text-right font-mono font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-rose-500">
                              <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                              {item.loves}
                            </span>
                          </td>

                          {/* Time Spent */}
                          <td className="py-3 px-4 text-right font-mono text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                            {formatDuration(item.timeSpent)}
                          </td>

                          {/* Quick Action */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => onSelectPhoto && originalIndex >= 0 && onSelectPhoto(originalIndex)}
                              className="px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-600 text-purple-600 dark:text-purple-300 hover:text-white transition-all text-xs font-semibold cursor-pointer active:scale-95"
                              title="Inspect full resolution media"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredViewed.length === 0 && (
                      <tr>
                        <td colSpan="8" className="py-12 text-center text-zinc-400">
                          No photos matched your filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 2: MOST DOWNLOADED & LOVED */}
        {/* ------------------------------------------------------------------- */}
        {(activeTab === 'all' || activeTab === 'downloads_loved') && (
          <div className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>Most Downloaded & Loved Media</span>
                </h2>
                <p className="text-xs text-zinc-500">
                  Works with the highest viewer conversion and community admiration
                </p>
              </div>

              {/* Sort selector for Downloads / Loved */}
              <div className="flex items-center gap-1 p-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs self-start sm:self-auto">
                <button
                  onClick={() => setDownloadSort('combined')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    downloadSort === 'combined'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  Combined Score
                </button>
                <button
                  onClick={() => setDownloadSort('downloads')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    downloadSort === 'downloads'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  Most Downloads
                </button>
                <button
                  onClick={() => setDownloadSort('loved')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    downloadSort === 'loved'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  Most Loved
                </button>
              </div>
            </div>

            {/* Grid of Top Loved & Downloaded Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDownloadsAndLoved.slice(0, 9).map((item, idx) => {
                const p = item.photo;
                const originalIndex = photos.findIndex((orig) => orig.id === p.id);

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-4 hover:border-purple-500/40 transition-all group"
                  >
                    <div
                      onClick={() => onSelectPhoto && originalIndex >= 0 && onSelectPhoto(originalIndex)}
                      className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 cursor-pointer border border-zinc-200 dark:border-zinc-800 relative group/thumb shadow-xs"
                    >
                      <img
                        src={getThumbnailUrl(p)}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono font-bold text-zinc-400">
                          #{idx + 1} TOP ENGAGED
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 truncate">
                          {p.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {p.title}
                      </h4>

                      <div className="flex items-center gap-3 mt-2 text-xs font-mono">
                        <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                          <Download className="w-3.5 h-3.5" />
                          <span>{item.downloads}</span>
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                          <Heart className="w-3.5 h-3.5 fill-current" />
                          <span>{item.loves}</span>
                        </span>
                        <span className="text-zinc-400 text-[11px] ml-auto">
                          {item.views} views
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 3: MOST TIME SPENT (AUDIENCE RETENTION) */}
        {/* ------------------------------------------------------------------- */}
        {(activeTab === 'all' || activeTab === 'time_spent') && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Most Time Spent (Viewer Retention)</span>
                </h2>
                <p className="text-xs text-zinc-500">
                  Media where visitors spend the longest duration contemplating and zooming in
                </p>
              </div>
              <span className="text-xs text-zinc-500 font-mono">
                Showing top retention works
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTimeSpent.slice(0, 8).map((item, idx) => {
                const p = item.photo;
                const originalIndex = photos.findIndex((orig) => orig.id === p.id);
                const percentOfMax = Math.round((item.timeSpent / maxTimeSpent) * 100);

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-4 hover:border-amber-500/40 transition-all group"
                  >
                    {/* Rank Number */}
                    <div className="font-mono text-base font-extrabold text-zinc-300 dark:text-zinc-700 w-6 text-center">
                      {idx + 1}
                    </div>

                    <div
                      onClick={() => onSelectPhoto && originalIndex >= 0 && onSelectPhoto(originalIndex)}
                      className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 cursor-pointer border border-zinc-200 dark:border-zinc-800 relative group/thumb shadow-xs"
                    >
                      <img
                        src={getThumbnailUrl(p)}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate group-hover:text-amber-500 transition-colors">
                          {p.title}
                        </h4>
                        <span className="text-xs font-mono font-extrabold text-amber-600 dark:text-amber-400 shrink-0">
                          {item.formattedTime}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-500 truncate mb-2">
                        {p.location || p.category}
                      </p>

                      {/* Visual Retention Bar */}
                      <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentOfMax}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono text-zinc-400">
                        <span>Avg {item.avgTimePerView}s / view</span>
                        <span>{item.views} total views</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 4: CATEGORY BREAKDOWN */}
        {/* ------------------------------------------------------------------- */}
        {(activeTab === 'all' || activeTab === 'categories') && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Category & Collection Distribution</span>
                </h2>
                <p className="text-xs text-zinc-500">
                  Engagement volume broken down across your portfolio themes
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryStats.map((catStat) => {
                const percentOfTotalViews = summary.totalViews > 0
                  ? ((catStat.views / summary.totalViews) * 100).toFixed(1)
                  : '0';

                return (
                  <div
                    key={catStat.category}
                    className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-purple-500/40 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">
                          {catStat.category}
                        </h3>
                      </div>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                        {catStat.count} Works
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-zinc-100 dark:border-zinc-800/80 text-center font-mono text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Views</span>
                        <span className="font-bold text-zinc-900 dark:text-white">{catStat.views}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Downloads</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{catStat.downloads}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Loves</span>
                        <span className="font-bold text-rose-500">{catStat.loves}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                        <span>Share of total traffic</span>
                        <span className="font-bold text-zinc-700 dark:text-zinc-300 font-mono">{percentOfTotalViews}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                          style={{ width: `${percentOfTotalViews}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-zinc-400 font-mono text-right">
                      Time spent: {formatDuration(catStat.timeSpent)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
