import React, { useState } from 'react';
import {
  ArchivedReportEntry,
  HealthCategory,
  HEALTH_CATEGORIES,
  getArchivedReports,
  addReportToArchive,
  deleteArchivedReport,
  toggleFlagArchivedReport,
  resetDefaultArchivedReports,
  saveArchivedReports,
} from '../services/archiveService';
import { BiometricProfile, DiagnosticReport, NavTab } from '../types';
import {
  FolderArchive,
  Search,
  Filter,
  Calendar,
  Star,
  Trash2,
  Download,
  Sparkles,
  Waves,
  Shield,
  Activity,
  Heart,
  Cpu,
  Zap,
  Wind,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  X,
  RotateCcw,
  Plus,
  BookOpen,
  Tag,
  SlidersHorizontal,
} from 'lucide-react';

interface BiometricArchiveSectionProps {
  currentBiometrics: BiometricProfile;
  currentReport: DiagnosticReport | null;
  currentSymptoms?: string;
  onNavigateTab?: (tab: NavTab) => void;
}

export const BiometricArchiveSection: React.FC<BiometricArchiveSectionProps> = ({
  currentBiometrics,
  currentReport,
  currentSymptoms = '',
  onNavigateTab,
}) => {
  const [reports, setReports] = useState<ArchivedReportEntry[]>(getArchivedReports());
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [timeframeFilter, setTimeframeFilter] = useState<'ALL' | '7_DAYS' | '30_DAYS' | 'FLAGGED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'HIGHEST_VITALITY' | 'LOWEST_VITALITY'>('NEWEST');
  
  // Selected Report Modal State
  const [viewingReport, setViewingReport] = useState<ArchivedReportEntry | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Manual Categorization State when archiving active report
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState<boolean>(false);
  const [archiveCustomTitle, setArchiveCustomTitle] = useState<string>('');
  const [archiveCategory, setArchiveCategory] = useState<HealthCategory>('Full-Spectrum Holistic');
  const [archiveNotes, setArchiveNotes] = useState<string>('');

  const handleOpenArchiveActiveModal = () => {
    if (!currentReport) return;
    setArchiveCustomTitle(`${currentReport.triageLevel} - Diagnostic Scan`);
    setArchiveCategory('Full-Spectrum Holistic');
    setArchiveNotes(currentSymptoms ? `Symptoms: ${currentSymptoms}` : 'Archived active scan.');
    setIsArchiveModalOpen(true);
  };

  const handleConfirmArchiveActive = () => {
    if (!currentReport) return;
    const updated = addReportToArchive(
      currentReport,
      currentBiometrics,
      currentSymptoms,
      archiveCategory,
      archiveCustomTitle,
      archiveNotes
    );
    setReports(updated);
    setIsArchiveModalOpen(false);
    setSaveNotice('Diagnostic report successfully saved to Biometric Archive.');
    setTimeout(() => setSaveNotice(null), 4000);
  };

  const handleDeleteReport = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = deleteArchivedReport(id);
    setReports(updated);
    if (viewingReport?.id === id) {
      setViewingReport(null);
    }
  };

  const handleToggleFlag = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = toggleFlagArchivedReport(id);
    setReports(updated);
    if (viewingReport?.id === id) {
      setViewingReport((prev) => (prev ? { ...prev, isFlagged: !prev.isFlagged } : null));
    }
  };

  const handleResetArchive = () => {
    const defaults = resetDefaultArchivedReports();
    setReports(defaults);
    setSaveNotice('Biometric Archive reset to default Starfleet baseline records.');
    setTimeout(() => setSaveNotice(null), 4000);
  };

  const handleExportSingleReport = (item: ArchivedReportEntry) => {
    const textContent = `
================================================================================
DR. WELLAND-STRONG // BIOMETRIC ARCHIVE DIAGNOSTIC READOUT
================================================================================
Archive ID:         ${item.id}
Timestamp:          ${item.timestamp} (${item.dateFormatted})
Category:           ${item.category}
Title:              ${item.title}
Status Triage:      ${item.triageLevel}
Overall Vitality:   ${item.overallVitality} / 100
Flagged Baseline:   ${item.isFlagged ? 'YES' : 'NO'}

--------------------------------------------------------------------------------
BIOMETRIC TELEMETRY SNAPSHOT
--------------------------------------------------------------------------------
Heart Rate:         ${item.biometricSnapshot.heartRate} BPM
HRV Resilience:     ${item.biometricSnapshot.hrv} ms
Blood Pressure:     ${item.biometricSnapshot.bloodPressure} mmHg
Pulse Oximetry:     ${item.biometricSnapshot.oxygenSaturation}% SpO2
Neural Coherence:   ${item.biometricSnapshot.neuralCoherence}%
Cellular Vitality:  ${item.biometricSnapshot.cellularVitality}%
Stress Index:       ${item.biometricSnapshot.stressIndex}%

--------------------------------------------------------------------------------
ROOT CAUSE ANALYSIS
--------------------------------------------------------------------------------
${item.rootCauseAnalysis}

--------------------------------------------------------------------------------
CORRECTIVE PROTOCOL STEPS
--------------------------------------------------------------------------------
${item.correctiveProtocol.map((step, idx) => `0${idx + 1}. ${step}`).join('\n')}

Recommended Solfeggio Frequency: ${item.recommendedSolfeggioHz} Hz
Logged Symptoms:                 ${item.symptomsLogged || 'None recorded'}
Clinical Tags:                   ${item.tags.join(', ')}
Archive Notes:                   ${item.notes || 'None'}

================================================================================
Generated by Dr. Welland-Strong Holistic Biometrics System
================================================================================
`.trim();

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Biometric_Archive_${item.id}_${item.category.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter & Search Execution
  const filteredReports = reports.filter((item) => {
    // 1. Category Filter
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
      return false;
    }

    // 2. Timeframe / Flag Filter
    if (timeframeFilter === 'FLAGGED' && !item.isFlagged) {
      return false;
    }

    if (timeframeFilter === '7_DAYS' || timeframeFilter === '30_DAYS') {
      const itemTime = new Date(item.timestamp).getTime();
      const now = Date.now();
      const daysDiff = (now - itemTime) / (1000 * 3600 * 24);
      if (timeframeFilter === '7_DAYS' && daysDiff > 7) return false;
      if (timeframeFilter === '30_DAYS' && daysDiff > 30) return false;
    }

    // 3. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchTriage = item.triageLevel.toLowerCase().includes(q);
      const matchSymptoms = item.symptomsLogged.toLowerCase().includes(q);
      const matchRootCause = item.rootCauseAnalysis.toLowerCase().includes(q);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));

      if (!matchTitle && !matchCategory && !matchTriage && !matchSymptoms && !matchRootCause && !matchTags) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === 'NEWEST') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
    if (sortBy === 'OLDEST') {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    }
    if (sortBy === 'HIGHEST_VITALITY') {
      return b.overallVitality - a.overallVitality;
    }
    if (sortBy === 'LOWEST_VITALITY') {
      return a.overallVitality - b.overallVitality;
    }
    return 0;
  });

  const getCategoryIcon = (cat: HealthCategory) => {
    switch (cat) {
      case 'Cardiovascular & Heart':
        return Heart;
      case 'Autonomic & Stress':
        return Shield;
      case 'Neural & Cognitive':
        return Cpu;
      case 'Cellular & ATP Vitality':
        return Zap;
      case 'Pulmonary & Oxygenation':
        return Wind;
      default:
        return Activity;
    }
  };

  const getCategoryBadgeClass = (cat: HealthCategory) => {
    switch (cat) {
      case 'Cardiovascular & Heart':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'Autonomic & Stress':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Neural & Cognitive':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'Cellular & ATP Vitality':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Pulmonary & Oxygenation':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default:
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Notice Banner */}
      {saveNotice && (
        <div className="bg-cyan-950/80 border border-cyan-500/50 rounded-xl p-3 text-xs font-mono text-cyan-200 flex items-center justify-between shadow-lg animate-fade-in z-10 relative">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            <span>{saveNotice}</span>
          </div>
          <button
            onClick={() => setSaveNotice(null)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 z-10 relative">
        <div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <FolderArchive className="w-4 h-4 text-cyan-400" />
            <span>STARFLEET MEDICAL RECORDS // BIOMETRIC ARCHIVE</span>
          </div>
          <h2 className="text-2xl font-bold font-mono text-white mt-1 flex items-center gap-3">
            <span>Historical Diagnostic Registry</span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
              {sortedReports.length} {sortedReports.length === 1 ? 'Report' : 'Reports'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Categorize, search, and filter past AI diagnostic evaluations by date, clinical category, or vitality baseline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentReport && (
            <button
              type="button"
              onClick={handleOpenArchiveActiveModal}
              className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              title="Archive current active AI diagnostic report"
            >
              <Plus className="w-4 h-4" />
              <span>Archive Active Scan</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResetArchive}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
            title="Reset to default baseline diagnostic records"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Controls Bar */}
      <div className="space-y-3 bg-slate-950/70 border border-slate-800 p-4 rounded-xl z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, root cause, symptoms, or tags..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Timeframe Filter Dropdown */}
          <div className="md:col-span-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono">
              <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                value={timeframeFilter}
                onChange={(e) => setTimeframeFilter(e.target.value as any)}
                className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer"
              >
                <option value="ALL">All Time</option>
                <option value="7_DAYS">Past 7 Days</option>
                <option value="30_DAYS">Past 30 Days</option>
                <option value="FLAGGED">★ Flagged Baseline Only</option>
              </select>
            </div>
          </div>

          {/* Sorting Dropdown */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono">
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer"
              >
                <option value="NEWEST">Sort: Newest First</option>
                <option value="OLDEST">Sort: Oldest First</option>
                <option value="HIGHEST_VITALITY">Sort: Highest Vitality</option>
                <option value="LOWEST_VITALITY">Sort: Lowest Vitality</option>
              </select>
            </div>
          </div>
        </div>

        {/* Health Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-900 no-scrollbar">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-cyan-400" />
            Category:
          </span>

          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-mono shrink-0 transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Categories ({reports.length})
          </button>

          {HEALTH_CATEGORIES.map((cat) => {
            const count = reports.filter((r) => r.category === cat).length;
            const isSelected = selectedCategory === cat;
            const CatIcon = getCategoryIcon(cat);

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-mono shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <CatIcon className="w-3.5 h-3.5" />
                <span>{cat}</span>
                <span className="text-[10px] opacity-75 font-semibold">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Archived Reports Cards Grid */}
      <div className="space-y-4 z-10 relative">
        {sortedReports.length === 0 ? (
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <FolderArchive className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-mono font-bold text-slate-300">No Biometric Diagnostic Reports Found</h3>
            <p className="text-xs text-slate-500 font-mono max-w-md mx-auto">
              No historical reports match the current category, timeframe, or search criteria.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('ALL');
                setTimeframeFilter('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs rounded-xl inline-flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedReports.map((item) => {
              const CatIcon = getCategoryIcon(item.category);
              const badgeClass = getCategoryBadgeClass(item.category);

              return (
                <div
                  key={item.id}
                  onClick={() => setViewingReport(item)}
                  className={`bg-slate-950/80 border rounded-2xl p-5 space-y-4 transition-all duration-300 cursor-pointer hover:scale-[1.01] hover:shadow-xl relative group overflow-hidden ${
                    item.isFlagged
                      ? 'border-amber-500/40 hover:border-amber-500/70 shadow-amber-950/20'
                      : 'border-slate-800 hover:border-cyan-500/40 shadow-cyan-950/20'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-900 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                        <CatIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${badgeClass}`}>
                          {item.category}
                        </span>
                        <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{item.dateFormatted}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleToggleFlag(item.id, e)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          item.isFlagged
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-amber-400'
                        }`}
                        title={item.isFlagged ? 'Unflag Baseline' : 'Flag as Baseline Reference'}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.isFlagged ? 'fill-amber-400' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteReport(item.id, e)}
                        className="p-1.5 bg-slate-900 border border-slate-800 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Report from Archive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Triage Status */}
                  <div className="space-y-1">
                    <h3 className="font-mono font-bold text-sm text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between font-mono text-xs pt-1">
                      <span className="text-slate-400 text-[11px] font-semibold">{item.triageLevel}</span>
                      <span className="text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {item.overallVitality}/100 ATP
                      </span>
                    </div>
                  </div>

                  {/* Root Cause Preview */}
                  <p className="text-xs text-slate-400 font-mono line-clamp-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-900">
                    {item.rootCauseAnalysis}
                  </p>

                  {/* Solfeggio & Tags Preview */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900 text-xs font-mono">
                    <div className="flex items-center gap-1 text-purple-300 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 text-[11px]">
                      <Waves className="w-3 h-3 text-purple-400" />
                      <span>{item.recommendedSolfeggioHz} Hz Harmonic</span>
                    </div>

                    <div className="flex items-center gap-1 text-cyan-400 group-hover:translate-x-0.5 transition-transform text-[11px] font-bold">
                      <span>View Readout</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detailed Diagnostic Readout Modal */}
      {viewingReport && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto font-sans">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-cyan-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <span>ARCHIVED READOUT</span>
                    <span>•</span>
                    <span>{viewingReport.category}</span>
                  </div>
                  <h3 className="font-mono text-lg font-bold text-white mt-0.5 flex items-center gap-2">
                    <span>{viewingReport.title}</span>
                    {viewingReport.isFlagged && (
                      <span className="text-xs font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        Baseline Reference
                      </span>
                    )}
                  </h3>
                  <div className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-3">
                    <span>Logged: {viewingReport.dateFormatted}</span>
                    <span>•</span>
                    <span className="text-cyan-300 font-bold">Vitality Score: {viewingReport.overallVitality}/100</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportSingleReport(viewingReport)}
                  className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Export Report Text (.txt)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleFlag(viewingReport.id)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    viewingReport.isFlagged
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Baseline Reference Flag"
                >
                  <Star className={`w-4 h-4 ${viewingReport.isFlagged ? 'fill-amber-400' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setViewingReport(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="space-y-6">
              {/* Triage Banner */}
              <div className="bg-slate-950/80 border border-cyan-500/30 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
                <div>
                  <span className="text-[10px] text-cyan-400 uppercase tracking-widest block">Status Triage Classification</span>
                  <span className="text-lg font-bold text-white">{viewingReport.triageLevel}</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-950/40 px-3 py-2 rounded-lg border border-purple-500/30 text-xs">
                  <Waves className="w-4 h-4 text-purple-400" />
                  <span>Recommended Harmonic: <strong className="text-purple-300 font-bold">{viewingReport.recommendedSolfeggioHz} Hz</strong></span>
                </div>
              </div>

              {/* Biometric Telemetry Snapshot Grid */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                  Archived Biometric Telemetry Snapshot
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Heart Rate</span>
                    <span className="text-rose-400 font-bold text-base">{viewingReport.biometricSnapshot.heartRate} BPM</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">HRV Resilience</span>
                    <span className="text-cyan-300 font-bold text-base">{viewingReport.biometricSnapshot.hrv} ms</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Pulse Oximetry</span>
                    <span className="text-blue-400 font-bold text-base">{viewingReport.biometricSnapshot.oxygenSaturation}% SpO2</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Neural Sync</span>
                    <span className="text-purple-400 font-bold text-base">{viewingReport.biometricSnapshot.neuralCoherence}%</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Cellular ATP</span>
                    <span className="text-emerald-400 font-bold text-base">{viewingReport.biometricSnapshot.cellularVitality}%</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Stress Load</span>
                    <span className="text-amber-400 font-bold text-base">{viewingReport.biometricSnapshot.stressIndex}%</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 col-span-2">
                    <span className="text-slate-500 block text-[10px]">Arterial Blood Pressure</span>
                    <span className="text-teal-300 font-bold text-base">{viewingReport.biometricSnapshot.bloodPressure} mmHg</span>
                  </div>
                </div>
              </div>

              {/* Root Cause Analysis */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                  Root Cause Analysis
                </span>
                <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  {viewingReport.rootCauseAnalysis}
                </p>
              </div>

              {/* Corrective Protocol Steps */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                  Corrective Protocol Steps
                </span>
                <ul className="space-y-2">
                  {viewingReport.correctiveProtocol.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs font-mono text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-cyan-400 font-bold shrink-0">0{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Notes & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 uppercase text-[10px] block font-bold">Logged Symptoms</span>
                  <p className="text-slate-300">{viewingReport.symptomsLogged || 'None recorded.'}</p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 uppercase text-[10px] block font-bold">Clinical Tags</span>
                  <div className="flex flex-wrap gap-1">
                    {viewingReport.tags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => handleDeleteReport(viewingReport.id)}
                className="w-full sm:w-auto px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Report</span>
              </button>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewingReport(null);
                    onNavigateTab?.('mindcare');
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer"
                >
                  <Waves className="w-3.5 h-3.5" />
                  <span>Tune MindCare Soundscape ({viewingReport.recommendedSolfeggioHz} Hz)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewingReport(null);
                    onNavigateTab?.('remedies');
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Prescribe Remedies</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Active Report Sub-Modal */}
      {isArchiveModalOpen && currentReport && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-auto font-mono text-xs">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <Plus className="w-4 h-4" />
                <span>ARCHIVE CURRENT DIAGNOSTIC REPORT</span>
              </div>
              <button onClick={() => setIsArchiveModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold uppercase block">Report Title</label>
                <input
                  type="text"
                  value={archiveCustomTitle}
                  onChange={(e) => setArchiveCustomTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold uppercase block">Clinical Category</label>
                <select
                  value={archiveCategory}
                  onChange={(e) => setArchiveCategory(e.target.value as HealthCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {HEALTH_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold uppercase block">Clinical Notes / Context</label>
                <textarea
                  rows={3}
                  value={archiveNotes}
                  onChange={(e) => setArchiveNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsArchiveModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmArchiveActive}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer shadow-md"
              >
                Save to Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
