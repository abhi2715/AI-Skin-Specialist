import { useState, useRef } from 'react';
import { ImagePlus, Film, X } from 'lucide-react';

function UploadZone({ accept, icon: Icon, label, hint, file, onFileChange }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragEnter = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragging(false); };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) onFileChange(droppedFile);
  };

  const handleInputChange = (e) => {
    const selected = e.target.files[0];
    if (selected) onFileChange(selected);
  };

  const removeFile = (e) => {
    e.stopPropagation();
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const isImage = file && file.type.startsWith('image/');
  const isVideo = file && file.type.startsWith('video/');

  return (
    <div
      className={`upload-zone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => !file && inputRef.current?.click()}
    >
      {file ? (
        <>
          {isImage && (
            <img
              src={URL.createObjectURL(file)}
              alt="Upload preview"
              className="upload-preview"
            />
          )}
          {isVideo && (
            <video
              src={URL.createObjectURL(file)}
              className="upload-preview"
              muted
              playsInline
            />
          )}
          <div className="upload-overlay">
            <button className="upload-remove-btn" onClick={removeFile} aria-label="Remove file">
              <X size={18} />
            </button>
          </div>
        </>
      ) : (
        <>
          <Icon size={28} className="upload-zone-icon" />
          <span className="upload-zone-text">{label}</span>
          <span className="upload-zone-hint">{hint}</span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default function MediaUpload({ imageFile, videoFile, onImageChange, onVideoChange }) {
  return (
    <div className="media-uploads">
      <UploadZone
        accept="image/*"
        icon={ImagePlus}
        label="Skin Image"
        hint="Drag & drop or click"
        file={imageFile}
        onFileChange={onImageChange}
      />
      <UploadZone
        accept="video/*"
        icon={Film}
        label="Skin Video"
        hint="Optional · multiple angles"
        file={videoFile}
        onFileChange={onVideoChange}
      />
    </div>
  );
}
