import React, { useEffect, useState, useMemo } from "react";
import useStore from "../../store/useStore";
import toast from "react-hot-toast";
import SaleApis from "../../services/SaleApis";
import { motion } from "framer-motion";
import { IconSearch } from "../../utils/Icons";
import Pagination from "../../hooks/usePagination";

// Helper component for consistent detail display (UNCHANGED)
const Detail = ({ label, value }) => (
  <div>
    <span className="font-semibold">{label}:</span>{" "}
    <span className="text-gray-700">{value || "N/A"}</span>
  </div>
);

// Sales Return Detail Modal Component (UNCHANGED)
const SalesReturnDetailModal = ({ sale, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sale) setShow(true);
    else setShow(false);
  }, [sale]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!sale && !show) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-gray-900 transition-opacity duration-300 ${
          show ? "opacity-75" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Animated wrapper */}
      <div
        className={`relative z-50 w-full max-w-2xl transform transition-all duration-300 ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal content */}
        <div className="bg-white max-h-[90vh] overflow-y-auto border-t-4 border-blue-900/90 text-blue-900/80 rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-900/90">
              Return Invoice
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            <Detail label="Invoice #" value={sale.returnInvoiceNumber} />
            <Detail
              label="Customer"
              value={`${sale.customer?.name || "Walk-In-Customer"} ${
                sale.customer?.email ? `(${sale.customer.email})` : ""
              }`}
            />
            <Detail
              label="Return Date"
              value={new Date(sale.returnDate).toLocaleDateString()}
            />
            <Detail
              label="Total Amount"
              value={`${sale.totalReturnAmount || "0"}`}
            />
          </div>

          <h3 className="text-xl font-bold text-blue-900/90 mb-3 mt-6 border-b pb-2">
            Returned Items
          </h3>
          {sale.items && sale.items.length > 0 ? (
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
                  {sale.items.map((item, index) => (
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
                        {item.salePriceAtReturn || "0"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {(item.returnedQuantity || 0) *
                          (item.salePriceAtReturn || 0) || "0"}
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

const SalesReturnTable = () => {
  const { setLoading, setError, salesReturns, setSalesReturns,currentPage, setCurrentPage,rowsPerPage } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [filteredSales, setFilteredSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);


  // Fetch Sales on Mount
  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        const fetchedSales = await SaleApis.getAllSaleReturns();
        setSalesReturns(fetchedSales);
        setFilteredSales(fetchedSales);
      } catch (err) {
        toast.error(`Failed to load sales returns: ${err.message}`);
        setError(`Failed to load sales returns: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [setLoading, setError, setSalesReturns]);

  // Filtering Logic
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    const filtered = salesReturns.filter((sale) => {
      const matchesText =
        !searchQuery ||
        (sale.returnInvoiceNumber || "")
          .toLowerCase()
          .includes(lowercasedQuery) ||
        (sale.customer?.name || "").toLowerCase().includes(lowercasedQuery) ||
        (sale.customer?.email || "").toLowerCase().includes(lowercasedQuery) ||
        sale.items.some(
          (item) =>
            (item.product?.name || "")
              .toLowerCase()
              .includes(lowercasedQuery) ||
            (item.product?.code || "").toLowerCase().includes(lowercasedQuery)
        );
      
      const returnDate = new Date(sale.returnDate);
      const matchesDate =
        (!start || returnDate >= start) && (!end || returnDate <= end);

      return matchesText && matchesDate;
    });

    setFilteredSales(filtered);
    setCurrentPage(1); // Reset to page 1 on any filter change
  }, [searchQuery, salesReturns, startDate, endDate]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleViewSale = (sale) => {
    setSelectedSale(sale);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedSale(null);
  };

  // --- Calculate current rows for the page ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentSalesReturns = filteredSales.slice(indexOfFirstRow, indexOfLastRow);

  // Memoize the table rows for performance
  const tableRows = useMemo(() => {
    return currentSalesReturns.map((sale,index) => (
      <motion.tr
        key={sale._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border-b border-gray-200 hover:bg-gray-50 text-sm max-sm:text-xs"
      >
        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
          {indexOfFirstRow + index + 1}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
          {sale.returnInvoiceNumber}
        </td>
        <td className="px-4 py-3 text-center whitespace-nowrap text-gray-700">
          {sale.customer?.name || "Walk-In-Customer"}{" "}
          {sale.customer?.email && `(${sale.customer.email})`}
        </td>
        <td className="px-4 py-3 text-center whitespace-nowrap text-gray-700">
          {new Date(sale.returnDate).toLocaleDateString()}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-center text-gray-700">
          {sale.totalReturnAmount || "0"}
        </td>
        <td className="px-4 py-3 justify-center items-center whitespace-nowrap flex gap-1.5 text-gray-500">
          <button
            onClick={() => handleViewSale(sale)}
            className=" text-green-600 hover:text-green-700 cursor-pointer"
          >
            View
          </button>
        </td>
      </motion.tr>
    ));
  }, [currentSalesReturns]); // Depend on the sliced data for the current page

 

  return (
    <div className="p-6 bg-white rounded-lg shadow-md flex flex-col h-full">
      <h2 className="text-2xl max-sm:text-lg font-bold text-blue-900/90 mb-6 border-b pb-3 flex items-center sm:gap-1">
        <img src="/list-blue.png" className="w-7 h-7 max-sm:w-6 max-sm:h-6 mr-2" alt="History Icon" />
        Returns List
      </h2>

      {/* Filter Controls Wrapper */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        {/* Search Bar */}
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search by invoice, customer, product..."
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
            {filteredSales.length === 0 ? (
                <p className="text-gray-500 text-center py-10">
                No sales returns found matching your criteria.
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
                        Customer
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
        {filteredSales.length > 0 && <Pagination data={filteredSales} />}
      </div>

      {isDetailModalOpen && (
        <SalesReturnDetailModal
          sale={selectedSale}
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  );
};

export default SalesReturnTable;