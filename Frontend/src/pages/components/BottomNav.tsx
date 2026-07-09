import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlineUser,
  HiOutlineClipboardList,
} from "react-icons/hi";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Home", icon: HiOutlineHome },
    { path: "/notes", label: "Notes", icon: HiOutlineDocumentText },
    {
      path: "/tasks",
      label: "Tasks",
      icon: HiOutlineClipboardList,
    },
    { path: "/profile", label: "Profile", icon: HiOutlineUser },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {navItems.map((item) => (
          <button
            key={item.path}
            type="button"
            onClick={() => handleNavigate(item.path)}
            className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 ${
              location.pathname.startsWith(item.path)
                ? "text-blue-600"
                : "text-gray-500"
            }`}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;