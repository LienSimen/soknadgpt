import { ChangeEvent, useEffect, useRef } from 'react';

// PDF processing interface
export interface PdfProcessorProps {
  pdfFile?: File | null;
  onFileProcessed: (content: string) => void;
  onProcessingStart: () => void;
  onProcessingEnd: () => void;
  onError: (error: string) => void;
  fileInputRef?: React.RefObject<HTMLInputElement>;
}

// Lazy-loaded PDF processing functionality
function PdfProcessor({
  pdfFile,
  onFileProcessed,
  onProcessingStart,
  onProcessingEnd,
  onError,
  fileInputRef
}: PdfProcessorProps) {

  const processorRef = useRef<HTMLDivElement>(null);

  async function processFileFromInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files == null) return;
    if (event.target.files.length == 0) return;

    onProcessingStart();
    const file = event.target.files[0];
    await processFileContent(file);
  }

  async function processFileContent(file: File) {
    const fileReader = new FileReader();

    fileReader.onload = async function () {
      if (this.result == null) return;

      let textBuilder = '';
      try {
        if (file.type === 'application/pdf') {
          // Lazy load PDF.js only when needed
          const pdfjsLib = await import('pdfjs-dist');
          const typedarray = new Uint8Array(this.result as ArrayBuffer);
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;
          const loadingTask = pdfjsLib.getDocument(typedarray);
          const pdf = await loadingTask.promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const text = content.items.map((item: any) => item.str || '').join(' ');
            textBuilder += text;
          }
        } else if (file.type === 'text/plain') {
          textBuilder = this.result as string;
        } else if (
          file.type === 'application/msword' ||
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          // Lazy load mammoth only when needed
          const mammoth = await import('mammoth');
          const result = await mammoth.extractRawText({ arrayBuffer: this.result as ArrayBuffer });
          textBuilder = result.value;
        } else {
          onError('Unsupported file type. Please upload a PDF, TXT, DOC, or DOCX file.');
          return;
        }

        onFileProcessed(textBuilder);
        onProcessingEnd();
      } catch (err) {
        onError('An Error occurred uploading your file. Please try again.');
        console.error(err);
        onProcessingEnd();
      }
    };

    fileReader.onerror = function () {
      onError('An Error occurred reading the file. Please try again.');
      onProcessingEnd();
    };

    if (
      file.type === 'application/pdf' ||
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      fileReader.readAsArrayBuffer(file);
    } else if (file.type === 'text/plain') {
      fileReader.readAsText(file);
    } else {
      onError('Unsupported file type. Please upload a PDF, TXT, DOC, or DOCX file.');
      onProcessingEnd();
    }
  }

  // Process file when pdfFile prop changes
  useEffect(() => {
    if (pdfFile) {
      processFileContent(pdfFile);
    }
  }, [pdfFile]);

  useEffect(() => {
    const handleProcessFile = (event: CustomEvent) => {
      processFileFromInput(event.detail);
    };

    const element = processorRef.current;
    if (element) {
      element.addEventListener('processFile', handleProcessFile as EventListener);
      return () => {
        element.removeEventListener('processFile', handleProcessFile as EventListener);
      };
    }
  }, []);

  // This component renders a hidden div that listens for custom events
  return <div ref={processorRef} id="pdf-processor-trigger" style={{ display: 'none' }} />;
}

// Export the processing function for direct use
export { PdfProcessor as default };