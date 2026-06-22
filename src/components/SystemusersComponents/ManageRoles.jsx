import useStore from "../../store/useStore";
import EntityTable from "../ProductComponents/EntityTable";
import api from "../../services/api";
                          
const categoryConfig = {
  title: "Roles",
  icon: "/categories-blue.png",
  emptyMessage: "No roles found.",
  fetchEntities: () => api.getAllRoles(""),
  storeKeys: ["roles", "setRoles", "openCategoryUOMFormModal"],
  onDeleteEntity: (action, id, data) => {
    if (action === "delete") return api.deleteRole(id);
    if (action === "update") return api.updateRole(id, data);
    if (action === "create") return api.addRole(data);
  },
  columns: [{ key: "name", label: "Name" }],
};

const ManageRoles = () => {
  const { setLoading, setError, openModal } = useStore();
  const [entities, setEntities, openFormModal] = categoryConfig.storeKeys.map(
    (key) => useStore((state) => state[key])
  );


  return (
    <EntityTable
      title={categoryConfig.title}
      icon={categoryConfig.icon}
      entityKey="roles"
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

export default ManageRoles;