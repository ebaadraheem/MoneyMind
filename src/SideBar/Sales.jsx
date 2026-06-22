// components/TodaySales.jsx
import React, { useEffect, useCallback } from "react";
import useStore from "../store/useStore";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import { format } from "date-fns";
import { formatCurrency } from "../utils/helper";
import { motion } from "framer-motion";

// FIX: Destructure the AllSales prop correctly
const TodaySales = ({ AllSales }) => {
  // Corrected prop destructuring
  const {
    todaySales,
    setTodaySales,
    openModal,
    setLoading,
    setError,
    userRole,
  } = useStore();
  const { currentUser } = useAuth();

  const fetchTodaySales = useCallback(async () => {
    // Skip fetching if user or role is missing
    if (!currentUser || !userRole) {
      console.warn(
        "Skipping sales fetch: currentUser or userRole not available."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Decide whether to fetch all sales or current user's sales
      const idToFetch = AllSales ? null : currentUser.uid;

      const sales = await api.getTodaySales(idToFetch, userRole);
      setTodaySales(sales);
    } catch (err) {
      console.error("Error fetching sales:", err);
      openModal("error", "Failed to load sales data.");
      setError("Failed to fetch sales data.");
    } finally {
      setLoading(false);
    }
  }, [
    setTodaySales,
    openModal,
    setLoading,
    setError,
    currentUser,
    userRole,
    AllSales,
  ]);
  useEffect(() => {
    fetchTodaySales();
  }, [fetchTodaySales]);

  const totalSalesToday = todaySales.reduce(
    (sum, sale) => sum + sale.totalAmount,
    0
  );

  return (
    <motion.div
      key={AllSales ? "all-sales" : "today-sales"} // Key for Framer Motion transitions
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-2xl text-center font-bold text-blue-900/90 mb-4 flex  items-center">
        <img src="/sales-blue.png" className="w-8 h-8 mr-2" />
        <span className=" pt-1">{AllSales ? "All Sales" : "Today's Sales"}</span>
      </h2>
     {todaySales.length > 0 && <div className="mb-4 text-right">
        <p className="text-lg font-bold text-blue-900/80">
          {/* Adjust label based on AllSales prop */}
          Total {AllSales ? "All Sales" : "Sales Today"}:{" "}
          {formatCurrency(totalSalesToday)}
        </p>
      </div>}
      {todaySales.length === 0 ? (
        <div className="text-center text-gray-600 py-4">
          <p>No sales recorded for {AllSales ? "this period" : "today"} yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tl-md">
                  Receipt ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {todaySales.map((sale) => (
                <tr key={sale._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                    #{sale.receiptId}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                    {sale.customerName}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                    {formatCurrency(sale.totalAmount)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                    {format(new Date(sale.date), "hh:mm:ss a")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default TodaySales;
