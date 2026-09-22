import React, { useState, useEffect } from 'react';
import {
  Camera,
  Layers,
  Sparkles,
  Sliders,
  Maximize2,
  Download,
  Eye,
  Calendar,
  ShieldCheck,
  FileImage,
  ArrowRightLeft,
  ChevronRight
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';

interface DentalImagingTabProps {
  patientId: string;
  patientName: string;
}

export const DentalImagingTab: React.FC<DentalImagingTabProps> = ({
  patientId,
  patientName,
}) => {
  const [loading, setLoading] = useState(true);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'xray' | '3d_scan' | 'before_after'>('all');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  useEffect(() => {
    fetchMedia();
  }, [patientId]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/clinical/media/${patientId}`);
      const data = await res.json();
      if (data.success && data.media) {
        setMediaList(data.media);
      }
    } catch (err) {
      console.error('Failed to load dental media:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const container = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const offsetX = clientX - container.left;
    const percentage = Math.max(0, Math.min(100, (offsetX / container.width) * 100));
    setSliderPosition(percentage);
  };

  const defaultBeforeAfter = {
    title: 'Anterior Aesthetic Smile Design (Teeth #6 - #11)',
    procedure: 'Minimally-invasive porcelain veneers and gingival contouring',
    completedDate: 'September 15, 2026',
    doctor: 'Dr. Sarah Jensen, DDS',
    beforeUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80',
    notes: 'Eliminated mild midline diastema and corrected moderate incisal wear with natural translucent ceramics.'
  };

  const filteredMedia = activeCategory === 'all'
    ? mediaList
    : mediaList.filter((m) => m.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <GlassCard className="p-6 border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-blue-950/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-cyan-500/10 border-cyan-400/30 text-cyan-300 text-xs">
                Clinical Imaging & 3D Diagnostics
              </Badge>
              <span className="text-xs text-slate-400">High-Resolution Radiography & Orthodontic Scans</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Patient Digital Imaging Portal
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Protected medical imaging accessible for treatment reviews and specialist second opinions.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
            {[
              { id: 'all', label: 'All Records' },
              { id: 'before_after', label: 'Before & After' },
              { id: 'xray', label: 'Bitewing X-Rays' },
              { id: '3d_scan', label: '3D Scans' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeCategory === tab.id
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Interactive Before / After Split Slider Showcase */}
      {(activeCategory === 'all' || activeCategory === 'before_after') && (
        <GlassCard className="p-6 border border-slate-800 bg-slate-900/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">{defaultBeforeAfter.title}</h3>
                <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 text-xs">
                  Interactive Comparison Slider
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{defaultBeforeAfter.procedure} &bull; {defaultBeforeAfter.completedDate}</p>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>Drag slider horizontally to compare</span>
            </div>
          </div>

          {/* Slider Container */}
          <div
            className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden cursor-ew-resize select-none border border-slate-700 shadow-2xl bg-black"
            onMouseMove={(e) => {
              if (isDraggingSlider || e.buttons === 1) handleSliderMove(e);
            }}
            onTouchMove={handleSliderMove}
            onMouseDown={() => setIsDraggingSlider(true)}
            onMouseUp={() => setIsDraggingSlider(false)}
          >
            {/* After Image (Full background) */}
            <img
              src={defaultBeforeAfter.afterUrl}
              alt="After Procedure Smile"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-xs font-bold">
              AFTER (Finished Ceramic Restorations)
            </div>

            {/* Before Image (Clipped overlay) */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={defaultBeforeAfter.beforeUrl}
                alt="Before Procedure Smile"
                className="absolute inset-0 w-full h-full object-cover max-w-none"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-slate-600 text-slate-300 text-xs font-bold">
                BEFORE (Baseline Presentation)
              </div>
            </div>

            {/* Vertical Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center pointer-events-auto cursor-ew-resize border-2 border-cyan-500">
                <ArrowRightLeft className="w-4 h-4 text-cyan-600" />
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Clinical Note: </span>
              {defaultBeforeAfter.notes}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Media Records Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Diagnostic Imaging Records ({filteredMedia.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Click any image to view details</span>
        </div>

        {filteredMedia.length === 0 ? (
          <GlassCard className="p-12 text-center text-slate-400 border border-slate-800">
            <FileImage className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm">No diagnostic images in this category.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedia.map((media) => (
              <GlassCard
                key={media.id}
                className="overflow-hidden border border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 transition-all group cursor-pointer"
                onClick={() => setSelectedImage(media)}
              >
                <div className="relative h-48 bg-slate-950 overflow-hidden">
                  <img
                    src={media.thumbnailUrl || media.imageUrl}
                    alt={media.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-black/60 backdrop-blur-sm border-slate-600 text-slate-300 text-[10px] uppercase">
                      {media.category === 'xray' ? 'Radiograph' : media.category === '3d_scan' ? '3D Scan' : 'Clinical Photo'}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-medium">
                    <span className="truncate">{media.title}</span>
                    <Eye className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-cyan-400" />
                      {media.takenDate}
                    </span>
                    <span>{media.doctorName || 'Dr. Jensen'}</span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {media.findings || media.description}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Expanded Image Inspection */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">{selectedImage.title}</h3>
                <span className="text-xs text-slate-400">{selectedImage.takenDate} &bull; {selectedImage.doctorName}</span>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="max-h-[60vh] bg-black flex items-center justify-center p-2">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="max-h-[55vh] object-contain rounded-lg"
              />
            </div>

            <div className="p-4 space-y-3 bg-slate-900">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-200">
                <span className="font-semibold text-cyan-300">Radiological Findings: </span>
                {selectedImage.findings || selectedImage.description}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Close
                </button>
                <a
                  href={selectedImage.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Full-Res DICOM/JPEG
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
