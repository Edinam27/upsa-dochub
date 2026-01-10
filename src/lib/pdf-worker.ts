import { pdfjs } from 'react-pdf';

// Use the version that matches the installed pdfjs-dist
// We use a CDN because setting up the worker locally with Next.js App Router can be tricky
// and cause "Object.defineProperty" errors if versions mismatch.
// react-pdf 9.1.1 uses pdfjs-dist 4.4.168
const VERSION = '4.4.168';
const WORKER_URL = `https://unpkg.com/pdfjs-dist@${VERSION}/build/pdf.worker.min.mjs`;
const CMAP_URL = `https://unpkg.com/pdfjs-dist@${VERSION}/cmaps/`;

export const setupPDFWorker = () => {
  if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = WORKER_URL;
  }
};

// Also export the URL in case it's needed elsewhere
export const PDF_WORKER_URL = WORKER_URL;
export const PDF_CMAP_URL = CMAP_URL;
