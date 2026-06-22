import { useState, useEffect, useCallback } from "react";
import useStore from "../../store/useStore";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import BusinessApis from "../../services/BusinessApis";
import BusinessFormModal from "./BusinessFormModal";
import { IconDelete } from "../../utils/Icons";

const BusinessVariables = () => {
  const {
    loading,
    setLoading,
    setError,
    openModal,
    businessDetails,
    setBusinessDetails,
  } = useStore();
  const [showFormModal, setShowFormModal] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);

  const fetchBusinessDetails = useCallback(async () => {
    setLoading(true);
    try {
      const data = await BusinessApis.getDetails();
      setBusinessDetails(data);
    } catch (err) {
      toast.error("Failed to fetch business details.");
      setError(err);
      setBusinessDetails(null);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  useEffect(() => {
    fetchBusinessDetails();
  }, [fetchBusinessDetails]);

  const handleAdd = () => {
    setInitialFormData(null); // Clear initial data for new entry
    setShowFormModal(true);
  };

  const handleEdit = () => {
    setInitialFormData(businessDetails);
    setShowFormModal(true);
  };

  const handleDelete = () => {
    if (!businessDetails) return;
    openModal(
      "confirm",
      "Are you sure you want to delete all business details?",
      async () => {
        setLoading(true);
        try {
          await BusinessApis.deleteDetails(businessDetails._id);
          toast.success("Business details deleted successfully.");
          setBusinessDetails(null);
        } catch (err) {
          toast.error("Failed to delete business details.");
          setError(err);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleSaveSuccess = (newDetails) => {
    setBusinessDetails(newDetails);
  };

  const DetailRow = ({ label, value }) => (
    <div className="flex justify-between items-center p-3 border-b last:border-b-0">
      <span className="font-semibold text-center text-gray-700 ">{label}:</span>
      <span
        className={`text-gray-900 text-end  ${label == "Email" && "break-all"}`}
      >
        {value || "N/A"}
      </span>
    </div>
  );

  return (
    <motion.div
      key="business-variables"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
      className="bg-white p-6 rounded-lg shadow-md mx-auto w-full  text-gray-800"
    >
      <h2 className="text-2xl font-bold text-blue-900/90 mb-6 flex items-center justify-between">
        <span className="flex items-center">
          <img
            src="/ruler-blue.png"
            alt="Access Control Icon"
            className="w-7 h-7 max-sm:w-6 max-sm:h-6 mr-2"
          />{" "}
          Business Details
        </span>
        {businessDetails && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleEdit}
              className="px-4 py-2 cursor-pointer text-sm bg-blue-900/80 text-white rounded-md hover:bg-blue-900/95 transition-all flex items-center"
            >
              <img src="/edit.png" alt="Edit Icon" className="w-4 h-4 mr-1" />{" "}
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm cursor-pointer bg-red-600 text-white rounded-md hover:bg-red-700 transition-all flex items-center"
            >
              <IconDelete className="w-4 h-4 mr-1" /> Delete
            </button>
          </div>
        )}
      </h2>

      {loading ? (
        <p className="text-center text-gray-600">Loading business details...</p>
      ) : businessDetails ? (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
          <DetailRow label="Business Name" value={businessDetails.name} />
          <DetailRow label="Urdu Name" value={businessDetails.urduName} />
          <DetailRow label="Address" value={businessDetails.address} />
          <DetailRow label="Urdu Address" value={businessDetails.urduAddress} />
          <DetailRow label="Contact No. 1" value={businessDetails.contactNo1} />
          <DetailRow label="Contact No. 2" value={businessDetails.contactNo2} />
          <DetailRow label="Email" value={businessDetails.businessEmail} />
          {businessDetails.logo && (
            <div className="p-3 flex gap-2 justify-between items-center border-t">
              <span className="font-semibold text-gray-700">Logo:</span>

              <span className=" min-h-16  min-w-16 ">
                <img
                  src={`${businessDetails.logo}`}
                  alt="Business Logo"
                  className="h-16 w-16 rounded-full object-cover"
                />
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-10">
          <p className="text-lg text-gray-600">
            No business details have been set yet.
          </p>
          <button
            onClick={handleAdd}
            className="px-6 py-3 cursor-pointer bg-blue-900/80 text-white font-semibold rounded-md hover:bg-blue-900/95 transition-all"
          >
            Add Business Details
          </button>
        </div>
      )}

      <BusinessFormModal
        isOpen={showFormModal}
        initialData={initialFormData}
        onClose={() => setShowFormModal(false)}
        onSave={handleSaveSuccess}
      />
    </motion.div>
  );
};

export default BusinessVariables;
