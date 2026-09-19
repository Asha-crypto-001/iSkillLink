import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Camera, Upload, X, Check, Image as ImageIcon,
  Sparkles, RefreshCw, AlertCircle
} from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface ProfilePhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (newAvatarUrl: string) => void;
}

const PRESET_AVATARS = [
  { id: 'p1', label: 'Artisan 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { id: 'p2', label: 'Artisan 2', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { id: 'p3', label: 'Professional 1', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80' },
  { id: 'p4', label: 'Professional 2', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80' },
  { id: 'p5', label: 'Trainer 1', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' },
  { id: 'p6', label: 'Trainer 2', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80' },
  { id: 'p7', label: 'Leader 1', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80' },
  { id: 'p8', label: 'Student 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
];

export const ProfilePhotoUploadModal: React.FC<ProfilePhotoUploadModalProps> = ({
  isOpen,
  onClose,
  onUpdated
}) => {
  const { user, updateAvatar } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string>(user?.avatar_url || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState<string>('');
  const [tab, setTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Phase 5 polish: ensure dialog handles Esc/focus via Modal wrapper when open
  if (!isOpen) return null;

  // Process uploaded image — compress via canvas and prepare binary file for multipart upload (6.4)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    setSuccessMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }
    // Keep original file for binary upload pipeline; preview via compressed canvas
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Draw to canvas with 350x350 max bounds for fast loading
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;

        const targetDim = 320;
        canvas.width = targetDim;
        canvas.height = targetDim;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, startX, startY, size, size, 0, 0, targetDim, targetDim);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setSelectedImage(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setSelectedImage(urlInput.trim());
    setUrlInput('');
  };

  const handleSave = async () => {
    if (!selectedImage && !selectedFile) {
      setErrorMsg('Please upload or choose a photo first.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    try {
      let avatarUrl = selectedImage;
      // If a binary file was selected, upload via multipart pipeline (6.4) and use returned file path
      if (selectedFile) {
        const uploadRes = await api.uploadAvatar(selectedFile, user?.id);
        if (uploadRes.success && uploadRes.url) {
          avatarUrl = uploadRes.url;
        } else if (selectedImage) {
          avatarUrl = selectedImage;
        }
      }
      await updateAvatar(avatarUrl);
      setSuccessMsg('Profile picture updated successfully!');
      if (onUpdated) onUpdated(avatarUrl);
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
        setSelectedFile(null);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update photo. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId="photo-upload-title" title="Update Profile Picture" maxWidth="max-w-md">
        {/* Header — pinned */}
        <div className="shrink-0 px-6 py-4 border-b border-ink-100 flex items-center justify-between bg-ink-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-control bg-forest-100 text-forest-800 flex items-center justify-center font-bold" aria-hidden="true">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 id="photo-upload-title" className="text-sm font-bold text-ink-900 font-display">Update Profile Picture</h3>
              <p className="text-[11px] text-ink-600">
                {user?.name} ({user?.role?.toUpperCase()})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] rounded-control text-ink-400 hover:text-ink-600 hover:bg-ink-100 transition focus-visible:ring-2 focus-visible:ring-forest-700 flex items-center justify-center"
            aria-label="Close photo upload"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Messages — Phase 5: explicit roles, dismissible */}
          {errorMsg && (
            <div className="p-3 rounded-control bg-rose-50 border border-rose-200 text-rose-800 text-[13px] flex items-center gap-2" role="alert" aria-live="assertive">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-control bg-forest-50 border border-forest-200 text-forest-800 text-[13px] flex items-center gap-2" role="status" aria-live="polite">
              <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current / Preview Image Display */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full ring-4 ring-emerald-500/20 overflow-hidden shadow-inner bg-gray-100">
                <img
                  src={selectedImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-emerald-700 text-white shadow-md hover:bg-emerald-800 transition"
                title="Choose file"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-gray-500">Photo preview as displayed across iSkillLink</p>
          </div>

          {/* Method Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTab('upload')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                tab === 'upload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Upload Device File
            </button>
            <button
              type="button"
              onClick={() => setTab('url')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                tab === 'url' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Image URL
            </button>
            <button
              type="button"
              onClick={() => setTab('presets')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                tab === 'presets' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Presets
            </button>
          </div>

          {/* Tab 1: File Upload */}
          {tab === 'upload' && (
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-emerald-600 rounded-xl p-5 text-center cursor-pointer transition hover:bg-emerald-50/30 flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Click to choose image from phone or PC</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Supports PNG, JPG, or WebP (automatically cropped)</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: URL Input */}
          {tab === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Direct Image Web Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/my-photo.jpg"
                    className="flex-1 p-2 rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800"
                  >
                    Load
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Presets */}
          {tab === 'presets' && (
            <div className="space-y-2">
              <p className="text-[11px] text-gray-500 font-medium">Select a verified professional portrait:</p>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AVATARS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedImage(p.url)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition ${
                      selectedImage === p.url ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-transparent hover:opacity-80'
                    }`}
                  >
                    <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                    {selectedImage === p.url && (
                      <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions — pinned + safe-area */}
        <div className="shrink-0 px-6 py-4 bg-ink-50 border-t border-ink-100 flex items-center justify-end gap-3 pb-safe">
          <Button variant="ghost" size="md" type="button" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="button" onClick={handleSave} disabled={isSaving || !selectedImage} isLoading={isSaving} leftIcon={<Check className="w-3.5 h-3.5" aria-hidden="true" />}>
            Save Profile Photo
          </Button>
        </div>
    </Modal>
  );
};
