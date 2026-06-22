import useStore from "../../store/useStore";
import ExpenseApis from "../../services/ExpenseApis";
import EntityTable from "../ProductComponents/EntityTable";

const categoryConfig = {
  title: "Expense Categories",
  icon: "/categories-blue.png",
  emptyMessage: "No expense categories found.",
  fetchEntities: () => ExpenseApis.getExpenseCategories(),
  storeKeys: ["expenseCategories", "setExpenseCategories", "openCategoryUOMFormModal"],
  onDeleteEntity: (action, id, data) => {
    if (action === "delete") return ExpenseApis.deleteExpenseCategory(id);
    if (action === "update") return ExpenseApis.updateExpenseCategory(id, data);
    if (action === "create") return ExpenseApis.addExpenseCategory(data);
  },
  columns: [{ key: "name", label: "Name" }],
};

const ExpenseCategoryTable = () => {
  const { setLoading, setError, openModal } = useStore();
  const [entities, setEntities, openFormModal] = categoryConfig.storeKeys.map(
    (key) => useStore((state) => state[key])
  );

  return (
    <EntityTable
      title={categoryConfig.title}
      icon={categoryConfig.icon}
      entityKey="expenseCategories"
      emptyMessage={categoryConfig.emptyMessage}
      fetchEntities={categoryConfig.fetchEntities}
      entities={entities}
      setEntities={setEntities}
      openFormModal={openFormModal}
      onDeleteEntity={categoryConfig.onDeleteEntity}
      columns={categoryConfig.columns}
      setLoading={setLoading}
      setError={setError}
      openModal={openModal}
    />
  );
};

export default ExpenseCategoryTable;