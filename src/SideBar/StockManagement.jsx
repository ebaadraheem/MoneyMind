import React, { useState, useEffect, useCallback } from "react";
import useStore from "../store/useStore";
import ProductApis from "../services/ProductApis";
import { motion } from "framer-motion";
import Pagination from "../hooks/usePagination";

const StockManagement = () => {
  const {
    products,
    loading,
    error,
    setLoading,
    setError,
    setProducts,
    openModal,
    currentPage,
    setCurrentPage,
    rowsPerPage,
  } = useStore();

  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedProducts = await ProductApis.searchProducts("");
      const filteredProducts = fetchedProducts.filter(
        (product) => product.stock > 0
      );
      setProducts(filteredProducts);
    } catch (err) {
      console.error("Error fetching products for stock management:", err);
      openModal("error", `Failed to load product stock: ${err.message}`);
      setError(`Failed to fetch products: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [setProducts, setLoading, setError, openModal]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to the first page whenever the search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filter products based on the search term (name or code)
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Calculate current rows for the page from filtered results ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-red-100 text-red-700 p-4 rounded-lg">
        <p className="text-lg font-semibold">Error:</p>
        <p>{error}</p>
        <p>Please try again later.</p>
      </div>
    );
  }

  return (
    <motion.div
      key="stock-management"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <div className="flex  justify-between items-center mb-4 gap-2 flex-wrap">
        <h2 className=" text-lg sm:text-2xl font-bold text-blue-900/90 flex items-center">
          <img
            src="/stock-blue.png"
            className="w-8 h-8 max-sm:w-7 max-sm:h-7 mr-2"
            alt="Stock Icon"
          />
          Stock Overview
        </h2>
        <input
          type="text"
          placeholder="Search by product name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className=" w-full max-sm:text-sm max-w-xl p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-900/90 transition"
        />
      </div>

      {loading ? (
        <div className="text-center text-gray-600 py-4">
          <p>Loading stock data...</p>
        </div>
      ) : currentProducts.length === 0 ? (
        <div className="text-center text-gray-600 py-4">
          <p>
            {searchTerm
              ? "No products match your search."
              : "No stock data available."}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto ">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50 sticky top-0">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-2 text-left text-xs  font-medium text-gray-600 uppercase tracking-wider rounded-tl-md"
                  >
                    S.No.
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2 text-left text-xs  font-medium text-gray-600 uppercase tracking-wider rounded-tl-md"
                  >
                    Product Name
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                  >
                    Code
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                  >
                    Uom
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                  >
                    Cost Price
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tr-md"
                  >
                    Total Cost
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentProducts.map((product, index) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50 text-sm max-sm:text-xs"
                  >
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      {indexOfFirstRow + index + 1}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      {product.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      {product.code}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      {product.category ? product.category.name : "N/A"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      {product.uom.name ? product.uom.name : "N/A"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                      {product.stock}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      {product.costprice !== null
                        ? `${product.costprice.toFixed(2)}`
                        : "N/A"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      {product.stock !== null && product.costprice !== null
                        ? `${(product.stock * product.costprice).toFixed(2)}`
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* --- Render Pagination Controls --- */}
          <Pagination data={filteredProducts} />
        </>
      )}
    </motion.div>
  );
};

export default StockManagement;
