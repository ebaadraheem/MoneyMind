import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useRef, useEffect, useState, useCallback } from "react";
import InvoiceContent from "./InvoiceContent";
import toast from "react-hot-toast";
import { renderToString } from "react-dom/server";
import useStore from "../../store/useStore";

export default function InvoiceModal({ invoice, onClose }) {
  const iframeRef = useRef(); 
  const [isPrintReady, setIsPrintReady] = useState(true); 
  const [localShow, setLocalShow] = useState(false);
  const { businessDetails } = useStore();

  useEffect(() => {
    if (invoice) {
      setLocalShow(true);
    } else {
      setLocalShow(false);
    }
  }, [invoice]);

  useEffect(() => {
    if (localShow && invoice) {
      setIsPrintReady(true);
    } else {
      setIsPrintReady(false);
    }
  }, [localShow, invoice]);

  const handleManualPrint = useCallback(() => {
    if (!invoice) {
      toast.error("No invoice data to print.");
      return;
    }
    if (!iframeRef.current) {
      toast.error("Print iframe not ready. Please try again.");
      return;
    }

    try {
      const invoiceHtml = renderToString(<InvoiceContent invoice={invoice} businessDetails={businessDetails} />);

      const iframe = iframeRef.current;
      let printWindow = iframe.contentWindow;
      printWindow.document.open();
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice</title>
          <style>
            /* Inject Tailwind CSS (or relevant styles) here for print */
            /* You might need to inline styles or use a utility like postcss-nesting/tailwindcss-nesting */
            /* Or link your main CSS file if it's accessible from the iframe */
            @import url('YOUR_MAIN_TAILWIND_CSS_PATH'); /* e.g., /path/to/tailwind.css or /index.css if served directly */

            /* Basic print styles */
            body { font-family: sans-serif; margin: 0; padding: 20mm; }
            @page { size: auto; margin: 20mm; }
            .no-print { display: none !important; } /* Hide elements not meant for print */
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #eee; padding: 8px; text-align: left; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            /* Add any other critical styles for print from InvoiceContent */
            .font-extrabold { font-weight: 800; }
            .text-blue-900\/80 { color: rgba(17, 24, 39, 0.8); } /* Tailwind color conversion */
            .text-gray-600 { color: #4b5563; }
            /* ... add more critical Tailwind styles ... */
          </style>
        </head>
        <body>
          <div class="invoice-container">
            ${invoiceHtml}
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      iframe.onload = () => {
        printWindow.focus(); 
        printWindow.print(); 
      };
    } catch (error) {
      console.error("Error during manual print:", error);
      toast.error("Failed to prepare invoice for printing. " + error.message);
    }
  }, [invoice, onClose]);

  if (!invoice) {
    return null; 
  }

  return (
    <Transition appear show={localShow} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-md bg-white p-6 text-left align-middle shadow-xl transition-all">

                <InvoiceContent invoice={invoice} businessDetails={businessDetails} />

                <div className="mt-6 flex justify-end space-x-4 no-print">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={isPrintReady ? handleManualPrint : undefined} 
                    className={`px-4 py-2 bg-blue-900/80 text-white font-semibold rounded transition-all ${
                      !isPrintReady
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-blue-900/95"
                    }`}
                  >
                    Print Invoice
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>

      <iframe
        ref={iframeRef}
        title="Print Document"
        style={{
          position: "absolute",
          width: "0",
          height: "0",
          border: "0",
          top: "-1000px",
          left: "-1000px",
        }}
      />
    </Transition>
  );
}
