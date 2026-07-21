const API_BASE = '/api';

export async function analyzeConsultation(audioBlob, imageFile, videoFile) {
  const formData = new FormData();

  // Audio is required
  formData.append('audio', audioBlob, 'recording.webm');

  // Image (optional)
  if (imageFile) {
    formData.append('image', imageFile);
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
    const error = await response.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(error.detail || 'Analysis failed');
  }

  return response.json();
}
