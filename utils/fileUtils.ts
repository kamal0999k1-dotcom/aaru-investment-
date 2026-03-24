export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const SUPPORTED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export const validateFile = (file: File): string | null => {
  if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
    return `Unsupported file type: ${file.type}. Please upload PNG, JPG, or WEBP.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File is too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Maximum size is 5MB.`;
  }
  return null;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // result is a data URL: "data:image/png;base64,iVBORw0KGgo..."
      // We only need the base64 part.
      if (typeof reader.result === 'string') {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error("Failed to read file as a data URL string."));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};
