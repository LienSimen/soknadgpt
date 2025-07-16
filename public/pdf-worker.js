// Web Worker for PDF processing to avoid blocking main thread
self.onmessage = function(e) {
  const { type, data } = e.data;
  
  switch (type) {
    case 'PROCESS_PDF':
      // Simulate heavy PDF processing
      try {
        // Process PDF data here
        const result = processPDF(data);
        self.postMessage({ type: 'PDF_PROCESSED', result });
      } catch (error) {
        self.postMessage({ type: 'PDF_ERROR', error: error.message });
      }
      break;
    
    case 'GENERATE_QR':
      // Generate QR code data
      try {
        const qrData = generateQRData(data);
        self.postMessage({ type: 'QR_GENERATED', result: qrData });
      } catch (error) {
        self.postMessage({ type: 'QR_ERROR', error: error.message });
      }
      break;
  }
};

function processPDF(data) {
  // Heavy PDF processing logic
  return { processed: true, data };
}

function generateQRData(data) {
  // QR generation logic
  return { qrCode: data };
}