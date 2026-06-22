import React, { useEffect, useState, useMemo } from "react";
import useStore from "../../store/useStore";
import toast from "react-hot-toast";
import PurchaseApis from "../../services/PurchaseApis";
import { motion } from "framer-motion";
import { IconSearch } from "../../utils/Icons";
import Pagination from "../../hooks/usePagination";

// Helper component (UNCHANGED)
const Detail = ({ label, value }) => (
  <div>
    <span className="font-semibold">{label}:</span>{" "}
    <span className="text-gray-700">{value || "N/A"}</span>
  </div>
);

// Purchase Return Detail Modal Component (UNCHANGED)
const PurchaseReturnDetailModal = ({ purchase, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (purchase) setShow(true);
    else setShow(false);
  }, [purchase]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!purchase && !show) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
      <div
        className={`fixed inset-0 bg-gray-900 transition-opacity duration-300 ${
          show ? "opacity-75" : "opacity-0"
        }`}
        onClick={handleClose}
      />
      <div
        className={`relative z-50 w-full max-w-2xl transform transition-all duration-300 ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white max-h-[90vh] overflow-y-auto border-t-4 border-blue-900/90 text-blue-900/80 rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-900/90">
              Return Invoice
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            <Detail label="Invoice #" value={purchase.returnInvoiceNumber} />
            <Detail
              label="Supplier"
              value={`${purchase.supplier?.name || "N/A"} ${
                purchase.supplier?.company
                  ? `(${purchase.supplier.company})`
                  : ""
              }`}
            />
            <Detail
              label="Return Date"
              value={new Date(purchase.returnDate).toLocaleDateString()}
            />
            <Detail
              label="Total Amount"
              value={`${purchase.totalReturnAmount?.toFixed(2) || "0.00"}`}
            />
          </div>

          <h3 className="text-xl font-bold text-blue-900/90 mb-3 mt-6 border-b pb-2">
            Returned Items
          </h3>
          {purchase.items && purchase.items.length > 0 ? (
            <div className="overflow-x-auto border border-gray-200 rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tl-md">
                      Product
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tr-md">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchase.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {item.product?.name || "N/A"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {item.product?.code || "N/A"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {item.returnedQuantity}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {item.purchasePriceAtReturn?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {(
                          (item.returnedQuantity || 0) *
                          (item.purchasePriceAtReturn || 0)
                        ).toFixed(2) || "0.00"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-5">
              No items recorded for this return
            </p>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-blue-900/80 cursor-pointer text-white font-semibold hover:bg-blue-900/95 rounded transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PurchaseReturnTable = () => {
  const { setLoading, setError, purchaseReturns, setPurchaseReturns,currentPage, setCurrentPage,rowsPerPage } =
    useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);


  useEffect(() => {
    const fetchPurchases = async () => {
      setLoading(true);
      try {
        const fetchedPurchases = await PurchaseApis.getAllPurchaseReturns();
        setPurchaseReturns(fetchedPurchases);
        setFilteredPurchases(fetchedPurchases);
      } catch (err) {
        toast.error(`Failed to load purchase returns: ${err.message}`);
        setError(`Failed to load purchase returns: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [setLoading, setError, setPurchaseReturns]);

  // Filtering Logic
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    const filtered = purchaseReturns.filter((purchase) => {
      const matchesText =
        !searchQuery ||
        (purchase.returnInvoiceNumber || "")
          .toLowerCase()
          .includes(lowercasedQuery) ||
        (purchase.supplier?.name || "")
          .toLowerCase()
          .includes(lowercasedQuery) ||
        (purchase.supplier?.company || "")
          .toLowerCase()
          .includes(lowercasedQuery) ||
        purchase.items.some(
          (item) =>
            (item.product?.name || "")
              .toLowerCase()
              .includes(lowercasedQuery) ||
            (item.product?.code || "").toLowerCase().includes(lowercasedQuery)
        );

      const returnDate = new Date(purchase.returnDate);
      const matchesDate =
        (!start || returnDate >= start) && (!end || returnDate <= end);

      return matchesText && matchesDate;
    });

    setFilteredPurchases(filtered);
    setCurrentPage(1); // Reset to page 1 on any filter change
  }, [searchQuery, purchaseReturns, startDate, endDate]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleViewPurchase = (purchase) => {
    setSelectedPurchase(purchase);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPurchase(null);
  };

  // --- Calculate current rows for the page ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentPurchaseReturns = filteredPurchases.slice(indexOfFirstRow, indexOfLastRow);

  // Memoize table rows based on the current page's data
  const tableRows = useMemo(() => {
    return currentPurchaseReturns.map((purchase,index) => (
      <motion.tr
        key={purchase._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border-b border-gray-200 hover:bg-gray-50 text-sm max-sm:text-xs"
      >
        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
          {indexOfFirstRow + index + 1}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
          {purchase.returnInvoiceNumber}
        </td>
        <td className="px-4 py-3 text-center whitespace-nowrap text-gray-700">
          {purchase.supplier?.name}{" "}
          {purchase.supplier?.company && `(${purchase.supplier.company})`}
        </td>
        <td className="px-4 py-3 text-center whitespace-nowrap text-gray-700">
          {new Date(purchase.returnDate).toLocaleDateString()}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-center text-gray-700">
          {purchase.totalReturnAmount?.toFixed(2) || "0.00"}
        </td>
        <td className="px-4 py-3 justify-center items-center whitespace-nowrap flex gap-1.5 text-gray-500">
          <button
            onClick={() => handleViewPurchase(purchase)}
            className=" text-green-600 hover:text-green-700 cursor-pointer"
          >
            View
          </button>
        </td>
      </motion.tr>
    ));
  }, [currentPurchaseReturns]);

 

  return (
    <div className="p-6 bg-white rounded-lg shadow-md flex flex-col h-full">
      <h2 className="text-2xl max-sm:text-lg font-bold text-blue-900/90 mb-6 border-b pb-3 flex items-center sm:gap-1">
        <img src="/list-blue.png" className="w-7 h-7 max-sm:w-6 max-sm:h-6 mr-2" alt="History Icon" />
        Purchase Returns List
      </h2>

      {/* Filter Controls Wrapper */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        {/* Search Bar */}
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search by invoice, supplier, product..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full max-sm:text-sm p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
          />
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        {/* Date Filters */}
        <div className="flex items-center flex-wrap gap-2 text-sm max-sm:text-xs">
          <div className="flex items-center gap-2">
            <label htmlFor="startDate" className="font-medium text-gray-600">
              From:
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="endDate" className="font-medium text-gray-600">
              To:
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
            />
          </div>
        </div>
      </div>
      
      {/* Table and Pagination */}
      <div className="flex-grow flex flex-col">
        <div className="flex-grow overflow-auto border border-gray-200 rounded-lg">
          {filteredPurchases.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              No purchase returns found matching your criteria.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    S.No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableRows}
              </tbody>
            </table>
          )}
        </div>

        {/* Render Pagination if there are items */}
        {filteredPurchases.length > 0 && <Pagination data={filteredPurchases} />}
      </div>
      
      {isDetailModalOpen && (
        <PurchaseReturnDetailModal
          purchase={selectedPurchase}
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  );
};

export default PurchaseReturnTable;