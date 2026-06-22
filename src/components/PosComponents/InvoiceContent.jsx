import React from "react";
import { format } from "date-fns";

const InvoiceContent = React.forwardRef(({ invoice, businessDetails }, ref) => {
  return (
    <div ref={ref} className="p-4 sm:p-6 bg-white print:p-0">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-blue-900/80 mb-2">
          {businessDetails?.name ? businessDetails.name : "SnapMart"}
        </h1>
        <p className="text-sm max-sm:text-xs text-gray-600 mb-0.5">
          {businessDetails?.address ? businessDetails.address : "Your Receipt"}
        </p>
      </div>

      <div className="flex justify-between items-start mb-4 border-b pb-4">
        <div>
          <p className="font-semibold text-gray-800 text-xs">
            Invoice #
            <span className="text-gray-800 text-xs">
              {invoice?.receiptId || "N/A"}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Date:{" "}
            {invoice?.date
              ? format(new Date(invoice.date), "MMM dd, yyyy hh:mm a")
              : "N/A"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-800">Customer:</p>
          <p className="text-md text-gray-700">
            {invoice?.customerName || "Walk-in Customer"}
          </p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-blue-900/80 mb-3 border-b pb-2">
        Items
      </h3>
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 text-left font-medium">Product</th>
              <th className="py-2 text-right font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Price</th>
              <th className="py-2 text-right font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {invoice?.products?.map((item, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 last:border-b-0"
              >
                <td className="py-2">{item.name}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{item.price}</td>
                <td className="py-2 text-right">
                  {item.quantity * item.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-right space-y-1 text-gray-800 mb-6">
        <p className="flex justify-between">
          <span className="font-medium">Subtotal:</span>
          <span className="font-bold">
            {invoice?.totalAmount + (invoice?.discount || 0)}
          </span>
        </p>
        {invoice?.discount > 0 && (
          <p className="flex justify-between text-red-600">
            <span className="font-medium">Discount:</span>
            <span className="font-bold">-{invoice.discount}</span>
          </p>
        )}
        <p className="flex justify-between text-lg font-extrabold text-blue-900/90 border-t pt-2">
          <span>Total Amount:</span>
          <span>{invoice?.totalAmount}</span>
        </p>
        <p className="flex justify-between">
          <span className="font-medium">Amount Paid:</span>
          <span className="font-bold">
            {invoice?.balance > 0
              ? invoice?.paidAmount + invoice?.balance
              : invoice?.paidAmount}
          </span>
        </p>
        <p className="flex justify-between text-green-700">
          <span className="font-medium">Change:</span>
          <span className="font-bold">{invoice?.balance || 0}</span>
        </p>
      </div>

      <p className="text-center text-gray-600 text-sm mt-8">
        Thank you for your business!
      </p>
    </div>
  );
});

export default InvoiceContent;
