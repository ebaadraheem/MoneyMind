import { renderToString } from "react-dom/server"; // You might need to install 'react-dom/server'
import { toast } from "react-hot-toast"; // For notifications

/**
 * Handles the manual printing of a React component's content into an invisible iframe.
 *
 * @param {React.ComponentType<{ data: any }>} ReportContentComponent - The React component to render (e.g., PurchaseReportContent).
 * @param {object} reportData - The data to pass to the ReportContentComponent.
 * @param {string} [title="Document"] - The title for the print dialog and PDF.
 * @param {React.RefObject<HTMLIFrameElement>} iframeRef - A ref to the iframe element.
 */
const handleManualPrint = (
  ReportContentComponent,
  reportData,
  title = "Document",
  iframeRef // This ref is passed as an argument
) => {
  if (!reportData) {
    toast.error(`No ${title} data to print.`);
    return;
  }
  if (!iframeRef || !iframeRef.current) {
    toast.error("Print iframe not ready. Please ensure the iframeRef is passed and current.");
    console.error("Iframe reference is null or not current.");
    return;
  }

  try {
    // Render the React component to an HTML string
    const reportHtml = renderToString(
      <ReportContentComponent data={reportData} />
    );

    const iframe = iframeRef.current;
    const printWindow = iframe.contentWindow;

    // It's generally a good practice to clear any previous onload handlers
    // to prevent unexpected behavior from old content.
    iframe.onload = null;

    // Write the HTML to the iframe's document
    printWindow.document.open();
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="/index.css" rel="stylesheet"> 
          
          <style>
            body { 
                font-family: sans-serif; 
                margin: 0; 
                padding: 20mm; 
                color: #333; /* Ensure default text color */
            }
            @page { size: auto; margin: 20mm; }
            /* Add any critical Tailwind 'print:' utility styles here if not linking the full CSS */
            .print\\:text-xs { font-size: 0.75rem !important; }
            .print\\:p-0 { padding: 0 !important; }
            .print\\:text-xl { font-size: 1.25rem !important; }
            .print\\:mb-1 { margin-bottom: 0.25rem !important; }
            .print\\:pb-1 { padding-bottom: 0.25rem !important; }
            .print\\:text-base { font-size: 1rem !important; }
            .print\\:space-y-0\\.5 > *:not([hidden]) ~ *:not([hidden]) { margin-top: 0.125rem !important; }
            .print\\:mb-3 { margin-bottom: 0.75rem !important; }
            .print\\:mt-4 { margin-top: 1rem !important; }
            /* Also ensure table borders and headers are consistent for print */
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #bfbfbf; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="report-container">
            ${reportHtml}
          </div>
        </body>
        </html>
      `);
    printWindow.document.close();

    // Define the onload handler BEFORE attempting to print.
    // This is crucial because loading external CSS (like /index.css) takes time.
    iframe.onload = () => {
      printWindow.focus(); // Focus the iframe content
      printWindow.print(); // Trigger the print dialog

      // Optional: Clean up the iframe's content or hide it after printing.
      // printWindow.onafterprint = () => {
      //   // For example, to hide the iframe or clear its content
      //   // iframe.style.display = 'none';
      //   // printWindow.document.body.innerHTML = '';
      //   // You could also resolve a promise here if you want to await printing.
      // };
    };

    // Edge case: If the content loads *immediately* (e.g., no external CSS or it's cached),
    // the `onload` event might have already fired before we attached the handler.
    // So, we explicitly check `readyState` and trigger print if it's already complete.
    // This handles cases where `onload` might not fire reliably.
    if (iframe.contentDocument.readyState === "complete") {
      printWindow.focus();
      printWindow.print();
    }

  } catch (error) {
    console.error("Error during manual print:", error);
    toast.error("Failed to prepare document for printing. " + error.message);
  }
};

export default handleManualPrint;