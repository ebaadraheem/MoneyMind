import useStore from "../store/useStore";
import { useState, useMemo, useEffect } from "react";
import ALL_NAV_ITEMS from "../utils/AllNavItems";
import { useNavigate } from "react-router-dom";
import BusinessApis from "../services/BusinessApis";

import { IconChevronLeft, IconChevronRight } from "../utils/Icons";

const NavItem = ({
  icon,
  text,
  onClick,
  isActive,
  isSidebarOpen,
  hasChildren,
}) => (
  <li className="mb-2">
    <button
      onClick={onClick}
      className={`flex items-center max-sm:text-sm cursor-pointer w-full text-white h-12 px-4 rounded-lg transition-all duration-300 ${
        isActive
          ? "bg-blue-900/95 font-semibold shadow-md"
          : "hover:bg-blue-900/70"
      } ${!isSidebarOpen && "justify-center"}`}
    >
      {icon}
      <span
        className={`ml-3 whitespace-nowrap transition-all duration-300 ${
          !isSidebarOpen
            ? "w-0 opacity-0 scale-0"
            : "w-auto opacity-100 scale-100"
        }`}
      >
        {text}
      </span>

      {hasChildren && isSidebarOpen && (
        <span className="ml-auto flex items-center">
          {isActive ? (
            <img src="/arrow-up.png" className="w-4 h-4" alt="Collapse" />
          ) : (
            <img src="/arrow-down.png" className="w-4 h-4" alt="Expand" />
          )}
        </span>
      )}
    </button>
  </li>
);

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, userAccesses }) => {
  const {
    businessDetails,
    setBusinessDetails,
    currentView,
    setCurrentView,
    setLoading,
    loading,
    setCurrentPage
  } = useStore();

  const navigate = useNavigate();

  const [expandedItem, setExpandedItem] = useState(null);

  // Memoize visibleNavItems
  const visibleNavItems = useMemo(() => {
    return ALL_NAV_ITEMS.filter((item) => {
      if (userAccesses.includes(item.key)) {
        return true;
      }
      if (item.children) {
        return item.children.some((child) => userAccesses.includes(child.key));
      }
      return false;
    });
  }, [userAccesses]);

  //fetch business details
  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        setLoading(true);
        const response = await BusinessApis.getDetails();
        setBusinessDetails(response);
      } catch (error) {
        console.error("Error fetching business details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessDetails();
  }, [setBusinessDetails]);

  useEffect(() => {
    const currentLink = ALL_NAV_ITEMS.find((item) => item.key === currentView);
    if (currentLink && currentLink.children) {
      setExpandedItem(currentLink.key); 
    } else {
      const parentOfCurrentView = ALL_NAV_ITEMS.find(
        (item) =>
          item.children &&
          item.children.some((child) => child.key === currentView)
      );
      if (parentOfCurrentView) {
        setExpandedItem(parentOfCurrentView.key);
      } else {
        setExpandedItem(null);
      }
    }
  }, [currentView]);

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-transparent z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <div
        className={`
         fixed top-0 left-0 h-screen z-50 flex flex-col text-white
         bg-blue-900/90   
         transition-transform duration-300 ease-in-out
         w-64
         ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
         lg:translate-x-0
         lg:transition-all
         ${isSidebarOpen ? "lg:w-64" : "lg:w-20 "}
        `}
      >
        <div className="flex items-center mb-4  border-b-1 border-r-1 justify-between py-2 lg:py-4  px-4 ">
          <span
            className={`font-bold text-xl  max-sm:text-lg w-full flex justify-center items-center gap-1 transition-all duration-300 ${
              !isSidebarOpen ? "hidden" : "w-auto opacity-100"
            }`}
          >
            <span className="  min-h-8 min-w-8">
              {businessDetails?.logo ? (
                <img
                  src={`${businessDetails.logo}`}
                  alt="Business Logo"
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <img
                  src="/logo-white.png"
                  alt="Default Logo"
                  className="w-7 h-7 max-sm:w-6 max-sm:h-6"
                />
              )}
            </span>
            <span className=" break-all">
              {businessDetails?.name ? businessDetails.name : "SnapMart"}
            </span>
          </span>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 cursor-pointer transition-all  rounded-full hover:bg-blue-900/70 focus:outline-none "
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? (
              <IconChevronLeft className="w-6 h-6 " />
            ) : (
              <IconChevronRight className="w-6 h-6 " />
            )}
          </button>
        </div>

        <nav
          style={{ scrollbarWidth: "none" }}
          className="flex-grow p-2 overflow-y-auto"
        >
          <ul>
            {visibleNavItems.map((link) => (
              <div key={link.key}>
                <NavItem
                  text={link.name}
                  icon={link.icon}
                  hasChildren={!!link.children}
                  isSidebarOpen={isSidebarOpen}
                  isActive={
                    expandedItem === link.key ||
                    currentView === link.key ||
                    (link.children &&
                      link.children.some(
                        (child) => currentView === child.key
                      )) ||
                    (link.key === "pos-screen" &&
                      window.location.pathname === "/pos")
                  }
                  onClick={() => {
                    if (link.children) {
                      setExpandedItem((prev) =>
                        prev === link.key ? null : link.key
                      );
                    } else {
                      setCurrentView(link.key);
                      setExpandedItem(null);
                      setCurrentPage(1);
                      if (window.innerWidth < 1024) setIsSidebarOpen(false);
                    }
                    
                  }}
                />
                {link.children && expandedItem === link.key && (
                  <ul
                    className={` transition-all mb-1.5 duration-300 ${
                      isSidebarOpen ? "pl-4" : "pl-0"
                    } `}
                  >
                    {link.children.map((child) =>
                      userAccesses.includes(child.key) ? (
                        <li key={child.key} className="mb-1 max-sm:text-sm">
                          <button
                            onClick={() => {
                              setCurrentView(child.key);
                              setCurrentPage(1);
                              if (child.key === "pos-screen") {
                                navigate("/pos");
                              }
                              if (window.innerWidth < 1024) {
                                setIsSidebarOpen(false);
                              }
                            }}
                            className={`flex items-center cursor-pointer w-full text-white h-12 px-4 rounded-lg transition-all duration-300 ${
                              currentView === child.key
                                ? "bg-blue-900/95 font-semibold shadow-md"
                                : " hover:bg-blue-900/70 "
                            } ${!isSidebarOpen && "justify-center "}`}
                          >
                            {child.icon}
                            <span
                              className={`ml-3 whitespace-nowrap transition-all duration-300 ${
                                !isSidebarOpen
                                  ? "w-0 opacity-0 scale-0"
                                  : "w-auto opacity-100 scale-100"
                              }`}
                            >
                              {child.name}
                            </span>
                          </button>
                        </li>
                      ) : null
                    )}
                  </ul>
                )}
                {expandedItem === link.key && (
                  <div className="h-0.5 bg-white w-4/5 mx-auto rounded-full mb-2 transition-all duration-300"></div>
                )}
              </div>
            ))}
          </ul>
        </nav>

        <div className="p-2 "></div>
      </div>
    </>
  );
};

export default Sidebar;
