import React, { useId, useState } from 'react';
import { Avatar } from '../ui/Avatar';
import { buttonStyles } from '../ui/Button';

interface PhotoUploadProps {
  name: string;
  photo: string;
  onChange: (photo: string) => void;
}

export function PhotoUpload({ name, photo, onChange }: PhotoUploadProps) {
  const id = useId();
  const [error, setError] = useState('');

  const onFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file (JPG or PNG).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('That image is over 2 MB. Try a smaller one.');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' && onChange(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-5">
      <Avatar name={name || 'You'} photo={photo} size="xl" />
      <div>
        <div className="flex flex-wrap gap-2">
          <label htmlFor={id} className={buttonStyles('secondary', 'sm', 'cursor-pointer')}>
            {photo ? 'Change photo' : 'Upload photo'}
          </label>
          <input id={id} type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
          {photo &&
          <button type="button" onClick={() => onChange('')} className={buttonStyles('ghost', 'sm')}>
              Remove
            </button>
          }
        </div>
        <p className={`mt-2 text-sm ${error ? 'text-rust-600' : 'text-ink-muted'}`} role={error ? 'alert' : undefined}>
          {error || 'Optional · JPG or PNG, up to 2 MB.'}
        </p>
      </div>
    </div>);

}