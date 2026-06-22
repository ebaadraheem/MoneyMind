import { useEffect, useState } from "react";
import useStore from "../store/useStore";
import ProductSearch from "../components/PosComponents/ProductSearch";
import OrderTable from "../components/PosComponents/OrderTable";
import POSCustomerInfo from "../components/PosComponents/CustomerInfo";
import PaymentSection from "../components/PosComponents/PaymentSection";
import PersonFormModal from "../components/PeopleComponents/PersonFormModal";
import ProductFormModal from "../components/ProductComponents/ProductFormModal";
import api from "../services/api";
import { IconRefresh } from "../utils/Icons";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ProductApis from "../services/ProductApis";
import { IconHourglassEmpty } from "../utils/Icons";
import HeldInvoicesDisplayModal from "../components/PosComponents/HeldInvoicesDisplayModal";
import InvoiceModal from "../components/PosComponents/InvoiceModal";
import BusinessApis from "../services/BusinessApis";

const POS = () => {
  const {
    resetOrder,
    setCurrentView,
    userAccesses,
    setUserAccesses,
    setUserRole,
    setEmployeeId,
    employeeId,
    setProducts,
    setLoading,
    loading,
    businessDetails,
    setBusinessDetails,
  } = useStore();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [showHeldInvoicesModal, setShowHeldInvoicesModal] = useState(false);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceDataToDisplay, setInvoiceDataToDisplay] = useState(null);

  const handleRefreshPage = async () => {
    toast.dismiss();
    const updatedProducts = await ProductApis.searchProducts("");
    setProducts(updatedProducts);
    resetOrder();
    toast.success("Page refreshed!");
  };

  const handlePaymentCompleteAndShowInvoice = (transactionData) => {
    setInvoiceDataToDisplay(transactionData);
    setShowInvoiceModal(true);
  };

  //fetch business details
  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        setLoading(true);
        const response = await BusinessApis.getDetails();
        setBusinessDetails(response);
      } catch (error) {
        console.error("Error fetching business details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinessDetails();
  }, [setBusinessDetails]);
  useEffect(() => {
    if (currentUser) {
      setEmployeeId(currentUser.uid);
    }
  }, [currentUser, setUserAccesses, setUserRole, setEmployeeId]);

  return (
    <motion.div
      key="pos-screen"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
      className="min-h-screen bg-gray-50 p-4 text-gray-800 font-sans"
    >
      <div className="flex flex-col lg:flex-row items-center justify-between lg:pl-64 pb-6 gap-4">
        <div className="text-center flex-1 ">
          <div className=" inline-flex flex-col items-center justify-center">
            <h1 className="text-4xl max-sm:text-3xl font-extrabold text-blue-900/80 tracking-wide drop-shadow-sm">
              {
                businessDetails.name ? businessDetails.name : "SnapMart"
              }
            </h1>
            <p className="text-gray-700 max-sm:text-sm font-medium text-md mt-1">
              {businessDetails.address ? businessDetails.address : "Point of Sale"}
            </p>
          </div>
        </div>
        <div className="w-full lg:w-auto gap-2 flex justify-center lg:justify-end">
          <button
            onClick={() => setShowHeldInvoicesModal(true)}
            className=" hover:bg-blue-900 text-sm bg-blue-900/90 cursor-pointer text-white p-2 sm:p-3 rounded-md transition duration-200 flex items-center justify-center sm:text-lg font-semibold"
          >
            <IconHourglassEmpty className="w-6 h-6 max-sm:w-5 max-sm:h-5 sm:mr-2" />
            Invoices
          </button>
          <button
            onClick={handleRefreshPage}
            className="sm:p-3 p-2 sm:text-lg text-sm cursor-pointer rounded-md bg-gray-500 text-white hover:bg-gray-600 flex items-center justify-center font-semibold"
          >
            <IconRefresh className="w-6 h-6 max-sm:w-5 max-sm:h-5 sm:mr-2" />
            Refresh Page
          </button>
          <button
            onClick={() => {
              resetOrder();
              setCurrentView("sales-list");
              navigate("/");
            }}
            className="sm:p-3 p-2  sm:text-lg text-sm cursor-pointer rounded-md bg-red-600/80 hover:bg-red-600 text-white flex items-center justify-center font-semibold"
          >
            Close Page
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="xl:w-2/3 flex flex-col">
          <ProductSearch />
          <OrderTable />
        </div>
        <div className="xl:w-1/3 flex flex-col">
          <POSCustomerInfo />
          <PaymentSection
            onPaymentComplete={handlePaymentCompleteAndShowInvoice}
            setInvoiceToDisplay={setInvoiceDataToDisplay}
          />
        </div>
      </div>
      <ProductFormModal />
      <PersonFormModal />
      <HeldInvoicesDisplayModal
        show={showHeldInvoicesModal}
        onClose={() => setShowHeldInvoicesModal(false)}
      />
      {showInvoiceModal && (
        <InvoiceModal
          invoice={invoiceDataToDisplay}
          onClose={() => {
            setShowInvoiceModal(false);
            setInvoiceDataToDisplay(null);
          }}
        />
      )}
    </motion.div>
  );
};

export default POS;
