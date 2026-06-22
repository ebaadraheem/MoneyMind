import { useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import useStore from "../../store/useStore";
import SupplierApis from "../../services/SupplierApis";
import CustomerApis from "../../services/CustomerApis";
import EmployeeApis from "../../services/EmployeeApis";

const getAccountApi = (type) => {
  switch (type) {
    case "Supplier":
      return {
        getAccount: async (id) => {
          const account = await SupplierApis.getSupplierAccount(id);
          return { ...account, id };
        },
        makePayment: SupplierApis.makePaymentToSupplier,
      };
    case "Customer":
      return {
        getAccount: async (id) => {
          const account = await CustomerApis.getCustomerAccount(id);
          return { ...account, id };
        },
        makePayment: CustomerApis.makePaymentToCustomer,
      };
    case "Employee":
      return {
        getAccount: async (id) => {
          const account = await EmployeeApis.getEmployeeAccount(id);
          return { ...account, id };
        },
        makePayment: EmployeeApis.makePaymentToEmployee,
      };
    default:
      throw new Error(`Unsupported account type: ${type}`);
  }
};

const AccountPaymentForm = ({
  accountId,
  accountName,
  accountType,
  onClose,
  onPaymentSuccess,
}) => {
  const setLoading = useStore((state) => state.setLoading);
  const setError = useStore((state) => state.setError);
  const [accountDetails, setAccountDetails] = useState(null);
  const [amountToClear, setAmountToClear] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModalContent, setShowModalContent] = useState(false);

  const [apiInitError, setApiInitError] = useState(false);

  const apiService = useMemo(() => {
    try {
      const service = getAccountApi(accountType);
      setApiInitError(false);
      return service;
    } catch (e) {
      toast.error(e.message);
      setApiInitError(true);
      return null;
    }
  }, [accountType]);

  useEffect(() => {
    if (apiInitError) {
      if (typeof onClose === "function") {
        onClose();
      }
    }
  }, [apiInitError, onClose]);

  useEffect(() => {
    if (accountId) {
      setShowModalContent(true);
    } else {
      const timer = setTimeout(() => setShowModalContent(false), 300);
      return () => clearTimeout(timer);
    }
  }, [accountId]);

  useEffect(() => {
    let isMounted = true;
    const fetchAccountDetails = async () => {
      if (!accountId || !apiService || apiInitError) {
        setAccountDetails(null);
        setAmountToClear("");
        setReferenceNumber("");
        return;
      }

      setLoading(true);
      try {
        const details = await apiService.getAccount(accountId);
        if (isMounted) {
          setAccountDetails(details);
          setAmountToClear("");
          setReferenceNumber("");
        }
      } catch (err) {
        if (isMounted) {
          toast.error(
            `Failed to load ${accountType.toLowerCase()} account: ${
              err.message
            }`
          );
          setError(
            `Failed to load ${accountType.toLowerCase()} account: ${
              err.message
            }`
          );
          setAccountDetails(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAccountDetails();
    return () => {
      isMounted = false;
    };
  }, [accountId, accountType, setLoading, setError, apiService, apiInitError]);

  const handleAmountToClearChange = useCallback(
    (e) => {
      toast.dismiss();
      const value = parseInt(e.target.value);
      setAmountToClear(value);
    },
    [accountDetails]
  );

  const handlePaymentMethodChange = useCallback((e) => {
    setPaymentMethod(e.target.value);
    setReferenceNumber("");
  }, []);

  const handleReferenceNumberChange = useCallback((e) => {
    setReferenceNumber(e.target.value);
  }, []);

  const handleSubmitPayment = useCallback(
    async (e) => {
      e.preventDefault();
      toast.dismiss();

      if (!accountId || !apiService) {
        toast.error(
          `No ${accountType.toLowerCase()} selected for payment or API service not found.`
        );
        return;
      }

      const amount = parseFloat(amountToClear);
      if (isNaN(amount)) {
        toast.error("Please enter a valid amount to clear.");
        return;
      }

      const currentBalance = accountDetails?.balance || 0;
      if (paymentMethod !== "Cash" && !referenceNumber) {
        toast.error(
          `Please provide a reference number for ${paymentMethod} payment.`
        );
        return;
      }

      setIsSubmitting(true);
      setLoading(true);
      try {
        const paymentData = {
          accountId: accountId,
          amount: amount,
          paymentMethod: paymentMethod,
          referenceNumber: paymentMethod !== "Cash" ? referenceNumber : null,
          notes: `Payment ${amount >= 0 ? "for" : "from"} ${accountName} on ${new Date().toLocaleDateString()}`,
        };

        await apiService.makePayment(paymentData);
        toast.success("Payment successfully recorded!");

        if (typeof onPaymentSuccess === "function") {
          onPaymentSuccess();
        }
        if (typeof onClose === "function") {
          onClose();
        }

        setAmountToClear("");
        setReferenceNumber("");
        setPaymentMethod("Cash");
      } catch (err) {
        toast.error(`Payment failed: ${err.message}`);
        setError(`Payment failed: ${err.message}`);
      } finally {
        setIsSubmitting(false);
        setLoading(false);
      }
    },
    [
      accountId,
      accountType,
      amountToClear,
      paymentMethod,
      referenceNumber,
      accountDetails,
      setLoading,
      setError,
      onClose,
      onPaymentSuccess,
      accountName,
      apiService,
    ]
  );

  if (!showModalContent && !accountId && !apiInitError) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
      <div
        className={`fixed inset-0 bg-gray-900 transition-opacity duration-300 ${
          showModalContent ? "opacity-75 " : "opacity-0"
        }`}
        onClick={typeof onClose === "function" ? onClose : undefined}
      />

      <div
        className={`relative z-50 w-full max-w-2xl transform transition-all duration-300 ${
          showModalContent ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white max-h-screen overflow-y-auto border-t-4 border-blue-900/90 text-blue-900/80 rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl max-sm:text-xl font-extrabold">
              Clear Payment for {accountName || `Selected ${accountType}`}
            </h2>
          </div>

          {apiInitError ? (
            <div className="text-center text-red-600 py-10">
              <p>
                Could not initialize API service for {accountType} accounts.
                Please try again or contact support.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitPayment} className="space-y-6">
              {accountDetails ? (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                  <h3 className="sm:text-lg font-semibold text-blue-900/90 mb-3">
                    Account Summary
                  </h3>
                  <div className="grid grid-cols-1 gap-2 text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-sm max-sm:text-xs font-medium text-gray-600">
                        Total Amount :
                      </span>
                      <span className="text-base font-bold text-blue-900/80">
                        {(accountDetails?.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm max-sm:text-xs  font-medium text-gray-600">
                            Amount Paid:
                          </span>
                          <span className="text-base font-bold text-green-700">
                            {(accountDetails?.paidAmount || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm max-sm:text-xs font-medium text-gray-600">
                            Current Balance:
                          </span>
                          <span
                            className={`text-base font-bold ${
                              accountDetails.balance > 0
                                ? "text-red-700"
                                : "text-green-700"
                            }`}
                          >
                            {(accountDetails?.balance || 0).toFixed(2)}
                          </span>
                        </div>
                      </>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  Loading account details...
                </p>
              )}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="sm:text-lg font-semibold text-gray-800 mb-4">
                  Payment Details
                </h3>
                <div className="mb-4">
                  <label
                    htmlFor="amountToClear"
                    className="block text-sm max-sm:text-xs font-medium text-gray-700 mb-1"
                  >
                    Amount to Pay:
                  </label>
                  <input
                    id="amountToClear"
                    type="number"
                    step="1"
                    value={amountToClear}
                    onChange={handleAmountToClearChange}
                    disabled={!accountDetails}
                    className="w-full max-sm:text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition-all duration-200 outline-none text-lg text-right disabled:bg-gray-200 disabled:text-gray-500"
                    placeholder="0"
                  />
                  {accountDetails &&
                    accountDetails.balance === 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        No outstanding balance for this{" "}
                        {accountType.toLowerCase()}.
                      </p>
                    )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm max-sm:text-xs font-medium text-gray-700 mb-2">
                    Payment Method:
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {["Cash", "Check", "Online"].map((method) => (
                      <label
                        key={method}
                        className="inline-flex items-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={handlePaymentMethodChange}
                          className="form-radio h-4 w-4 accent-blue-900/80 hover:accent-blue-900/90 border-gray-300 "
                          disabled={!accountDetails}
                        />
                        <span className="ml-2 text-gray-700 max-sm:text-sm">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {(paymentMethod === "Check" || paymentMethod === "Online") && (
                  <div className="mb-4">
                    <label
                      htmlFor="referenceNumber"
                      className="block text-sm max-sm:text-xs font-medium text-gray-700 mb-1"
                    >
                      Reference Number ({paymentMethod}):
                    </label>
                    <input
                      id="referenceNumber"
                      type="text"
                      value={referenceNumber}
                      onChange={handleReferenceNumberChange}
                      className="w-full p-2 max-sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition-colors duration-200 outline-none"
                      placeholder={`Enter ${paymentMethod} number/ID`}
                      disabled={!accountDetails}
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 max-sm:text-sm">
                <button
                  type="button"
                  onClick={typeof onClose === "function" ? onClose : undefined}
                  className="bg-gray-300 cursor-pointer hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-gray-500 "
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-900/80 cursor-pointer hover:bg-blue-900/90 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    isSubmitting ||
                    !accountDetails ||
                    parseFloat(paymentMethod !== "Cash" && !referenceNumber)
                  }
                >
                  {isSubmitting ? "Processing..." : "Record Payment"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPaymentForm;
