import { useEffect, useState, useMemo } from "react";
import useStore from "../../store/useStore";

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const Detail = ({ label, value }) => (
  <div>
    <span className="font-semibold">{label}:</span>{" "}
    <span className="text-gray-700">{value || "N/A"}</span>
  </div>
);


const PersonDetailModal = () => {
  const { personDetailModal, closePersonDetailModal } = useStore();
  const [show, setShow] = useState(false);

  const { isOpen, type, data } = personDetailModal;

  useEffect(() => {
    if (isOpen) setShow(true);
    else setShow(false);
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      closePersonDetailModal();
    }, 300);
  };

  const modalTitle = useMemo(() => {
    return `${capitalize(type)} Details`;
  }, [type]);

  if (!isOpen && !show) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
      <div
        className={`fixed inset-0 bg-gray-900 transition-opacity duration-300 ${
          show ? "opacity-75" : "opacity-0"
        }`}
        onClick={handleClose}
      />
      <div
        className={`relative z-50 w-full max-w-2xl transform transition-all duration-300 ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white max-h-screen overflow-y-auto border-t-4 border-blue-900/90 text-blue-900/80 rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">{modalTitle}</h2>
          </div>

          <div className="space-y-3 text-sm">
            <Detail label="Name" value={data?.name} />
            <Detail label="Father Name" value={data?.fatherName} />
            <Detail label="Email" value={data?.email} />
            <Detail label="Phone" value={data?.phone} />
            <Detail label="CNIC" value={data?.cnic} />
            <Detail label="Address" value={data?.address} />
            <Detail label="Type" value={data?.typeId?.name} />
            <Detail label="Area" value={data?.areaId?.name} />
            {type === "employee" && (
              <>
                <Detail label="Salary" value={data?.salary} />
                <Detail label="Hire Date" value={data?.hireDate} />
                <Detail label="Role" value={data?.role} />
              </>
            )}
            {type === "supplier" && (
              <>
                <Detail label="Company Name" value={data?.companyName} />
                <Detail label="Website" value={data?.website} />
              </>
            )}
            <div className="border p-3 rounded bg-blue-50">
              <p className="font-semibold  mb-2">Contact Person 1</p>
              <Detail label="Name" value={data?.contactperson1?.name} />
              <Detail label="Phone" value={data?.contactperson1?.phone} />
            </div>
            <div className="border p-3 rounded bg-blue-50">
              <p className="font-semibold  mb-2">Contact Person 2</p>
              <Detail label="Name" value={data?.contactperson2?.name} />
              <Detail label="Phone" value={data?.contactperson2?.phone} />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-blue-900/80 cursor-pointer text-white font-semibold hover:bg-blue-900/95 rounded transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetailModal;
