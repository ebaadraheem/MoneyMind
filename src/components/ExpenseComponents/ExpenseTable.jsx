import React, { useEffect, useCallback, useState } from "react";
import useStore from "../../store/useStore";
import ExpenseApis from "../../services/ExpenseApis";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import PeopleApis from "../../services/PeopleApis";
import Pagination from "../../hooks/usePagination";

const ExpenseTable = () => {
  const {
    expenses,
    setExpenses,
    setLoading,
    openModal,
    setExpenseCategories,
    setEmployees,
    openExpenseFormModal,
    openExpenseDetailModal,
    setCurrentPage,
    currentPage,
    rowsPerPage
  } = useStore();

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ExpenseApis.searchAllExpenses("");
      const employeeData = await PeopleApis.searchEmployees("");
      const expensecategoryData = await ExpenseApis.getExpenseCategories("");
      setExpenses(data);
      setEmployees(employeeData);
      setExpenseCategories(expensecategoryData);
    } catch (err) {
      openModal("error", `Failed to load expenses: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setExpenses, openModal, setEmployees, setExpenseCategories]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);
  
  // Reset to page 1 if the current page becomes invalid after data deletion
  useEffect(() => {
    const totalPages = Math.ceil(expenses.length / rowsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [expenses, currentPage, rowsPerPage]);

  const handleAddOrEdit = (existingExpense = null) => {
    openExpenseFormModal({
      initialData: existingExpense,
      onSubmit: async (formData) => {
        setLoading(true);
        try {
          if (existingExpense?._id) {
            await ExpenseApis.updateExpense(existingExpense._id, formData);
            toast.success(`Expense updated successfully!`);
          } else {
            await ExpenseApis.addExpense(formData);
            toast.success(`Expense added successfully!`);
          }
          fetchExpenses();
        } catch (err) {
          throw new Error(err.message || "Failed to save expense.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleDelete = (expense) => {
    openModal(
      "confirm",
      `Delete expense "${expense.description}"? This action cannot be undone.`,
      async () => {
        setLoading(true);
        try {
          await ExpenseApis.deleteExpense(expense._id);
          toast.success(`Expense deleted successfully!`);
          fetchExpenses();
        } catch (err) {
          openModal("error", `Failed to delete expense: ${err.message}`);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const renderTableRows = () => {
    if (!expenses || expenses.length === 0) {
      return (
        <tr>
          <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
            No expenses found.
          </td>
        </tr>
      );
    }

    // --- Calculate current rows for the page ---
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentExpenses = expenses.slice(indexOfFirstRow, indexOfLastRow);

    return currentExpenses.map((expense,index) => (
      <tr key={expense._id} className="hover:bg-gray-50 text-sm max-sm:text-xs">
        <td className="px-4 py-2 text-gray-700">
          {indexOfFirstRow + index + 1}
        </td>
        <td className="px-4 py-2 text-gray-700">
          {expense.description}
        </td>
        <td className="px-4 py-2 text-gray-700">
          {expense.category?.name || "N/A"}
        </td>
        <td className="px-4 py-2 text-gray-700">
          {parseFloat(expense.amount).toFixed(2)}
        </td>
        <td className="px-4 py-2 text-gray-700">
          {new Date(expense.date).toLocaleDateString()}
        </td>
        <td className="px-4 py-2 ">
          <div className="flex gap-2 justify-center items-center">
            <button
              onClick={() => openExpenseDetailModal(expense)}
              className="text-green-600 hover:text-green-700 cursor-pointer"
            >
              View
            </button>
            <button
              onClick={() => handleAddOrEdit(expense)}
              className="text-blue-900/70 hover:text-blue-900/95 cursor-pointer"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(expense)}
              className="text-red-600 hover:text-red-800 cursor-pointer"
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
      key="expense-management"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl max-sm:text-lg gap-2 font-bold text-blue-900/90 flex items-center">
          <img src="/expense-blue.png" className="w-8 h-8 max-sm:w-7 max-sm:h-7" alt="" />
          Manage Expenses
        </h2>
        <button
          onClick={() => handleAddOrEdit()}
          className="max-sm:text-sm text-lg cursor-pointer bg-blue-900/80 hover:bg-blue-900/90 text-white py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
        >
          + Add Expense
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                S.No.
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                Description
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                Category
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                Amount
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                Date
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {renderTableRows()}
          </tbody>
        </table>
      </div>
      
      {/* --- Render Pagination Controls --- */}
      <Pagination data={expenses} />
    </motion.div>
  );
};

export default ExpenseTable;