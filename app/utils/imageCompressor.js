/**
 * Utility to compress images on the client side using HTML5 Canvas.
 * Resizes the image to a maximum dimension while maintaining aspect ratio,
 * and compresses it using JPEG or WebP format with quality optimization.
 * 
 * @param {File} file The original image file
 * @param {number} maxDimension Maximum width or height in pixels (default 1200)
 * @param {number} quality Compression quality between 0.0 and 1.0 (default 0.8)
 * @returns {Promise<File>} Compressed File or original file if compression is not beneficial/possible
 */
export const compressImage = (file, maxDimension = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    // Return original file if it's not an image
    if (!file || !file.type.startsWith('image/')) {
      return resolve(file);
    }

    // Don't try to compress SVGs or GIFs (to preserve animation/vectors)
    if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
      console.log('Skipping compression for GIF/SVG file');
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Check if resizing is necessary
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.warn('Canvas 2D context not available. Uploading original file.');
          return resolve(file);
        }

        // Draw and resize image onto the canvas
        ctx.drawImage(img, 0, 0, width, height);

        // We convert PNG/JPEG to image/jpeg for optimized photos.
        // If it is WebP, we can keep image/webp format.
        let outputType = 'image/jpeg';
        let extension = 'jpg';

        if (file.type === 'image/webp') {
          outputType = 'image/webp';
          extension = 'webp';
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.warn('Canvas toBlob failed. Uploading original file.');
              return resolve(file);
            }

            // Create a new File object
            const originalName = file.name;
            const lastDot = originalName.lastIndexOf('.');
            const baseName = lastDot !== -1 ? originalName.substring(0, lastDot) : originalName;
            const newName = `${baseName}_compressed.${extension}`;

            const compressedFile = new File([blob], newName, {
              type: outputType,
              lastModified: Date.now(),
            });

            // Compare sizes to ensure we actually got a smaller file
            if (compressedFile.size >= file.size) {
              console.log(
                `Compression did not reduce file size: original (${file.size} B) vs compressed (${compressedFile.size} B). Using original.`
              );
              resolve(file);
            } else {
              const savings = ((file.size - compressedFile.size) / file.size) * 100;
              console.log(
                `Compressed image successfully: ${originalName} (${(file.size / 1024 / 1024).toFixed(2)} MB) -> ${newName} (${(compressedFile.size / 1024 / 1024).toFixed(2)} MB), reduction: ${savings.toFixed(1)}%`
              );
              resolve(compressedFile);
            }
          },
          outputType,
          quality
        );
      };
      img.onerror = (err) => {
        console.error('Error loading image object for compression:', err);
        resolve(file);
      };
    };
    reader.onerror = (err) => {
      console.error('Error reading file for compression:', err);
      resolve(file);
    };
  });
};
