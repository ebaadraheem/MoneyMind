import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import useStore from "../../store/useStore";
import toast from "react-hot-toast";
import SaleApis from "../../services/SaleApis";
import SaleReturnFormCommon from "./SaleReturnFormCommon";
import { AnimatePresence, motion } from "framer-motion";
import { uid } from "uid"; 
import { IconSearch } from "../../utils/Icons";

const Detail = ({ label, value, className = "" }) => (
  <div className={className}>
    <span className="font-semibold">{label}:</span>{" "}
    <span className="text-gray-700">{value || "N/A"}</span>
  </div>
);

const SaleReturnWithInvoice = () => {
  const { setLoading, setError, sales, setSales } = useStore();
  const [searchInvoiceQuery, setSearchInvoiceQuery] = useState("");
  const [originalSale, setOriginalSale] = useState(null);
  const [invoiceSearchResults, setInvoiceSearchResults] = useState([]);
  const [showInvoiceDropdown, setShowInvoiceDropdown] = useState(false);
  const [highlightedInvoiceIndex, setHighlightedInvoiceIndex] = useState(-1); // New state for keyboard navigation
  const [initialInvoiceNumber, setInitialInvoiceNumber] = useState(
    `TXR-${uid(10).toUpperCase()}`
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
        const filtered = sales.filter((s) =>
          s.receiptId.toLowerCase().includes(query.toLowerCase())
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
    [sales, setLoading, setError]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      debouncedInvoiceSearch(searchInvoiceQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInvoiceQuery, debouncedInvoiceSearch]);

  // Fetch sales on mount
  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        const allSales = await SaleApis.getAllSales();
        setSales(allSales);
      } catch (err) {
        console.error("Failed to fetch sales:", err);
        toast.error(`Failed to fetch sales: ${err.message}`);
        setError(`Failed to fetch sales: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, [setLoading, setError, setSales]);

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

  const handleSearchSale = useCallback(
    async (invoiceToSearch) => {
      toast.dismiss();
      if (!invoiceToSearch.trim()) {
        toast.error("Please enter an invoice number to search.");
        setOriginalSale(null);
        return;
      }
      setLoading(true);
      try {
        const foundSale = await SaleApis.getSaleByInvoiceNumber(
          invoiceToSearch.trim()
        );
        setOriginalSale(foundSale);
        setSearchInvoiceQuery(""); // Clear search input after successful search
        setInvoiceSearchResults([]); // Clear search results after successful search
        setShowInvoiceDropdown(false); // Hide dropdown
        setHighlightedInvoiceIndex(-1); // Reset highlight

        toast.success("Original sale found!");
      } catch (err) {
        console.error("Failed to search sale:", err);
        toast.error(
          `Failed to find sale: ${err.response?.data?.message || err.message}`
        );
        setOriginalSale(null);
        setError(`Failed to search sale: ${err.message}`);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

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
        e.preventDefault();
        if (highlightedInvoiceIndex !== -1) {
          handleSearchSale(
            invoiceSearchResults[highlightedInvoiceIndex].receiptId
          );
        } else {
          handleSearchSale(searchInvoiceQuery);
        }
      }
    },
    [
      invoiceSearchResults,
      highlightedInvoiceIndex,
      showInvoiceDropdown,
      searchInvoiceQuery,
      handleSearchSale,
    ]
  );

  const onCartItemsInitialize = useCallback(() => {
    if (originalSale) {
      return originalSale.products.map((item) => ({
        productId: item.productId,
        costprice: item.costprice || 0,
        productName: item.name,
        profit: item.profit || 0,
        instock: item.instock, // Original quantity in the sale
        salePriceAtReturn: item.price,
        quantity: 0, // Initial quantity to return in common cart structure
        total: 0,
      }));
    }
    return []; // Return empty array if no original sale or after reset
  }, [originalSale]);

  const validateQuantityWithInvoice = useCallback(
    (itemInCart, newQuantity) => {
      const originalItem = originalSale?.products.find(
        (item) => item.productId === itemInCart.productId
      );

      const maxReturnable = originalItem ? originalItem.instock : 0;
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
    [originalSale]
  ); // Dependency on originalSale for original quantities

  const resetFormSpecifics = useCallback(() => {
    setSearchInvoiceQuery("");
    setOriginalSale(null);
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
      originalSale: {
        label: "Original Sale #",
        value: originalSale?.receiptId || "N/A",
      },
      customer: {
        label: "Customer",
        value: `${originalSale?.customerId?.name || "Walk-In-Customer"} ${
          originalSale?.customerId?.email
            ? `(${originalSale.customerId.email})`
            : ""
        }`,
      },
      returnDate: {
        label: "Return Date",
        value: new Date().toLocaleDateString(),
      },
    }),
    [originalSale]
  );

  const modalItemsColumns = useMemo(
    () => [
      { key: "productName", label: "Product" },
      { key: "quantity", label: "Returned Qty" },
      {
        key: "salePriceAtReturn",
        label: "Price",
        render: (item) => `${item.salePriceAtReturn.toFixed(2)}`,
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
    <SaleReturnFormCommon
      titlePrefix="Sale Return"
      initialInvoiceNumber={initialInvoiceNumber} // Pass the initial invoice number
      onInvoiceReset={
        () => setInitialInvoiceNumber(`TXR-${uid(10).toUpperCase()}`) // Reset to a new invoice number
      }
      onCartItemsInitialize={onCartItemsInitialize} // Pass the memoized callback
      validateQuantity={validateQuantityWithInvoice}
      createReturnApi={SaleApis.createSaleReturn}
      originalPurchaseDetails={
        originalSale && ( // Pass only the relevant detail JSX here
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-xl max-sm:text-lg font-semibold text-gray-800 mb-3">
              Selected Sale Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Detail label="Invoice No." value={originalSale.receiptId} />
              <Detail
                label="Customer"
                value={`${originalSale.customerId?.name} ${
                  originalSale.customerId?.email
                    ? `(${originalSale.customerId.email})`
                    : ""
                }`}
              />
              <Detail
                label="Sale Date"
                value={new Date(originalSale.date).toLocaleDateString()}
              />
              <Detail
                label="Total Amount"
                value={`$${originalSale.totalAmount?.toFixed(2)}`}
              />
            </div>
          </div>
        )
      }
      searchComponent={
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-xl max-sm:text-lg font-semibold mb-3">
            Search Original Sale
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative flex-grow" ref={invoiceSearchRef}>
              <input
                type="text"
                placeholder="Enter original Receipt Id..."
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
              {/* Assuming IconSearch is imported or hardcoded SVG */}
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
                    {invoiceSearchResults.map((sale, index) => (
                      <li
                        key={sale._id}
                        className={`p-2 max-sm:text-sm cursor-pointer border-b border-gray-200 last:border-b-0 ${
                          index === highlightedInvoiceIndex
                            ? "bg-blue-100"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => handleSearchSale(sale.receiptId)}
                      >
                        {sale.receiptId} - (
                        {new Date(sale.date).toLocaleDateString()})
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
              onClick={() => handleSearchSale(searchInvoiceQuery)}
              className="px-6 py-2 max-sm:text-sm cursor-pointer bg-blue-900/80 text-white rounded-md hover:bg-blue-900/90 transition duration-200"
            >
              Search
            </button>
          </div>
        </div>
      }
      modalTitle="Sale Return (With Original Invoice)"
      modalDetails={modalDetails}
      modalItemsColumns={modalItemsColumns}
      resetFormSpecifics={resetFormSpecifics}
      customerId={originalSale?.customerId?._id || "Walk-In-Customer"} // Pass customer ID for invoice
      customer_sale_details={
        originalSale
          ? {
              customer: originalSale.customerId,
              sale: originalSale,
            }
          : {}
      }
    />
  );
};

export default SaleReturnWithInvoice;
