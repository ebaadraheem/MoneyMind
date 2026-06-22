// --- Pagination Component ---
import useStore from "../store/useStore";
const Pagination = ({ data }) => {
  const { currentPage, rowsPerPage, setCurrentPage } = useStore();
  const pageNumbers = [];
  const totalPages = Math.ceil(data.length / rowsPerPage);

  if (totalPages <= 1) return null;

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="mt-4 flex justify-center">
      <ul className="flex items-center -space-x-px h-8 text-sm">
        {pageNumbers.map((number) => (
          <li key={number}>
            <button
              onClick={() => setCurrentPage(number)}
              className={`flex items-center justify-center cursor-pointer px-3 h-8 leading-tight ${
                currentPage === number
                  ? "z-10 text-blue-600 border border-blue-300 bg-blue-50"
                  : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};
export default Pagination;
