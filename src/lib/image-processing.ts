
/**
 * Image processing utilities for OCR enhancement
 */

// Convert image/canvas to grayscale
export const toGrayscale = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg;     // Red
    data[i + 1] = avg; // Green
    data[i + 2] = avg; // Blue
  }
  
  ctx.putImageData(imageData, 0, 0);
  return ctx;
};

// Binarize image (black and white) using threshold
export const binarize = (ctx: CanvasRenderingContext2D, width: number, height: number, threshold = 128) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const value = avg >= threshold ? 255 : 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
  
  ctx.putImageData(imageData, 0, 0);
  return ctx;
};

// Increase contrast
export const increaseContrast = (ctx: CanvasRenderingContext2D, width: number, height: number, contrast = 20) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    data[i] = factor * (data[i] - 128) + 128;
    data[i + 1] = factor * (data[i + 1] - 128) + 128;
    data[i + 2] = factor * (data[i + 2] - 128) + 128;
  }
  
  ctx.putImageData(imageData, 0, 0);
  return ctx;
};

// Main enhancement function
export const enhanceImageForOCR = async (imageSource: string | File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Apply enhancements pipeline
      // 1. Grayscale
      toGrayscale(ctx, canvas.width, canvas.height);
      
      // 2. Contrast
      increaseContrast(ctx, canvas.width, canvas.height, 30);
      
      // 3. Mild Binarization (optional, sometimes too aggressive)
      // binarize(ctx, canvas.width, canvas.height, 150);

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = (err) => reject(err);

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      img.src = URL.createObjectURL(imageSource);
    }
  });
};
