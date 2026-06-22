import { create } from "zustand";
import ProductApis from "../services/ProductApis"; 

const useStore = create((set, get) => ({
  products: [],
  customers: [],
  employees: [], 
  suppliers: [], 
  purchases: [],
  sales: [],
  businessDetails: [],
  purchaseReturns: [],
  salesReturns: [],
  categories: [],
  expenseCategories: [],
  typesList: [],
  areasList: [],
  roles: [], 
  expenses: [], 
  currentPage: 1,
  rowsPerPage: 10,
  uoms: [], 
  permissionTrigger: 0, 
  currentOrder: [],
  iswalkInCustomer: true,
  currentCustomer: null,
  totalAmount: 0,
  discount: 0,
  paidAmount: 0,
  returnAmount: 0,
  userAccesses: [], 
  currentView: "dashboard",
  previousView: null, 
  heldInvoices: [],
  todaySales: [], 
  modal: {
    isOpen: false,
    type: "",
    message: "",
    onConfirm: null,
    onCancel: null,
  },
  loading: false,
  error: null,
  userRole: {
    name: null,
    _id: null,
  },
  employeeId: null, 

  addProductToOrder: (product, quantity) => {
    set((state) => {
      const existingProductIndex = state.currentOrder.findIndex(
        (item) => item.productId === product._id
      );
      if (existingProductIndex > -1) {
        const updatedOrder = [...state.currentOrder];
        updatedOrder[existingProductIndex].quantity += quantity;
        updatedOrder[existingProductIndex].subtotal =
          updatedOrder[existingProductIndex].quantity *
          updatedOrder[existingProductIndex].price;
        return { currentOrder: updatedOrder };
      } else {
        const newProduct = {
          productId: product._id,
          name: product.name,
          code: product.code,
          cost: product.costprice,
          price: product.saleprice,
          profit: product.saleprice - product.costprice,
          quantity: quantity,
          stock: product.stock, 
          subtotal: product.saleprice * quantity,
        };
        return { currentOrder: [...state.currentOrder, newProduct] };
      }
    });
    get().calculateTotals();
  },
  updateProductQuantity: (productId, newQuantity, newPrice) => {
    const quantity = Number(newQuantity);
    if (isNaN(quantity)) return;

    set((state) => {
      const updatedOrder = state.currentOrder.map((item) => {
        if (item.productId === productId) {
          const validQuantity = Math.max(1, Math.min(quantity, item.stock));
          return {
            ...item,
            quantity: validQuantity,
            price: newPrice,
            profit: newPrice - item.cost,
            subtotal: newPrice * validQuantity,
          };
        }
        return item;
      });

      return { currentOrder: updatedOrder };
    });

    get().calculateTotals();
  },

  removeProductFromOrder: (productId) => {
    set((state) => ({
      currentOrder: state.currentOrder.filter(
        (item) => item.productId !== productId
      ),
    }));
    get().calculateTotals();
  },
  calculateTotals: () => {
    set((state) => {
      const subtotal = state.currentOrder.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );

      const total = subtotal - state.discount;
      const returnAmt = state.paidAmount - total || 0;
      return { totalAmount: total, returnAmount: returnAmt };
    });
  },
  setDiscount: (discount) => {
    set({ discount });
    get().calculateTotals();
  },
  setPaidAmount: (paidAmount) => {
    set({ paidAmount });
    get().calculateTotals();
  },
  resetOrder: () => {
    set({
      currentOrder: [],
      currentCustomer: null,
      totalAmount: 0,
      discount: 0,
      paidAmount: 0,
      returnAmount: 0,
      iswalkInCustomer: true,
    });
  },

  // Customer actions
  setCurrentCustomer: (customer) => set({ currentCustomer: customer }),
  removeCurrentCustomer: () => set({ currentCustomer: null }),

  // Modal actions
  openModal: (type, message, onConfirm = null, onCancel = null) => {
    set({ modal: { isOpen: true, type, message, onConfirm, onCancel } });
  },
  closeModal: () => {
    set((state) => ({ modal: { ...state.modal, isOpen: false } }));
  },

  personFormModal: {
    
    isOpen: false,
    type: "", 
    onSubmit: null,
    initialData: null,
  },
  openPersonFormModal: (
    type,
    onSubmit,
    initialData = null 
  ) => set({ personFormModal: { isOpen: true, type, onSubmit, initialData } }),
  closePersonFormModal: () =>
    set((state) => ({
      personFormModal: {
        ...state.personFormModal,
        isOpen: false,
        type: "",
        onSubmit: null,
        initialData: null,
      },
    })),
  // Person Detail Modal
  personDetailModal: {
    isOpen: false,
    type: "", // 'customer', 'employee', 'supplier'
    data: null,
  },
  openPersonDetailModal: (
    type,
    data
  ) => set({ personDetailModal: { isOpen: true, type, data } }),
  closePersonDetailModal: () =>
    set((state) => ({
      personDetailModal: {
        ...state.personDetailModal,
        isOpen: false,
        type: "",
        data: null,
      },
    })),
  // Product Form Modal
  productFormModal: {
    isOpen: false,
    onSubmit: null,
  },

  openProductFormModal: (payload) =>
    set({
      productFormModal: {
        isOpen: true,
        onSubmit: payload.onSubmit,
        initialData: payload.initialData || null,
      },
    }),

  closeProductFormModal: () =>
    set((state) => ({
      productFormModal: { ...state.productFormModal, isOpen: false },
    })),
  expenseFormModal: {
    isOpen: false,
    onSubmit: null, 
    initialData: null, 
  },

  openExpenseFormModal: (payload) =>
    set({
      expenseFormModal: {
        isOpen: true,
        onSubmit: payload.onSubmit,
        initialData: payload.initialData || null,
      },
    }),

  closeExpenseFormModal: () =>
    set((state) => ({
      expenseFormModal: { ...state.expenseFormModal, isOpen: false },
    })),
  // Expense Detail Modal
  expenseDetailModal: {
    isOpen: false,
    expenseData: null, // Data to display in the detail view
  },

  openExpenseDetailModal: (expenseData) =>
    set({ expenseDetailModal: { isOpen: true, expenseData } }),
  closeExpenseDetailModal: () =>
    set((state) => ({
      expenseDetailModal: {
        ...state.expenseDetailModal,
        isOpen: false,
        expenseData: null,
      },
    })),

  // State for the UOM form modal
  categoryuomFormModal: {
    isOpen: false,
    initialData: null,
    onSubmit: null,
    modalName: "",
  },
  openCategoryUOMFormModal: ({ initialData, onSubmit, modalName = "" }) => {
    set((state) => ({
      categoryuomFormModal: {
        ...state.categoryuomFormModal,
        isOpen: true,
        initialData,
        onSubmit,
        modalName,
      },
    }));
  },
  closeCategoryUOMFormModal: () => {
    set((state) => ({
      categoryuomFormModal: {
        ...state.categoryuomFormModal,
        isOpen: false,
        initialData: null,
        onSubmit: null,
        modalName: "",
      },
    }));
  },

  // Data fetching/management
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setProducts: (products) => set({ products }),
  setCustomers: (customers) => set({ customers }),
  setEmployees: (employees) => set({ employees }), 
  refreshPermissions: () => set((state) => ({ permissionTrigger: state.permissionTrigger + 1 })),
  setSuppliers: (suppliers) => set({ suppliers }), 
  setCategories: (categories) => set({ categories }), 
  setExpenseCategories: (expenseCategories) => set({ expenseCategories }),
  setAreasList: (areasList) => set({ areasList }),
  setTypesList: (typesList) => set({ typesList }),
  setRoles: (roles) => set({ roles }),
  setExpenses: (expenses) => set({ expenses }),
  setPurchases: (purchases) => set({ purchases }),
  setSales: (sales) => set({ sales }), 
  setPurchaseReturns: (returns) => set({ purchaseReturns: returns }), 
  setSalesReturns: (returns) => set({ salesReturns: returns }), 
  setBusinessDetails: (details) => set({ businessDetails: details }),
  setUOMs: (uoms) => set({ uoms }), 
  setHeldInvoices: (invoices) => set({ heldInvoices: invoices }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setRowsPerPage: (rows) => set({ rowsPerPage: rows }),
  setTodaySales: (sales) => set({ todaySales: sales }),
  setwalkinCustomer: (isWalkIn) => set({ iswalkInCustomer: isWalkIn }),
  setUserRole: (newRole) => set({ userRole: newRole }), 
  setEmployeeId: (id) => set({ employeeId: id }),
  setCurrentView: (newView) =>
    set((state) => ({
      previousView:
        state.currentView == "pos-screen"
          ? state.currentView
          : state.previousView,
      currentView: newView,
    })),
  setUserAccesses: (accesses) => set({ userAccesses: accesses }),

  
  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const categories = await ProductApis.getCategories();
      set({ categories: categories });
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      set({ error: `Failed to fetch categories: ${err.message}` });
    } finally {
      set({ loading: false });
    }
  },

  
  fetchUOMs: async () => {
    set({ loading: true, error: null });
    try {
      const uoms = await ProductApis.getUOMs();
      set({ uoms: uoms });
    } catch (err) {
      console.error("Failed to fetch UOMs:", err);
      set({ error: `Failed to fetch UOMs: ${err.message}` });
    } finally {
      set({ loading: false });
    }
  },
}));

export default useStore;
