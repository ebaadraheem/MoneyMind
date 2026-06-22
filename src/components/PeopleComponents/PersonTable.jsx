import React, { useEffect, useCallback, useState } from "react";
import useStore from "../../store/useStore";
import PeopleApis from "../../services/PeopleApis";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Pagination from "../../hooks/usePagination";

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const PersonTable = ({ type }) => {
  const collectionName = type + "s";
  const setCollection = useStore(
    (state) => state[`set${capitalize(collectionName)}`]
  );
  const collection = useStore((state) => state[collectionName]);

  const {
    setLoading,
    setError,
    openModal,
    openPersonFormModal,
    openPersonDetailModal,
    currentPage,
    setCurrentPage,
    rowsPerPage,
  } = useStore();

  const apiMap = {
    customer: {
      search: PeopleApis.searchCustomers,
      add: PeopleApis.addCustomer,
      update: PeopleApis.updateCustomer,
      delete: PeopleApis.deleteCustomer,
    },
    employee: {
      search: PeopleApis.searchEmployees,
      add: PeopleApis.addEmployee,
      update: PeopleApis.updateEmployee,
      delete: PeopleApis.deleteEmployee,
    },
    supplier: {
      search: PeopleApis.searchSuppliers,
      add: PeopleApis.addSupplier,
      update: PeopleApis.updateSupplier,
      delete: PeopleApis.deleteSupplier,
    },
  };

  const getApiMethods = (entityType) => {
    const methods = apiMap[entityType];
    if (!methods) {
      console.error(`API methods for type '${entityType}' are not defined.`);
      toast.error(`Configuration error for ${entityType} management.`);
      return {};
    }
    return methods;
  };

  const fetchPeople = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { search } = getApiMethods(type);
      if (!search) throw new Error(`Search API for ${type} not available.`);
      const data = await search("");
      setCollection(data);
    } catch (err) {
      openModal("error", `Failed to load ${type}s: ${err.message}`);
      setError(`Failed to fetch ${type}s.`);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, openModal, setCollection, type]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  // Reset to page 1 if the current page becomes invalid after data changes
  useEffect(() => {
    const totalPages = Math.ceil(collection.length / rowsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [collection, currentPage, rowsPerPage]);

  const handleAddOrEditPerson = (existingPerson = null) => {
    openPersonFormModal(
      type,
      async (formData) => {
        setLoading(true);

        try {
          const { add, update } = getApiMethods(type);
          let result;
          if (existingPerson && existingPerson._id) {
            if (!update)
              throw new Error(`Update API for ${type} not available.`);
            await update(existingPerson._id, formData);
            toast.success(
              `${capitalize(type)} "${formData.name}" updated successfully!`
            );
          } else {
            if (!add) throw new Error(`Add API for ${type} not available.`);
            result = await add(formData);
            useStore
              .getState()
              [`set${capitalize(collectionName)}`]([
                ...useStore.getState()[collectionName],
                result,
              ]);
            toast.success(
              `${capitalize(type)} "${result.name}" added successfully!`
            );
          }
          fetchPeople();
        } catch (err) {
          openModal("error", `Failed to save ${type}: ${err.message}`);
          setError(`Failed to save ${type}.`);
        } finally {
          setLoading(false);
        }
      },
      existingPerson
    );
  };

  const handleDeletePerson = (person) => {
    openModal(
      "confirm",
      `Are you sure you want to delete ${type} "${person.name}"?`,
      async () => {
        setLoading(true);
        setError(null);
        try {
          const { delete: deleteApi } = getApiMethods(type);
          if (!deleteApi)
            throw new Error(`Delete API for ${type} not available.`);
          await deleteApi(person._id);
          toast.success(
            `${capitalize(type)} "${person.name}" deleted successfully!`
          );
          fetchPeople();
        } catch (err) {
          openModal("error", `Failed to delete ${type}: ${err.message}`);
          setError(`Failed to delete ${type}.`);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const getTableHeaders = () => {
    return (
      <tr className="">
        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tl-md">
          S.No.
        </th>
        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tl-md">
          Name
        </th>
        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
          Phone
        </th>
        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
          Address
        </th>
        <th className="px-4 py-2  text-center text-xs  font-medium text-gray-600 uppercase tracking-wider rounded-tr-md">
          Actions
        </th>
      </tr>
    );
  };

  const renderTableRows = () => {
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = collection.slice(indexOfFirstRow, indexOfLastRow);

    if (collection.length === 0) {
      return (
        <tr>
          <td
            colSpan={type === "employee" ? "5" : "4"}
            className="px-4 py-4 text-center text-gray-500"
          >
            No {type}s found.
          </td>
        </tr>
      );
    }

    return currentRows.map((person, index) => (
      <tr key={person._id} className="hover:bg-gray-50 text-sm max-sm:text-xs">
        <td className="px-4 py-2 text-gray-700">
          {indexOfFirstRow + index + 1}
        </td>
        <td className="px-4 py-2  text-gray-700">{person.name}</td>
        <td className="px-4 py-2 text-gray-700">{person.phone || "N/A"}</td>
        <td className="px-4 py-2 text-gray-700">{person.address || "N/A"}</td>

        <td className="px-4 py-2">
          <div className="flex gap-2  justify-center items-center">
            <button
              className=" text-green-600 cursor-pointer hover:text-green-700"
              onClick={() => openPersonDetailModal(type, person)}
            >
              View
            </button>
            <button
              onClick={() => handleAddOrEditPerson(person)}
              className="text-blue-900/70 cursor-pointer hover:text-blue-900/95 transition"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeletePerson(person)}
              className="text-red-600 cursor-pointer hover:text-red-800 transition"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <motion.div
      key={`${type}-management`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className=" gap-2  text-blue-900/90 mb-6 flex items-center justify-between">
        <span className="flex font-bold items-center text-lg sm:text-2xl">
          <img
            src={`${type}-blue.png`}
            className="w-8 h-8 max-sm:w-7 max-sm:h-7 mr-2"
            alt=""
          />{" "}
          {capitalize(type)} Management
        </span>
        <button
          onClick={() => handleAddOrEditPerson()}
          className="flex-1 sm:font-bold max-sm:text-sm sm:max-w-3xs max-w-[230px] text-lg cursor-pointer bg-blue-900/80 hover:bg-blue-900/90 text-white p-1.5 sm:p-2 rounded-md transition duration-200 flex items-center justify-center"
        >
          + Add {capitalize(type)}
        </button>
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50">{getTableHeaders()}</thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {renderTableRows()}
          </tbody>
        </table>
      </div>

      {/* --- Render Pagination Controls --- */}
      <Pagination data={collection} />
    </motion.div>
  );
};

export default PersonTable;
