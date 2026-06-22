import React, { useState, useMemo, useCallback } from "react";
import useStore from "../../store/useStore";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import ProductApis from "../../services/ProductApis";
import { Detail } from "../../utils/functions";

const CommonPurchaseForm = ({
  title,
  resetFormState, 
  onCompletePurchase, 
  productSearchComponent, 
  detailsComponent, 
  amountPaidInput = null, 
  modalTitle,
  modalDetails, 
  modalItemsColumns,
}) => {
  const { setLoading, setProducts } = useStore();
  const [cartItems, setCartItems] = useState([]);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [amountPaidValue, setAmountPaidValue] = useState(""); 

  const handleProductAddedToCart = useCallback((product, quantity, price) => {
    toast.dismiss();
    const total = quantity * price;

    const newItem = {
      productId: product._id,
      productName: product.name,
      productCode: product.code,
      quantity,
      purchasePrice: price,
      total,
    };

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.productId === newItem.productId
      );
      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
          purchasePrice: newItem.purchasePrice, 
          total: (updatedItems[existingItemIndex].quantity + newItem.quantity) * newItem.purchasePrice,
        };
        // toast.success(`Updated quantity for ${newItem.productName}`);
        return updatedItems;
      } else {
        // toast.success(`Added ${newItem.productName} to cart.`);
        return [...prevItems, newItem];
      }
    });
  }, []);

  const handleRemoveFromCart = useCallback((productId) => {
    toast.dismiss();
    setCartItems((prevItems) => {
      const updatedItems = prevItems.filter(
        (item) => item.productId !== productId
      );
      // toast.success("Item removed from cart.");
      return updatedItems;
    });
  }, []);

  const totalCartAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.total, 0);
  }, [cartItems]);

  const handleCompleteAction = useCallback(async () => {
    toast.dismiss();
    if (cartItems.length === 0) {
      toast.error("Cart is empty. Please add products.");
      return;
    }
    if (amountPaidValue > totalCartAmount) {
      toast.error("Amount paid cannot be more than total amount.");
      return;
    }

    setLoading(true);
    try {
      await onCompletePurchase(cartItems, totalCartAmount, amountPaidValue);
      const updatedProducts = await ProductApis.searchProducts("");
      setProducts(updatedProducts);
      setShowSummaryModal(true);
      toast.success(`${title} completed successfully!`);
    } catch (err) {
      console.error("Operation failed:", err);
      toast.error(
        `${title} failed: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setLoading(false);
    }
  }, [
    cartItems,
    totalCartAmount,
    onCompletePurchase,
    setLoading,
    title,
    amountPaidValue,
  ]); 
  const handleAmountPaidKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleCompleteAction(); 
      }
    },
    [handleCompleteAction]
  ); 

  const SummaryModal = () => (
    <AnimatePresence>
      {showSummaryModal && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center px-4 bg-gray-900/50"
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl max-sm:text-lg font-bold text-blue-900/80 mb-4 border-b pb-2">
              {modalTitle}
            </h2>
            <div className="space-y-3 text-gray-700 mb-6">
              {modalDetails &&
                Object.entries(modalDetails).map(([key, value]) => (
                  <Detail key={key} label={value.label} value={value.value} />
                ))}

              <h3 className="font-semibold sm:text-lg mt-4">Items:</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      {modalItemsColumns.map((col) => (
                        <th
                          key={col.key}
                          className={`px-4 py-2 text-${
                            col.align || "left"
                          } font-semibold`}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm max-sm:text-xs">
                    {cartItems
                      .filter(
                        (item) => item.quantity > 0 || item.returnedQuantity > 0
                      )
                      .map((item, index) => (
                        <tr
                          key={item.productId || index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          {modalItemsColumns.map((col) => (
                            <td
                              key={`${item.productId}-${col.key}`}
                              className={`px-4 py-2 text-${
                                col.align || "left"
                              }`}
                            >
                              {col.render ? col.render(item) : item[col.key]}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xl max-sm:text-lg font-bold text-right mt-4 text-blue-900/80">
                Total Amount: {totalCartAmount.toFixed(2)}
              </p>
              {amountPaidInput && (
                <div className="flex justify-between items-center mt-2">
                  <span className="sm:text-lg font-semibold text-gray-800">
                    Amount Paid:
                  </span>
                  <span className="text-xl max-sm:text-lg font-bold text-green-700">
                    {amountPaidValue 
                      ? `${parseFloat(amountPaidValue)}`
                      : "0"}
                  </span>
                </div>
              )}
              {amountPaidInput && (
                <div className="flex justify-between items-center mt-2">
                  <span className="sm:text-lg font-semibold text-gray-800">
                    Amount Due:
                  </span>
                  <span
                    className={`text-xl max-sm:text-lg font-bold ${
                      parseFloat(amountPaidValue || 0) >= totalCartAmount 
                        ? "text-purple-700"
                        : "text-red-600"
                    }`}
                  >
                    {(totalCartAmount - parseFloat(amountPaidValue || 0)) 
                      .toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSummaryModal(false);
                  setCartItems([]);
                  setAmountPaidValue(""); 
                  resetFormState(); 
                }}
                className="sm:px-6 px-4 py-2 cursor-pointer rounded-md bg-gray-300 text-gray-800 hover:bg-gray-400 transition-colors flex items-center gap-1"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  const clonedAmountPaidInput = amountPaidInput
    ? React.cloneElement(amountPaidInput, {
        value: amountPaidValue,
        onChange: (e) => setAmountPaidValue(e.target.value),
        onKeyDown: handleAmountPaidKeyDown,
      })
    : null;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md flex flex-col h-full">
      <h2 className="text-2xl max-sm:text-lg gap-2 font-bold text-blue-900/90 mb-6 border-b pb-3 flex items-center justify-between">
        <span className="flex items-center">
          <img src="/cart-blue.png" className="w-8 h-8 max-sm:w-7 max-sm:h-7 mr-2" alt="Cart Icon" />{" "}
          {title}
        </span>
      </h2>
      {React.cloneElement(productSearchComponent, {
        onProductAdd: handleProductAddedToCart,
      })}
      {detailsComponent}
      <div className="flex-grow bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 overflow-hidden flex flex-col">
        <h3 className="text-xl max-sm:text-lg font-semibold text-gray-800 mb-4">
          Cart Items ({cartItems.length} items)
        </h3>
        <div className="overflow-x-auto flex-grow">
          {cartItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Your cart is empty. Add products to get started!
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <tr key={item.productId} className="text-sm max-sm:text-xs">
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      {item.productName} ({item.productCode})
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      {item.purchasePrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700 text-right">
                      {item.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right  font-medium">
                      <button
                        onClick={() => handleRemoveFromCart(item.productId)}
                        className="text-red-600 cursor-pointer hover:text-red-900 transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-xl max-sm:text-lg font-bold text-gray-800">
            Total Cart Amount:
          </span>
          <span className="text-2xl max-sm:text-xl font-extrabold text-blue-900/90">
            {totalCartAmount.toFixed(2)}
          </span>
        </div>
      </div>
      {clonedAmountPaidInput && (
        <div className="mt-auto flex sm:justify-end justify-center items-center max-sm:flex-col gap-2 ">
          {clonedAmountPaidInput}
        </div>
      )}
      <div className="mt-6 flex sm:justify-end items-center justify-center">
        <button
          onClick={handleCompleteAction}
          className="px-8 py-3 rounded-md cursor-pointer bg-green-600 text-white font-bold sm:text-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 shadow-lg"
        >
          <img src="/cart-white.png" alt="Cart Icon" className="w-6 h-6" />
          {title === "New Purchase" ? "Checkout" : "Complete Return"}
        </button>
      </div>

      <SummaryModal />
    </div>
  );
};

export default CommonPurchaseForm;
