import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import useStore from "../../store/useStore";
import Pagination from "../../hooks/usePagination";

const EntityTable = ({
  title,
  icon,
  entityKey,
  emptyMessage,
  fetchEntities,
  entities,
  setEntities,
  openFormModal,
  onDeleteEntity,
  columns,
  setLoading,
  setError,
  openModal,
}) => {
  const {
    setUserRole,
    userRole,
    rowsPerPage,
    currentPage,
    setCurrentPage,
  } = useStore();

  const loadEntities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEntities();
      setEntities(data);
    } catch (err) {
      openModal(
        "error",
        `Failed to load ${title.toLowerCase()}: ${err.message}`
      );
      setError(`Failed to fetch ${title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [fetchEntities, setEntities, setLoading, setError, openModal, title]);

  useEffect(() => {
    loadEntities();
  }, [loadEntities]);

  // Reset to page 1 if the current page becomes invalid after data changes
  useEffect(() => {
    const totalPages = Math.ceil(entities.length / rowsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [entities, currentPage, rowsPerPage, setCurrentPage]);

  const handleAddOrEdit = (existingItem = null) => {
    openFormModal({
      initialData: existingItem,
      onSubmit: async (formData) => {
        setLoading(true);
        try {
          if (existingItem && existingItem._id) {
            await onDeleteEntity("update", existingItem._id, formData);
            if (userRole._id === formData._id) {
              setUserRole({
                ...userRole,
                name: formData.name,
              });
            }
            toast.success(`${title} "${formData.name}" updated successfully!`);
          } else {
            const newItem = await onDeleteEntity("create", null, formData);
            setEntities([...entities, newItem]);
            toast.success(`${title} "${formData.name}" created successfully!`);
          }
          loadEntities();
        } catch (err) {
          toast.error(`Failed to save ${title.toLowerCase()}: ${err.message}`);
          setError(`Failed to save ${title.toLowerCase()}.`);
        } finally {
          setLoading(false);
        }
      },
      modalName: title,
    });
  };

  const handleDelete = (item) => {
    openModal(
      "confirm",
      `Are you sure you want to delete ${title.toLowerCase()} "${
        item.name
      }"?`,
      async () => {
        setLoading(true);
        setError(null);
        try {
          await onDeleteEntity("delete", item._id);
          toast.success(`${title} "${item.name}" deleted successfully!`);
          loadEntities();
        } catch (err) {
          toast.error(
            `Failed to delete ${title.toLowerCase()}: ${err.message}`
          );
          setError(`Failed to delete ${title.toLowerCase()}.`);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  // Add Serial Number and Actions columns
  const extendedColumns = [
    { key: "__sno", label: "S.No." },
    ...columns,
    { key: "__actions", label: "Actions", isAction: true },
  ];

  // --- Calculate current rows for the page ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentEntities = entities.slice(indexOfFirstRow, indexOfLastRow);



  return (
    <motion.div
      key={`${entityKey}-table`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-2xl gap-2 text-blue-900/90 mb-6 flex items-center justify-between">
        <span className="flex items-center font-bold text-lg sm:text-2xl">
          <img
            src={icon}
            className="w-8 h-8 max-sm:w-7 max-sm:h-7 mr-2"
            alt="icon"
          />{" "}
          {title} List
        </span>
        <button
          onClick={() => handleAddOrEdit()}
          className="flex-1 max-w-[230px] sm:font-bold sm:max-w-3xs max-sm:text-sm text-lg cursor-pointer bg-blue-900/80 hover:bg-blue-900/90 text-white sm:p-2 p-1.5 rounded-md transition duration-200 flex items-center justify-center"
        >
          + Add {title}
        </button>
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50">
            <tr>
              {extendedColumns.map((col, index) => (
                <th
                  key={index}
                  className={`px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wider ${
                    index === 0 ? "rounded-tl-md" : ""
                  } ${
                    col.key === "__actions" ? "text-center" : "text-left"
                  } ${
                    index === extendedColumns.length - 1 ? "rounded-tr-md" : ""
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {currentEntities.length === 0 ? (
              <tr>
                <td
                  colSpan={extendedColumns.length}
                  className="px-4 py-4 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              currentEntities.map((item, index) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  {extendedColumns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-2 text-gray-700 text-sm max-sm:text-xs"
                    >
                      {col.key === "__sno" ? (
                        indexOfFirstRow + index + 1
                      ) : col.isAction ? (
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleAddOrEdit(item)}
                            className="text-blue-900/70 cursor-pointer hover:text-blue-900/95 transition"
                          >
                            Edit
                          </button>
                          {item._id !== "688b43df2881666cad5d8c21" && (
                            <button
                              onClick={() => handleDelete(item)}
                              className="text-red-600 cursor-pointer hover:text-red-800 transition"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      ) : col.render ? (
                        col.render(item)
                      ) : (
                        item[col.key]
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination data={entities} />
    </motion.div>
  );
};

export default EntityTable;
