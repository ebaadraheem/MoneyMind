import  { useState } from "react";
import { motion } from "framer-motion";
import ReturnWithInvoiceForm from "./ReturnWithInvoiceForm"; 
import ReturnWithoutInvoiceForm from "./ReturnWithoutInvoiceForm";

const PurchaseReturnForm = () => {
  const [returnMode, setReturnMode] = useState("with-invoice"); 

  return (
    <div className="p-6 bg-white rounded-lg shadow-md flex flex-col h-full">
      <h2 className="text-2xl max-sm:text-lg gap-2 font-bold text-blue-900/90 mb-6 border-b pb-3 flex items-center justify-between">
        <span className="flex items-center">
          <img src="/return-blue.png" className="w-8 h-8 max-sm:w-7 max-sm:h-7 mr-2" alt="Return Icon" />
           Purchase Return
        </span>
      </h2>
      <div className="mb-6 flex space-x-4 bg-gray-100 p-2 rounded-lg justify-center">
        <button
          onClick={() => setReturnMode("with-invoice")}
          className={`sm:px-6 px-3 max-sm:text-sm py-2 rounded-md cursor-pointer font-semibold transition-colors duration-200 ${
            returnMode === "with-invoice"
              ? "bg-blue-900/80 text-white shadow-md"
              : "bg-transparent text-gray-700 hover:bg-gray-200"
          }`}
        >
          Return with Invoice
        </button>
        <button
          onClick={() => setReturnMode("without-invoice")}
          className={`sm:px-6 px-3 max-sm:text-sm py-2 cursor-pointer rounded-md font-semibold transition-colors duration-200 ${
            returnMode === "without-invoice"
              ? "bg-blue-900/80 text-white shadow-md"
              : "bg-transparent text-gray-700 hover:bg-gray-200"
          }`}
        >
          Return without Invoice
        </button>
      </div>

      <motion.div
        key={returnMode} 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="flex-grow" 
      >
        {returnMode === "with-invoice" && <ReturnWithInvoiceForm />}
        {returnMode === "without-invoice" && <ReturnWithoutInvoiceForm />}
      </motion.div>
    </div>
  );
};

export default PurchaseReturnForm;