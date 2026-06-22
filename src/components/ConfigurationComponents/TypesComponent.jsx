import useStore from "../../store/useStore";
import TypesApis from "../../services/TypesApis";
import EntityTable from "../ProductComponents/EntityTable";

const categoryConfig = {
  title: "Types",
  icon: "/categories-blue.png",
  emptyMessage: "No types found.",
  fetchEntities: () => TypesApis.searchCategory(),
  storeKeys: ["typesList", "setTypesList", "openCategoryUOMFormModal"],
  onDeleteEntity: (action, id, data) => {
    if (action === "delete") return TypesApis.deleteCategory(id);
    if (action === "update") return TypesApis.updateCategory(id, data);
    if (action === "create") return TypesApis.addCategory(data);
  },
  columns: [{ key: "name", label: "Name" }],
};

const TypesComponent = () => {
  const { setLoading, setError, openModal } = useStore();
  const [entities, setEntities, openFormModal] = categoryConfig.storeKeys.map(
    (key) => useStore((state) => state[key])
  );

  return (
    <EntityTable
      title={categoryConfig.title}
      icon={categoryConfig.icon}
      entityKey="typesCategories"
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

export default TypesComponent;