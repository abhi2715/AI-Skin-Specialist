const API_BASE = '/api';

/**
 * Compresses an image file to reduce upload size, preventing Vercel 413 Payload Too Large errors.
 * Max dimension: 1024px.
 */
async function compressImage(imageFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], imageFile.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(imageFile); // Fallback
            }
          },
          'image/jpeg',
          0.8
        );
      };
      img.onerror = () => resolve(imageFile); // Fallback
    };
    reader.onerror = () => resolve(imageFile); // Fallback
  });
}

export async function analyzeConsultation(audioBlob, imageFile, videoFile) {
  const formData = new FormData();

  // Audio is required
  formData.append('audio', audioBlob, 'recording.webm');

  // Image (optional)
  if (imageFile) {
    try {
      const compressedImage = await compressImage(imageFile);
      formData.append('image', compressedImage);
    } catch (e) {
      formData.append('image', imageFile);
    }
  }

  // Video (optional)
  if (videoFile) {
    formData.append('video', videoFile);
  }

  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 413) {
      throw new Error('File size is too large for Vercel limits (4.5MB). Please upload a smaller image or video.');
    }
    if (response.status === 504) {
      throw new Error('Vercel Timeout (10s limit exceeded). The AI took too long to respond. Please try again.');
    }
    if (response.status === 500) {
      // Could be our backend JSON or a Vercel HTML crash page
      try {
        const error = await response.json();
        throw new Error(error.detail || 'Internal Server Error from backend.');
      } catch (e) {
        throw new Error('Vercel Serverless Function Crashed (500). Please check Vercel dashboard logs.');
      }
    }

    const error = await response.json().catch(() => ({ detail: `HTTP Error ${response.status}` }));
    throw new Error(error.detail || `Analysis failed with status ${response.status}`);
  }

  return response.json();
}
