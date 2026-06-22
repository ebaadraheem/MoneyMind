import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import useStore from "../../store/useStore";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import ProductApis from "../../services/ProductApis";
import { Detail } from "../../utils/functions";

const SaleReturnFormCommon = ({
  titlePrefix,
  initialInvoiceNumber,
  onInvoiceReset,
  onCartItemsInitialize,
  validateQuantity,
  createReturnApi,
  additionalReturnData,
  resetFormSpecifics,
  searchComponent,
  detailsComponent,
  modalTitle,
  modalDetails,
  modalItemsColumns,
  customerId,
  customer_sale_details = {}, 
}) => {
  const { setLoading, setError, setProducts } = useStore();
  const [returnCartItems, setReturnCartItems] = useState([]);
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().split("T")[0]
  ); 
  const [showReturnSummaryModal, setShowReturnSummaryModal] = useState(false);
  const returnInvoiceRef = useRef(null);
  useEffect(() => {
    if (onCartItemsInitialize) {
      const newInitialItems = onCartItemsInitialize();
      if (newInitialItems) {
        setReturnCartItems(newInitialItems);
      }
    }
  }, [onCartItemsInitialize]); 

  const handleReturnedQuantityChange = useCallback(
    (productId, newQuantity) => {
      toast.dismiss();
      setReturnCartItems((prevItems) =>
        prevItems.map((item) => {
          if (item.productId === productId) {
            const parsedQuantity = parseInt(newQuantity, 10);
            const quantity = isNaN(parsedQuantity) ? 0 : parsedQuantity;
            const validationResult = validateQuantity(item, quantity);

            if (validationResult.error) {
              toast.error(validationResult.error);
              return validationResult.correctedItem || item;
            }

            return {
              ...item,
              quantity: quantity,
              total: quantity * item.salePriceAtReturn,
              profit:
                item.profit +
                (item.salePriceAtReturn - item.costprice) *
                  (quantity - item.quantity),
            };
          }
          return item;
        })
      );
    },
    [validateQuantity]
  );

  const handleRemoveReturnItem = useCallback((productId) => {
    toast.dismiss();
    setReturnCartItems((prevItems) => {
      const updatedItems = prevItems.filter(
        (item) => item.productId !== productId
      );
      return updatedItems;
    });
  }, []);
  const totalReturnAmount = useMemo(() => {
    return returnCartItems.reduce((sum, item) => sum + item.total, 0);
  }, [returnCartItems]);

  const handleCompleteReturn = useCallback(async () => {
    toast.dismiss();
    const itemsToReturn = returnCartItems.filter((item) => item.quantity > 0);
    if (itemsToReturn.length === 0) {
      toast.error("Please add items with a quantity greater than 0 to return.");
      return;
    }
    if (!customerId) {
      toast.error("Please select a customer ");
      return;
    }

    setLoading(true);
    try {
      const returnData = {
        originalSale: customer_sale_details.sale?._id || null,
        customer: customerId == "Walk-In-Customer" ? null : customerId,
        returnInvoiceNumber: initialInvoiceNumber,
        returnDate,
        items: itemsToReturn.map((item) => ({
          product: item.productId,
          returnedQuantity: item.quantity,
          salePriceAtReturn: item.salePriceAtReturn,
        })),
        profit: itemsToReturn.reduce((acc, item) => acc + item.profit, 0),
        totalReturnAmount: parseInt(totalReturnAmount),
        ...additionalReturnData,
      };
      modalDetails.returnInvoiceNumber.value = initialInvoiceNumber;
      await createReturnApi(returnData);
      toast.success(`${titlePrefix} completed successfully!`);
      const updatedProducts = await ProductApis.searchProducts("");
      setProducts(updatedProducts);
      setShowReturnSummaryModal(true);
    } catch (err) {
      console.error("Sale return failed:", err);
      toast.error(
        `${titlePrefix} failed: ${err.response?.data?.message || err.message}`
      );
      setError(`${titlePrefix} failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [
    returnCartItems,
    initialInvoiceNumber,
    initialInvoiceNumber,
    returnDate,
    totalReturnAmount,
    setLoading,
    setError,
    createReturnApi,
    additionalReturnData,
    titlePrefix,
    customerId,
    customer_sale_details,
  ]);

  const SummaryModal = () => {
    const returnedItemsForSummary = returnCartItems.filter(
      (item) => item.quantity > 0
    );
    if (returnedItemsForSummary.length === 0) return null;

    return (
      <AnimatePresence>
        {showReturnSummaryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center px-4 bg-gray-900/50"
            onClick={() => {
              setReturnDate(new Date().toISOString().split("T")[0]);
              if (onInvoiceReset) onInvoiceReset();
              setReturnCartItems([]);
              if (resetFormSpecifics) resetFormSpecifics();
              setShowReturnSummaryModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="relative z-50 w-full max-w-2xl transform bg-white max-h-[90vh] overflow-y-auto border-t-4 border-blue-900/90 text-blue-900/80 rounded-lg shadow-xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div ref={returnInvoiceRef} className="p-4">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h2 className="text-2xl max-sm:text-lg font-bold text-blue-900/90">
                    {modalTitle}
                  </h2>
                  <span className="text-sm max-sm:text-xs text-gray-600">
                    Date: {new Date(returnDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 ">
                  {modalDetails &&
                    Object.entries(modalDetails).map(([key, detail]) => (
                      <Detail
                        key={key}
                        label={detail.label}
                        value={detail.value}
                      />
                    ))}
                </div>

                <h3 className="text-xl max-sm:text-lg font-bold text-blue-900/90 mb-3 mt-6">
                  Returned Items:
                </h3>
                <div className="overflow-x-auto border border-gray-200 rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-50">
                      <tr>
                        {modalItemsColumns.map((col) => (
                          <th
                            key={col.key}
                            className={`px-4 py-2 text-${
                              col.align || "left"
                            } text-xs font-medium text-gray-600 uppercase tracking-wider`}
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 ">
                      {returnedItemsForSummary &&
                        returnedItemsForSummary.map((item, index) => (
                          <tr
                            key={item.productId || index}
                            className="hover:bg-gray-50 text-sm max-sm:text-xs"
                          >
                            {modalItemsColumns.map((col) => (
                              <td
                                key={`${item.productId}-${col.key}`}
                                className={`px-4 py-2  text-gray-900 text-${
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

                <div className="mt-6 flex justify-end">
                  <p className="text-xl max-sm:text-lg font-bold text-blue-900/90">
                    Total Return Amount: {totalReturnAmount || "0"}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setReturnDate(new Date().toISOString().split("T")[0]);
                    if (onInvoiceReset) onInvoiceReset();
                    setReturnCartItems([]);
                    if (resetFormSpecifics) resetFormSpecifics();
                    setShowReturnSummaryModal(false);
                  }}
                  className="sm:px-6 px-4 py-2 cursor-pointer bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 transition duration-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const handleProductAddedToCart = useCallback(
    (product, quantity, salePrice) => {
      toast.dismiss();
      setReturnCartItems((prevItems) => {
        const existingItemIndex = prevItems.findIndex(
          (item) => item.productId === product._id
        );
        if (
          existingItemIndex > -1 &&
          prevItems[existingItemIndex].instock === undefined
        ) {
          prevItems[existingItemIndex].instock = product.stock || 0;
        }

        if (existingItemIndex > -1) {
          const updatedItems = [...prevItems];
          const newTotalQuantity =
            updatedItems[existingItemIndex].quantity + quantity;

          const validationResult = validateQuantity(
            { ...updatedItems[existingItemIndex], quantity: newTotalQuantity },
            newTotalQuantity
          );
          if (validationResult.error) {
            toast.error(validationResult.error);
            return prevItems;
          }

          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: newTotalQuantity,
            profit: (salePrice - product.costprice) * newTotalQuantity,
            costprice: product.costprice || 0,
            salePriceAtReturn: salePrice,
            total: newTotalQuantity * salePrice,
          };
          // toast.success(`Updated quantity for ${product.name}`);
          return updatedItems;
        } else {
          const newItemInitialQuantity = quantity;
          const validationResult = validateQuantity(
            {
              productId: product._id,
              productName: product.name,
              salePriceAtReturn: salePrice,
            },
            newItemInitialQuantity
          );

          if (validationResult.error) {
            toast.error(validationResult.error);
            return prevItems;
          }
          const newItem = {
            productId: product._id,
            productName: product.name,
            instock: product.stock || 0,
            costprice: product.costprice || 0,
            quantity: newItemInitialQuantity,
            profit: (salePrice - product.costprice) * newItemInitialQuantity,
            salePriceAtReturn: salePrice,
            total: newItemInitialQuantity * salePrice,
          };
          return [...prevItems, newItem];
        }
      });
    },
    [validateQuantity]
  ); 
  return (
    <div>
      {searchComponent &&
        React.cloneElement(searchComponent, {
          onProductAdd: handleProductAddedToCart,
        })}

      {detailsComponent}

      <div className="flex-grow bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6 overflow-hidden flex flex-col">
        <h3 className="text-xl max-sm:text-lg font-semibold text-gray-800 mb-4">
          Items to Return ({returnCartItems.length} items)
        </h3>
        <div className="overflow-x-auto flex-grow">
          {returnCartItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No products added for return.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    In Stock
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return Qty
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {returnCartItems.map((item) => (
                  <tr key={item.productId} className="text-sm max-sm:text-xs">
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      {item.productName}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      {item.instock == 0 ? "0" : item.instock || "N/A"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap ">
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) =>
                          handleReturnedQuantityChange(
                            item.productId,
                            e.target.value
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleCompleteReturn();
                          }
                        }}
                        className="w-20 p-1 border border-gray-300 rounded-md text-center"
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700">
                      {item.salePriceAtReturn | "0"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap  text-gray-700 text-right">
                      {item.total || "0"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right  font-medium">
                      <button
                        onClick={() => handleRemoveReturnItem(item.productId)}
                        className="text-red-600 hover:text-red-900 transition-colors"
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

        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end items-center">
          <span className="text-xl max-sm:text-lg font-bold text-gray-800">
            Total Return Amount:
          </span>
          <span className="text-2xl max-sm:text-xl font-extrabold text-blue-900/90 ml-2 sm:ml-4">
            {totalReturnAmount || "0"}
          </span>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleCompleteReturn}
          className="px-8 max-sm:px-5 py-2 sm:py-3 rounded-md cursor-pointer bg-red-600 text-white font-bold sm:text-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2 shadow-lg"
        >
          <img src="/return-white.png" alt="Return Icon" className="w-6 h-6" />
          Complete Return
        </button>
      </div>

      <SummaryModal />
    </div>
  );
};

export default SaleReturnFormCommon;
