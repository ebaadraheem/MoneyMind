import { useState, useEffect, useCallback } from "react";
import { Transition, Dialog } from "@headlessui/react";
import { Fragment } from "react";
import { toast } from "react-hot-toast";
import useStore from "../../store/useStore";
import BusinessApis from "../../services/BusinessApis";
import ImageUploader from "./ImageUploader";

const BusinessFormModal = ({ isOpen, initialData, onClose, onSave }) => {
  const { loading, setLoading, setError, setBusinessDetails } = useStore();
  const [formData, setFormData] = useState({
    name: "",
    urduName: "",
    address: "",
    urduAddress: "",
    contactNo1: "",
    contactNo2: "",
    businessEmail: "",
    logo: "",
  });
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "",
        urduName: "",
        address: "",
        urduAddress: "",
        contactNo1: "",
        contactNo2: "",
        businessEmail: "",
        logo: "",
      });
    }
    setLogoFile(null);
  }, [initialData]);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleLogoFileChange = useCallback((file) => {
    setLogoFile(file);
    if (!file) {
      setFormData((prev) => ({ ...prev, logo: null }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();
    setLoading(true);

    if (!formData.name || !formData.address || !formData.contactNo1) {
      toast.error("Name, Address, and Contact No. 1 are required.");
      setLoading(false);
      return;
    }

    try {
      let finalFormData = { ...formData };
      if (logoFile) {
        const logoUrl = await BusinessApis.uploadLogo(logoFile);
        finalFormData.logo = logoUrl;
      } else if (initialData && !formData.logo) {
        finalFormData.logo = null;
      }

      let response;
      if (initialData) {
        response = await BusinessApis.updateDetails(
          initialData._id,
          finalFormData
        );
        setBusinessDetails(response);
        toast.success("Business details updated successfully!");
      } else {
        response = await BusinessApis.addDetails(finalFormData);
        setBusinessDetails(response);
        toast.success("Business details added successfully!");
      }
      onSave(response);
      onClose();
    } catch (err) {
      toast.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-md bg-white p-6 text-left align-middle shadow-xl transition-all border-t-4 border-blue-900/90 text-blue-900/80">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold leading-6 text-blue-900/90 mb-4 flex items-center"
                >
                  <img
                    src="/ruler-blue.png"
                    alt="Access Control Icon"
                    className="w-7 h-7 max-sm:w-6 max-sm:h-6 mr-2"
                  />
                  {initialData
                    ? "Edit Business Details"
                    : "Add Business Details"}
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    maxLength={50}
                    onChange={handleFormChange}
                    placeholder="Business Name"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-900/80"
                    required
                  />
                  <input
                    type="text"
                    name="urduName"
                    value={formData.urduName}
                    onChange={handleFormChange}
                    placeholder="Business Urdu Name (Optional)"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-900/80"
                  />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    placeholder="Address"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-900/80"
                    required
                  />
                  <input
                    type="text"
                    name="urduAddress"
                    value={formData.urduAddress}
                    onChange={handleFormChange}
                    placeholder="Urdu Address (Optional)"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-900/80"
                  />
                  <input
                    type="tel"
                    name="contactNo1"
                    value={formData.contactNo1}
                    onChange={handleFormChange}
                    placeholder="Contact No 1"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-900/80"
                    required
                  />
                  <input
                    type="tel"
                    name="contactNo2"
                    value={formData.contactNo2}
                    onChange={handleFormChange}
                    placeholder="Contact No 2 (Optional)"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-900/80"
                  />
                  <input
                    type="email"
                    name="businessEmail"
                    value={formData.businessEmail}
                    onChange={handleFormChange}
                    placeholder="Business Email (Optional)"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-900/80"
                  />
                  <ImageUploader
                    initialImageUrl={`${
                      initialData?.logo ? initialData.logo : ""
                    }`}
                    onFileChange={handleLogoFileChange}
                  />

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-4 py-2 cursor-pointer text-sm font-medium text-white bg-blue-900/80 rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900/90 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loading ? "Saving..." : "Save Details"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default BusinessFormModal;
