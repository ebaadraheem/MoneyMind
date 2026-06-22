import { useEffect, useState } from "react";
import { Detail } from "../../utils/functions";

const AccountDetailModal = ({ person, accountType, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (person) setShow(true);
    else setShow(false);
  }, [person]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!person && !show) return null;

  const renderSpecificDetails = (data, type) => {
    switch (type) {
      case "Supplier":
        return (
          <>
            <Detail label="Email" value={person.email} />
            <Detail label="Company" value={data.companyName} />
            <Detail label="Website" value={data.website} />
            <Detail label="CNIC" value={data.cnic} />{" "}
            {data.contactperson1 && data.contactperson1.name && (
              <>
                <h3 className="text-md font-semibold text-blue-900/90 mt-4 border-t pt-3">
                  Contact Person 1
                </h3>
                <Detail label="Name" value={data.contactperson1.name} />
                <Detail label="Phone" value={data.contactperson1.phone} />
                <Detail label="Email" value={data.contactperson1.email} />
                <Detail
                  label="Designation"
                  value={data.contactperson1.designation}
                />
              </>
            )}
            {data.contactperson2 && data.contactperson2.name && (
              <>
                <h3 className="text-md font-semibold text-blue-900/90 mt-4 border-t pt-3">
                  Contact Person 2
                </h3>
                <Detail label="Name" value={data.contactperson2.name} />
                <Detail label="Phone" value={data.contactperson2.phone} />
                <Detail label="Email" value={data.contactperson2.email} />
                <Detail
                  label="Designation"
                  value={data.contactperson2.designation}
                />
              </>
            )}
            <Detail label="CNIC" value={data.cnic} />
            <Detail
              label="Total Amount"
              value={data.supplierAccount?.totalAmount?.toFixed(2) || "0.00"}
            />
            <Detail
              label="Paid Amount"
              value={data.supplierAccount?.paidAmount?.toFixed(2) || "0.00"}
            />
            <Detail
              label="Balance"
              value={data.supplierAccount?.balance?.toFixed(2) || "0.00"}
            />
          </>
        );
      case "Customer":
        return (
          <>
            <Detail label="CNIC" value={data.cnic} />
            <Detail label="Email" value={person.email} />
            <Detail
              label="Total Amount"
              value={data.customerAccount?.totalAmount?.toFixed(2) || "0.00"}
            />
            <Detail
              label="Paid Amount"
              value={data.customerAccount?.paidAmount?.toFixed(2) || "0.00"}
            />
            <Detail
              label="Balance"
              value={data.customerAccount?.balance?.toFixed(2) || "0.00"}
            />
          </>
        );
      case "Employee":
        return (
          <>
            <Detail label="CNIC" value={data.cnic} />
            <Detail label="Role" value={data.role} />
            <Detail
              label="Date Hired"
              value={
                data.hireDate
                  ? new Date(data.hireDate).toLocaleDateString()
                  : "N/A"
              }
            />
            <Detail
              label="Total Amount"
              value={data.employeeAccount?.totalAmount?.toFixed(2) || "0.00"}
            />
            <Detail
              label="Paid Amount"
              value={data.employeeAccount?.paidAmount?.toFixed(2) || "0.00"}
            />
            <Detail
              label="Balance"
              value={data.employeeAccount?.balance?.toFixed(2) || "0.00"}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
      <div
        className={`fixed inset-0 bg-gray-900 transition-opacity duration-300 ${
          show ? "opacity-75" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      <div
        className={`relative z-50 w-full max-w-lg transform transition-all duration-300 ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white max-h-[90vh] overflow-y-auto border-t-4 border-blue-900/90 text-blue-900/80 rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl max-sm:text-lg font-bold text-blue-900/90">
              {accountType} Details
            </h2>
          </div>

          <div className="space-y-3 ">
            <Detail label="Name" value={person.name} />

            <Detail label="Phone" value={person.phone} />
            <Detail label="Address" value={person.address} />
            {renderSpecificDetails(person, accountType)}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleClose}
              className="px-4 py-2 max-sm:text-sm bg-blue-900/80 cursor-pointer text-white font-semibold hover:bg-blue-900/95 rounded transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailModal;
