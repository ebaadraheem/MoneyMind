import toast from "react-hot-toast";
import useStore from "../../store/useStore";
import { IconDelete } from "../../utils/Icons";
import { cleanAndValidateInteger } from "../../utils/functions";

const OrderTable = () => {
  const {
    currentOrder,
    updateProductQuantity,
    removeProductFromOrder,
    totalAmount,
  } = useStore();

  if (currentOrder.length === 0) {
    return (
      <div className="bg-white p-6 max-sm:text-sm rounded-lg shadow-md min-h-[365px] h-[40vh] flex flex-col items-center justify-center text-center text-gray-500">
        <img
          src="/light-blue-cart.png"
          className="w-16 h-16 max-sm:w-12 max-sm:h-12 text-blue-300 mx-auto mb-4"
          alt="Empty Cart"
        />
        <p className="text-lg font-medium">Your order is empty</p>
        <p className="mt-1">
          Start by searching for products to add them to the cart.
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[47.5vh] bg-white rounded-lg shadow-md flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl max-sm:text-lg font-bold text-blue-900/80 flex items-center">
          <img src="/cart-blue.png" className="w-6 h-6 max-sm:w-5 max-sm:h-5 mr-2" alt="Cart Icon" />
          Current Order
        </h2>
      </div>

      <div className="flex-grow overflow-y-auto max-h-[35vh] my-2">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                Qty
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Subtotal
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentOrder.map((item) => (
              <tr key={item.productId} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm max-sm:text-xs  text-gray-700">{item.name}</div>
                  <div className="text-xs text-gray-700">{item.code}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <input
                    type="number"
                    min="1"
                    max={item.stock || 9999}
                    value={item.quantity}
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? 1
                          : parseInt(e.target.value, 10);
                      if (value > 0) {
                        updateProductQuantity(item.productId, value, item.price);
                      }
                    }}
                    className="sm:w-20 w-16 sm:p-1.5 p-1  border border-gray-300 rounded-md text-center text-sm focus:ring-1 focus:ring-blue-900/90 focus:border-blue-900/90 transition duration-200"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <input
                    type="text"
                    value={item.price}
                    onChange={(e) => {
                      const newPrice = cleanAndValidateInteger(e.target.value);
                      updateProductQuantity(
                        item.productId,
                        item.quantity,
                        newPrice
                      );
                    }}
                    className="sm:w-20 w-16 sm:p-1.5 p-1 border border-gray-300 rounded-md text-center text-sm focus:ring-1 focus:ring-blue-900/90 focus:border-blue-900/90"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 ">
                  {item.subtotal}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <button
                    onClick={() => {
                      removeProductFromOrder(item.productId);
                      toast.success(`'${item.name}' removed from order`);
                    }}
                    className="p-1.5 cursor-pointer rounded-full hover:bg-red-100 transition duration-200"
                    aria-label={`Remove ${item.name} from order`}
                  >
                    <IconDelete className="w-5 h-5 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-200 flex justify-end items-center">
        <p className="text-2xl max-sm:text-lg font-bold text-blue-900/80">
          Total: {totalAmount}
        </p>
      </div>
    </div>
  );
};

export default OrderTable;
