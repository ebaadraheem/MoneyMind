import React, { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import useStore from "../../store/useStore";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { motion } from "framer-motion";
import {
  IconHourglassEmpty,
  IconCallReceived,
  IconDelete,
} from "../../utils/Icons";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ProductApis from "../../services/ProductApis";

const PosHeldInvoice = ({ AllInvoices, handleClose }) => {
  const {
    heldInvoices,
    setHeldInvoices,
    openModal,
    resetOrder,
    setLoading,
    setError,
    setCurrentView,
  } = useStore();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const fetchHeldInvoices = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const employeeId = AllInvoices ? null : currentUser.uid;
      const data = await api.getHeldInvoices(employeeId);
      setHeldInvoices(data);
    } catch (err) {
      toast.error("Failed to load held invoices.");
      setError("Failed to fetch held invoices.");
    } finally {
      setLoading(false);
    }
  }, [
    setHeldInvoices,
    openModal,
    setLoading,
    setError,
    currentUser,
    AllInvoices,
  ]);

  useEffect(() => {
    fetchHeldInvoices();
  }, [fetchHeldInvoices]);

  const handleLoadInvoice = async (invoiceId) => {
    await proceedLoadInvoice(invoiceId);
  };

  const proceedLoadInvoice = async (invoiceId) => {
    setLoading(true);
    setError(null);
    try {
      const invoice = await api.loadHeldInvoice(invoiceId);
      resetOrder();
      const productsToAddToCart = [];
      for (const p of invoice.products) {
        const fullProductDetails = await ProductApis.getProductById(p.productId);
        if (fullProductDetails) {
          productsToAddToCart.push({
            ...fullProductDetails,
            quantity: p.quantity,
          });
        } else {
          console.warn(`Product with ID ${p.productId} not found.`);
          toast.error(`Product ${p.name} (ID: ${p.productId}) not found.`);
        }
      }

      productsToAddToCart.forEach((product) => {
        useStore.getState().addProductToOrder(product, product.quantity);
      });
      useStore.getState().setDiscount(invoice.discount || 0);
      await api.deleteHeldInvoice(invoiceId);
      fetchHeldInvoices();
      setCurrentView("pos-screen");
      navigate("/pos");
      handleClose(); 
      toast.success("Invoice loaded successfully!");
    } catch (err) {
      toast.error("Failed to load or delete invoice.");
      console.error("Error loading held invoice:", err);
      setError("Failed to load held invoice.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    try {
      setLoading(true);
      await api.deleteHeldInvoice(invoiceId);
      fetchHeldInvoices(); 
      toast.success("Invoice deleted successfully!");
    } catch (err) {
      openModal("error", "Failed to delete held invoice.");
      setError("Failed to delete held invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="held-invoices"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
      className="bg-white"
    >
      <h2 className="text-2xl max-sm:text-lg font-bold text-blue-900/90 mb-4 flex items-center">
        <IconHourglassEmpty className="w-8 h-8 max-sm:w-7 max-sm:h-7 sm:mr-2" />{" "}
        {AllInvoices ? "All Held Invoices" : "My Held Invoices"}
      </h2>
      {heldInvoices.length === 0 ? (
        <div className="text-center max-sm:text-sm text-gray-600  pt-2">
          <p>No invoices currently on hold.</p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[400px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tl-md">
                  Invoice #
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium justify-center items-center flex text-gray-600 uppercase tracking-wider rounded-tr-md">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {heldInvoices.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-gray-50 max-sm:text-xs text-sm">
                  <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                    #{invoice.invoiceNumber}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                    {invoice.customerName}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                    {invoice.totalAmount}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                    {format(new Date(invoice.date), "MMM dd, hh:mm a")}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-right justify-center items-center font-medium flex gap-2">
                    {!AllInvoices && ( 
                      <button
                        onClick={() => handleLoadInvoice(invoice._id)}
                        className="text-blue-800/90 cursor-pointer hover:text-blue-900 transition duration-200 flex items-center"
                      >
                        <IconCallReceived className="w-5 h-5 max-sm:w-4 max-sm:h-4 mr-1" /> Load
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteInvoice(invoice._id)}
                      className="text-red-600 cursor-pointer hover:text-red-800 transition duration-200 flex items-center"
                    >
                      <IconDelete className="w-5 h-5 max-sm:w-4 max-sm:h-4 mr-1" /> Delete
                    </button>
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

export default PosHeldInvoice;
