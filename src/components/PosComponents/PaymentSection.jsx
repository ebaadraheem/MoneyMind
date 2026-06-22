import useStore from "../../store/useStore";
import api from "../../services/api";
import { IconCheckCircle, IconHourglassEmpty } from "../../utils/Icons"; // Assuming IconCreditCard exists
import toast from "react-hot-toast";
import ProductApis from "../../services/ProductApis";
import { cleanAndValidateInteger } from "../../utils/functions";

const PaymentSection = ({ onPaymentComplete }) => {
  const {
    currentOrder,
    currentCustomer,
    totalAmount,
    discount,
    paidAmount,
    returnAmount,
    setDiscount,
    setPaidAmount,
    resetOrder,
    openModal,
    setLoading,
    setProducts,
    setError,
    iswalkInCustomer,
    setTodaySales,
    employeeId,
  } = useStore();

  // --- All your functions (handleCompleteOrder, handleHoldInvoice, etc.) remain unchanged ---
  // --- They are omitted here for brevity but should be kept in your file. ---

  const handleCompleteOrder = async () => {
    toast.dismiss();
    if (currentOrder.length === 0) {
      return toast.error("Order is empty. Please add products to the order.");
    }

    if (paidAmount < totalAmount && iswalkInCustomer) {
      return toast.error("Paid amount is less than total amount.");
    }
    if (!currentCustomer && !iswalkInCustomer) {
      return toast.error("Please select a customer or mark as walk-in.");
    }

    try {
      setError(null);
      setLoading(true);
      const transactionData = {
        products: currentOrder.map(({ productId, name, quantity, price }) => ({
          productId,
          name,
          quantity,
          price,
        })),
        customerId: currentCustomer ? currentCustomer._id : null,
        customerName: currentCustomer?.name || "Walk-in Customer",
        totalAmount,
        profit: currentOrder.reduce(
          (acc, item) => acc + item.profit * item.quantity, 0
        ),
        discount,
        paidAmount,
        returnAmount,
        employeeId,
        date: new Date().toISOString(),
      };

      const response = await api.completeTransaction(transactionData); 
      const completedTransaction = response; 
      const todaySale = await api.getTodaySales(employeeId);
      setTodaySales(todaySale);
      const updatedProducts = await ProductApis.searchProducts("");
      setProducts(updatedProducts);
      resetOrder();
      toast.success("Order completed successfully!");

      if (onPaymentComplete && typeof onPaymentComplete === "function") {
        onPaymentComplete(completedTransaction);
      }
    } catch (err) {
      setError("Failed to complete order.");
      toast.error("Failed to complete order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleHoldInvoice = async () => {
    if (currentOrder.length === 0) {
      toast.dismiss();
      toast.error("Order is empty. Please add products to the order.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const invoiceData = {
        products: currentOrder.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        customerId: currentCustomer ? currentCustomer._id : null,
        customerName: currentCustomer
          ? currentCustomer.name
          : "Walk-in Customer",
        totalAmount: totalAmount,
        discount: discount,
        employeeId: employeeId || "unknown",
        date: new Date().toISOString(),
      };
      await api.holdInvoice(invoiceData);

      toast.success("Invoice held successfully!");
      resetOrder();
    } catch (err) {
      openModal("error", "Failed to hold invoice. Please try again.");
      setError("Failed to hold invoice.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaidAmountKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); 
      handleCompleteOrder(); 
    }
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md">
      {/* Header */}
      <h2 className="text-xl max-sm:text-lg font-bold text-blue-900/90 mb-1 flex items-center">
        {/* You can add a payment-related icon here if you have one */}
        {/* <IconCreditCard className="w-6 h-6 mr-2.5 text-blue-900/70" /> */}
        Payment
      </h2>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-y-2 sm:gap-y-5 lg:gap-x-6 mb-6">
        {/* Left side: Inputs */}
        <div className="lg:col-span-2 flex flex-col gap-y-2 sm:gap-y-4">
          <div>
            <label htmlFor="discount" className="block text-sm max-sm:text-xs font-medium text-gray-600 mb-0.5 sm:mb-1.5">
              Discount
            </label>
            <input
              type="text"
              id="discount"
              value={discount.toString()}
              onChange={(e) => {
                const numericValue = cleanAndValidateInteger(e.target.value);
                setDiscount(numericValue);
              }}
              className="w-full max-sm:text-sm p-2.5 text-base text-gray-800 border transition-all border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-900/90"
            />
          </div>
          <div>
            <label htmlFor="paidAmount" className="block text-sm max-sm:text-xs font-medium text-gray-600 mb-0.5 sm:mb-1.5">
              Paid Amount
            </label>
            <input
              type="text"
              id="paidAmount"
              value={paidAmount.toString()}
              onChange={(e) => {
                const numericValue = cleanAndValidateInteger(e.target.value);
                setPaidAmount(numericValue);
              }}
              onKeyDown={handlePaidAmountKeyDown}
              className="w-full max-sm:text-sm p-2.5 text-base text-gray-800 border transition-all border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-900/90"
            />
          </div>
        </div>

        {/* Right side: Display Values */}
        <div className="lg:col-span-3 flex flex-col gap-y-2 sm:gap-y-4">
          <div className="flex-1 p-1 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm font-medium text-blue-800/80 mb-1">Total Amount</p>
            <p className="text-3xl max-sm:text-xl font-bold text-blue-900 break-all">
              {/* <span className="text-2xl font-semibold mr-1">PKR</span> */}
              {totalAmount.toLocaleString()}
            </p>
          </div>
          <div className="flex-1 p-1 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-1">Return Amount</p>
            <p className="text-2xl max-sm:text-xl font-semibold text-gray-800 break-all">
              {/* <span className="text-xl font-medium mr-1">PKR</span> */}
              {returnAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleCompleteOrder}
          className="flex-1 max-sm:text-sm bg-green-600 cursor-pointer text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center text-base font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500"
        >
          <IconCheckCircle className="w-5 h-5 mr-2" /> Complete Order
        </button>
        <button
          onClick={handleHoldInvoice}
          className="flex-1 max-sm:text-sm bg-blue-900/90 cursor-pointer text-white py-3 px-4 rounded-lg hover:bg-blue-900 transition-all duration-200 flex items-center justify-center text-base font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-800"
        >
          <IconHourglassEmpty className="w-5 h-5 mr-2" /> Hold Invoice
        </button>
      </div>
    </div>
  );
};

export default PaymentSection;