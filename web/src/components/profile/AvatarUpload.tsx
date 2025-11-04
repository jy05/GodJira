import { useState, useRef, ChangeEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/services/user.service';

interface AvatarUploadProps {
  currentAvatar?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const AvatarUpload = ({ currentAvatar }: AvatarUploadProps) => {
  const { refreshUser } = useAuth();
  const [preview, setPreview] = useState<string | undefined>(currentAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: (base64: string) => userApi.updateAvatar(base64),
    onSuccess: () => {
      refreshUser();
      toast.success('Avatar updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to upload avatar');
    },
  });

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error(
        `Invalid file type. Please upload: ${ALLOWED_MIME_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ')}`
      );
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Read and convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreview(base64String);
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (preview && preview !== currentAvatar) {
      uploadMutation.mutate(preview);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    uploadMutation.mutate('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    setPreview(currentAvatar);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasChanges = preview !== currentAvatar;

  return (
    <div className="space-y-4">
      {/* Avatar Preview */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {preview ? (
              <img
                src={preview}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                className="w-16 h-16 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* File Input */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="avatar-upload"
        />
        <label
          htmlFor="avatar-upload"
          className="btn btn-secondary w-full text-center cursor-pointer"
        >
          Choose Photo
        </label>
        <p className="mt-2 text-xs text-gray-500 text-center">
          JPG, PNG, GIF or WebP. Max 10MB
        </p>
      </div>

      {/* Success Message */}
      {uploadMutation.isSuccess && !hasChanges && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
          Avatar updated successfully!
        </div>
      )}

      {/* Action Buttons */}
      {hasChanges && (
        <div className="space-y-2">
          <button
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            className="btn btn-primary w-full"
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Save Avatar'}
          </button>
          <button
            onClick={handleCancel}
            disabled={uploadMutation.isPending}
            className="btn btn-secondary w-full"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Remove Button */}
      {preview && !hasChanges && (
        <button
          onClick={handleRemove}
          disabled={uploadMutation.isPending}
          className="btn btn-secondary w-full text-red-600 hover:bg-red-50"
        >
          Remove Avatar
        </button>
      )}
    </div>
  );
};
