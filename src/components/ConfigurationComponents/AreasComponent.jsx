import useStore from "../../store/useStore";
import AreaApis from "../../services/AreaApis";
import EntityTable from "../ProductComponents/EntityTable";

const categoryConfig = {
  title: "Areas",
  icon: "/categories-blue.png",
  emptyMessage: "No areas found.",
  fetchEntities: () => AreaApis.searchCategory(),
  storeKeys: [
    "areasList",
    "setAreasList",
    "openCategoryUOMFormModal",
  ],
  onDeleteEntity: (action, id, data) => {
    if (action === "delete") return AreaApis.deleteCategory(id);
    if (action === "update") return AreaApis.updateCategory(id, data);
    if (action === "create") return AreaApis.addCategory(data);
  },
  columns: [{ key: "name", label: "Name" }],
};

const AreaComponent = () => {
  const { setLoading, setError, openModal } = useStore();
  const [entities, setEntities, openFormModal] = categoryConfig.storeKeys.map(
    (key) => useStore((state) => state[key])
  );

  return (
    <EntityTable
      title={categoryConfig.title}
      icon={categoryConfig.icon}
      entityKey="areaCategories"
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

export default AreaComponent;
