// components/PurchaseComponents/ReturnWithInvoiceForm.jsx
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import useStore from "../../store/useStore";
import toast from "react-hot-toast";
import PurchaseApis from "../../services/PurchaseApis";
import PurchaseReturnFormCommon from "./PurchaseReturnFormCommon";
import { AnimatePresence, motion } from "framer-motion";
import { uid } from "uid"; // Make sure uid is imported here
import { IconSearch } from "../../utils/Icons"; // Assuming you have an IconSearch for the input

const Detail = ({ label, value, className = "" }) => (
  <div className={className}>
    <span className="font-semibold">{label}:</span>{" "}
    <span className="text-gray-700">{value || "N/A"}</span>
  </div>
);

const ReturnWithInvoiceForm = () => {
  const { setLoading, setError, purchases, setPurchases } = useStore();
  const [searchInvoiceQuery, setSearchInvoiceQuery] = useState("");
  const [originalPurchase, setOriginalPurchase] = useState(null);
  const [invoiceSearchResults, setInvoiceSearchResults] = useState([]);
  const [showInvoiceDropdown, setShowInvoiceDropdown] = useState(false);
  const [highlightedInvoiceIndex, setHighlightedInvoiceIndex] = useState(-1); // New state for keyboard navigation
  const [initialInvoiceNumber, setInitialInvoiceNumber] = useState(
    `PRR-${uid(10).toUpperCase()}`
  ); // Initial invoice number prefix

  const invoiceSearchRef = useRef(null); // Ref for the search input container
  const invoiceResultsListRef = useRef(null); // Ref for the invoice results <ul>

  // Debounced search for invoices
  const debouncedInvoiceSearch = useCallback(
    async (query) => {
      if (!query.trim()) {
        setInvoiceSearchResults([]);
        setHighlightedInvoiceIndex(-1); // Reset highlight
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Filter purchases from the store based on the query
        const filtered = purchases.filter((p) =>
          p.invoiceNumber.toLowerCase().includes(query.toLowerCase())
        );
        setInvoiceSearchResults(filtered);
        setHighlightedInvoiceIndex(filtered.length > 0 ? 0 : -1); // Highlight first or none
        setShowInvoiceDropdown(filtered.length > 0);
      } catch (err) {
        setError("Failed to search invoices.");
        toast.error("Failed to search invoices. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [purchases, setLoading, setError]
  );

  // Trigger debounced search when searchInvoiceQuery changes
  useEffect(() => {
    const handler = setTimeout(() => {
      debouncedInvoiceSearch(searchInvoiceQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInvoiceQuery, debouncedInvoiceSearch]);

  // Fetch purchases on mount
  useEffect(() => {
    const fetchPurchases = async () => {
      setLoading(true);
      try {
        const allPurchases = await PurchaseApis.getAllPurchases();
        setPurchases(allPurchases);
      } catch (err) {
        console.error("Failed to fetch purchases:", err);
        toast.error(`Failed to fetch purchases: ${err.message}`);
        setError(`Failed to fetch purchases: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, [setLoading, setError, setPurchases]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        invoiceSearchRef.current &&
        !invoiceSearchRef.current.contains(event.target) &&
        invoiceResultsListRef.current && // Also check the list itself
        !invoiceResultsListRef.current.contains(event.target)
      ) {
        setShowInvoiceDropdown(false);
        setHighlightedInvoiceIndex(-1); // Reset highlight
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Effect to scroll the highlighted invoice into view
  useEffect(() => {
    if (invoiceResultsListRef.current && highlightedInvoiceIndex !== -1) {
      const highlightedItem =
        invoiceResultsListRef.current.children[highlightedInvoiceIndex];
      if (highlightedItem) {
        highlightedItem.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [highlightedInvoiceIndex]);

  const handleSearchPurchase = useCallback(
    async (invoiceToSearch) => {
      toast.dismiss();
      if (!invoiceToSearch.trim()) {
        toast.error("Please enter an invoice number to search.");
        setOriginalPurchase(null);
        return;
      }
      setLoading(true);
      try {
        const foundPurchase = await PurchaseApis.getPurchaseByInvoiceNumber(
          invoiceToSearch.trim()
        );
        setOriginalPurchase(foundPurchase);
        setSearchInvoiceQuery(""); // Clear search input after successful search
        setInvoiceSearchResults([]); // Clear search results after successful search
        setShowInvoiceDropdown(false); // Hide dropdown
        setHighlightedInvoiceIndex(-1); // Reset highlight

        toast.success("Original purchase found!");
      } catch (err) {
        console.error("Failed to search purchase:", err);
        toast.error(
          `Failed to find purchase: ${
            err.response?.data?.message || err.message
          }`
        );
        setOriginalPurchase(null); // Clear original purchase on error
        setError(`Failed to search purchase: ${err.message}`);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  // Keyboard navigation handler for invoice search input
  const handleInvoiceKeyDown = useCallback(
    (e) => {
      if (invoiceSearchResults.length === 0 || !showInvoiceDropdown) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedInvoiceIndex((prevIndex) =>
          Math.min(prevIndex + 1, invoiceSearchResults.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedInvoiceIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault(); // Prevent form submission
        if (highlightedInvoiceIndex !== -1) {
          // Select the highlighted invoice
          handleSearchPurchase(
            invoiceSearchResults[highlightedInvoiceIndex].invoiceNumber
          );
        } else {
          // If no highlight, but Enter is pressed, trigger a search for the current input
          handleSearchPurchase(searchInvoiceQuery);
        }
      }
    },
    [
      invoiceSearchResults,
      highlightedInvoiceIndex,
      showInvoiceDropdown,
      searchInvoiceQuery,
      handleSearchPurchase,
    ]
  );

  const onCartItemsInitialize = useCallback(() => {
    if (originalPurchase) {
      return originalPurchase.items.map((item) => ({
        productId: item.product._id,
        productName: item.product.name,
        productCode: item.product.code,
        instock: item.instock, // Original quantity in the purchase
        purchasePriceAtReturn: item.purchasePrice,
        quantity: 0, // Initial quantity to return in common cart structure
        total: 0,
      }));
    }
    return []; // Return empty array if no original purchase or after reset
  }, [originalPurchase]);

  const validateQuantityWithInvoice = useCallback(
    (itemInCart, newQuantity) => {
      const originalItem = originalPurchase?.items.find(
        (item) => item.product._id === itemInCart.productId
      );
      const maxReturnable = originalItem ? originalItem.instock : 0; // Use original quantity from the purchase

      if (newQuantity > maxReturnable) {
        return {
          error: `Cannot return more than ${maxReturnable} for ${itemInCart.productName}`,
          correctedItem: {
            ...itemInCart,
            quantity: maxReturnable,
            total: maxReturnable * itemInCart.purchasePriceAtReturn,
          },
        };
      }
      if (newQuantity < 0) {
        return {
          error: "Returned quantity cannot be negative.",
          correctedItem: {
            ...itemInCart,
            quantity: 0,
            total: 0,
          },
        };
      }
      return { error: null };
    },
    [originalPurchase]
  ); // Dependency on originalPurchase for original quantities

  const resetFormSpecifics = useCallback(() => {
    setSearchInvoiceQuery("");
    setOriginalPurchase(null);
    setInvoiceSearchResults([]);
    setShowInvoiceDropdown(false);
    setHighlightedInvoiceIndex(-1); // Reset highlight
  }, []);

  const modalDetails = useMemo(
    () => ({
      returnInvoiceNumber: {
        label: "Return Invoice #",
        value: initialInvoiceNumber, // Use the initial invoice number
      },
      originalPurchase: {
        label: "Original Purchase #",
        value: originalPurchase?.invoiceNumber || "N/A",
      },
      supplier: {
        label: "Supplier",
        value: `${originalPurchase?.supplier?.name || "N/A"} ${
          originalPurchase?.supplier?.company
            ? `(${originalPurchase.supplier.company})`
            : ""
        }`,
      },
      returnDate: {
        label: "Return Date",
        value: new Date().toLocaleDateString(),
      },
    }),
    [originalPurchase]
  );

  const modalItemsColumns = useMemo(
    () => [
      { key: "productName", label: "Product" },
      { key: "productCode", label: "Code" },
      { key: "quantity", label: "Returned Qty" },
      {
        key: "purchasePriceAtReturn",
        label: "Price",
        render: (item) => `${item.purchasePriceAtReturn.toFixed(2)}`,
      },
      {
        key: "total",
        label: "Total",
        render: (item) => `${item.total.toFixed(2)}`,
        align: "right",
      },
    ],
    []
  );

  return (
    <PurchaseReturnFormCommon
      titlePrefix="Purchase Return"
      initialInvoiceNumber={initialInvoiceNumber} // Pass the initial invoice number
      onInvoiceReset={
        () => setInitialInvoiceNumber(`PRR-${uid(10).toUpperCase()}`) // Reset to a new invoice number
      }
      onCartItemsInitialize={onCartItemsInitialize} // Pass the memoized callback
      validateQuantity={validateQuantityWithInvoice}
      createReturnApi={PurchaseApis.createPurchaseReturn}
      originalPurchaseDetails={
        originalPurchase && ( // Pass only the relevant detail JSX here
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Selected Purchase Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Detail
                label="Invoice No."
                value={originalPurchase.invoiceNumber}
              />
              <Detail
                label="Supplier"
                value={`${originalPurchase.supplier?.name} ${
                  originalPurchase.supplier?.company
                    ? `(${originalPurchase.supplier.company})`
                    : ""
                }`}
              />
              <Detail
                label="Purchase Date"
                value={new Date(
                  originalPurchase.purchaseDate
                ).toLocaleDateString()}
              />
              <Detail
                label="Total Amount"
                value={`${originalPurchase.totalAmount?.toFixed(2)}`}
              />
            </div>
          </div>
        )
      }
      searchComponent={
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-xl max-sm:text-lg font-semibold mb-3">
            Search Original Purchase
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative flex-grow" ref={invoiceSearchRef}>
              <input
                type="text"
                placeholder="Enter original invoice number..."
                value={searchInvoiceQuery}
                onChange={(e) => {
                  setSearchInvoiceQuery(e.target.value);
                  setHighlightedInvoiceIndex(-1);
                  if (e.target.value.trim() === "") {
                    setInvoiceSearchResults([]);
                    setShowInvoiceDropdown(false);
                  } else {
                    setShowInvoiceDropdown(true);
                  }
                }}
                onFocus={() => {
                  if (
                    searchInvoiceQuery.trim() !== "" ||
                    invoiceSearchResults.length > 0
                  ) {
                    setShowInvoiceDropdown(true);
                  }
                }}
                onKeyDown={handleInvoiceKeyDown}
                className="w-full max-sm:text-sm p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/90 focus:border-transparent transition duration-200 outline-none"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">
                <IconSearch className="w-5 h-5" />{" "}
              </div>
              <AnimatePresence>
                {showInvoiceDropdown && invoiceSearchResults.length > 0 && (
                  <motion.ul
                    ref={invoiceResultsListRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1"
                  >
                    {invoiceSearchResults.map((purchase, index) => (
                      <li
                        key={purchase._id}
                        className={`p-2 max-sm:text-sm cursor-pointer border-b border-gray-200 last:border-b-0 ${
                          index === highlightedInvoiceIndex
                            ? "bg-blue-100"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() =>
                          handleSearchPurchase(purchase.invoiceNumber)
                        }
                      >
                        {purchase.invoiceNumber} - (
                        {new Date(purchase.purchaseDate).toLocaleDateString()})
                      </li>
                    ))}
                  </motion.ul>
                )}
                {showInvoiceDropdown &&
                  searchInvoiceQuery.trim() !== "" &&
                  invoiceSearchResults.length === 0 && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 p-3 text-center text-gray-600">
                      No matching invoices found.
                    </div>
                  )}
              </AnimatePresence>
            </div>
            <button
              onClick={() => handleSearchPurchase(searchInvoiceQuery)}
              className="px-6 max-sm:text-sm py-2 cursor-pointer bg-blue-900/80 text-white rounded-md hover:bg-blue-900/90 transition duration-200"
            >
              Search
            </button>
          </div>
        </div>
      }
      modalTitle="Purchase Return (With Original Invoice)"
      modalDetails={modalDetails}
      modalItemsColumns={modalItemsColumns}
      resetFormSpecifics={resetFormSpecifics}
      supplierId={originalPurchase?.supplier?._id} // Pass supplier ID for invoice
      supplier_purchase_details={
        originalPurchase
          ? {
              supplier: originalPurchase.supplier,
              purchase: originalPurchase,
            }
          : {}
      }
    />
  );
};

export default ReturnWithInvoiceForm;
