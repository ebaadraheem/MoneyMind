import { IconDashboard } from "./Icons";

const ALL_NAV_ITEMS = [
  {
    name: "Dashboard",
    key: "dashboard",
    icon: <IconDashboard className="w-6 h-6  flex-shrink-0" />,
  },
  {
    name: "People",
    key: "people",
    icon: <img src="/customer.png" className="w-5.5 h-5.5 flex-shrink-0" />,
    children: [
      {
        name: "Customers",
        key: "customer-management",
        icon: ".",
      },
      {
        name: "Employees",
        key: "employee-management",
        icon: ".",
      },
      {
        name: "Suppliers",
        key: "supplier-management",
        icon: ".",
      },
    ],
  },
  {
    name: "Inventory",
    key: "product-management",
    icon: (
      <img src="/product-management.png" className="w-6 h-6 flex-shrink-0" />
    ),
    children: [
      {
        name: "Products",
        key: "products",
        icon: ".",
      },
      {
        name: "Categories",
        key: "categories",
        icon: ".",
      },
      {
        name: "UOMs",
        key: "uoms",
        icon: ".",
      },
    ],
  },
  {
    name: "Stock",
    key: "stock",
    icon: <img src="/stock.png" className="w-7 h-7 flex-shrink-0" />,
  },
  {
    name: "Sales",
    key: "sales-management",
    icon: <img src="/sales.png" className="w-6 h-6 flex-shrink-0" />,
    children: [
      {
        name: "Point of Sale",
        key: "pos-screen",
        icon: ".",
      },
      {
        name: "Sales List",
        key: "sales-list",
        icon: ".",
      },

      {
        key: "sale-return",
        name: "Sale Return",
        icon: ".",
      },
      {
        key: "sale-return-list",
        name: "Returns List",
        icon: ".",
      },
    ],
  },
  {
    name: "Purchases",
    key: "purchase-management",
    icon: <img src="/cart-white.png" className="w-6 h-6 flex-shrink-0" />,
    children: [
      {
        name: "Purchase/Add Stock",
        key: "purchase-add-stock",
        icon: ".",
      },
      {
        name: "Purchases List",
        key: "purchase-list",
        icon: ".",
      },
      {
        name: "Purchase Return",
        key: "purchase-return",
        icon: ".",
      },
      {
        name: "Returns List",
        key: "purchase-return-list",
        icon: ".",
      },
    ],
  },
  {
    name: "Expense",
    key: "expense-management",
    icon: <img src="/expense.png" className="w-6 h-6 flex-shrink-0" />,
    children: [
      {
        name: "Expense Categories",
        key: "expense-categories",
        icon: ".",
      },
      {
        name: "Manage Expenses",
        key: "manage-expenses",
        icon: ".",
      },
    ],
  },
  {
    name: "Accounts",
    key: "accounts",
    icon: <img src="/accounts.png" className="w-6 h-6 flex-shrink-0 " />,
    children: [
      {
        name: "Customer Accounts",
        key: "customer-accounts",
        icon: ".",
      },
      {
        name: "Employee Accounts",
        key: "employee-accounts",
        icon: ".",
      },
      {
        name: "Supplier Accounts",
        key: "supplier-accounts",
        icon: ".",
      },
    ],
  },
  {
    name: "Reports",
    key: "reports",
    icon: <img src="/list-white.png" className=" w-5 h-5 flex-shrink-0" />,
    children: [
      {
        name: "Purchase Reports", 
        key: "purchase-reports-tab", 
        icon: ".",
      },
      {
        name: "Sales Reports", 
        key: "sales-reports-tab", 
        icon: ".",
      },
      {
        name: "Profit & Loss Reports", 
        key: "profit-loss-reports-tab", 
        icon: ".",
      },
      {
        name: "Business Capital Report", 
        key: "business-capital-reports-tab", 
        icon: ".",
      },
      {
        name: "People Reports", 
        key: "people-reports-tab", 
        icon: ".",
      },
      {
        name: "Accounts Reports", 
        key: "accounts-reports-tab", 
        icon: ".",
      },
      {
        name: "Balance Reports", 
        key: "balance-reports-tab", 
        icon: ".",
      },
      {
        name: "Inventory Report", 
        key: "inventory-stock-reports-tab", 
        icon: ".",
      },
      {
        name: "Expense Reports", 
        key: "expense-reports-tab", 
        icon: ".",
      },
      {
        name: "Attendance Reports", 
        key: "attendance-reports-tab", 
        icon: ".",
      },
    ],
  },
  {
    name: "Attendance",
    key: "attendance",
    icon: <img src="/attendance.png" className="w-5 h-5 flex-shrink-0" />,
    children: [
      {
        name: "Employees Attendance",
        key: "employee-attendance",
        icon: ".",
      },
      {
        name: "Attendance List",
        key: "attendance-list",
        icon: ".",
      },
    ],
  },
  {
    name: "System Users",
    key: "system-users",
    icon: <img src="/access-control.png" className="w-6 h-6 flex-shrink-0" />,
    children: [
      {
        name: "User Management",
        key: "user-management",
        icon: ".",
      },
      {
        name: "Role Management",
        key: "role-management",
        icon: ".",
      },
    ],
  },
  {
    name: "Configuration",
    key: "configuration",
    icon: <img src="/ruler.png" className="w-5.5 h-5.5 flex-shrink-0" />,
    children: [
      {
        name: "Access Control",
        key: "access-control",
        icon: ".",
      },
      {
        name: "Password Reset",
        key: "password-reset",
        icon: ".",
      },
      {
        name: "Business Variables",
        key: "business-variables",
        icon: ".",
      },
      {
        name: "Areas",
        key: "areas",
        icon: ".",
      },
      {
        name: "Types",
        key: "types",
        icon: ".",
      }
    ],
  },
];

export default ALL_NAV_ITEMS;
