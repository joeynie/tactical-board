import { Link, useLocation } from "react-router-dom";
// import { LayoutDashboard, Tv, Calendar, BarChart3 } from "lucide-react";
import { useState } from "react";
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import BarChartIcon from '@mui/icons-material/BarChart';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

// 导航项配置
const navItems = [
  { name: "战术面板", path: "/", icon: <DashboardIcon className="w-5 h-5" /> },
  { name: "赛程分析", path: "/schedule", icon: <CalendarMonthIcon className="w-5 h-5" /> },
  { name: "比赛直播", path: "/live", icon: <LiveTvIcon className="w-5 h-5" /> },
  { name: "数据管理", path: "/data", icon: <BarChartIcon className="w-5 h-5" /> },
];

// 美观的导航栏组件
export default function Navbar() {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };
  
  const location = useLocation();
  return (
    <>
        <IconButton onClick={toggleDrawer(true)}> <MenuIcon /> </IconButton>
        <Drawer open={open} onClose={toggleDrawer(false)}>
            <div className="flex justify-between items-center p-4 bg-blue-500 text-white">
                <IconButton onClick={toggleDrawer(false)}><CloseIcon /></IconButton>
            </div>
            <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, padding: "0 8px" }}>
            {navItems.map((item) => (
                <Link
                key={item.path}
                to={item.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 16px",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: location.pathname === item.path ? "#1976d2" : "#1976d222",
                  background: location.pathname === item.path ? "#fff" : "#fff",
                  fontWeight: location.pathname === item.path ? "bold" : "normal",
                  boxShadow: location.pathname === item.path ? "0 2px 8px #1976d222" : "none",
                  transition: "background 0.2s,color 0.2s"
                }}
                >
                {item.icon}
                <span>{item.name}</span>
                </Link>
            ))}
            </nav>
        </Drawer>
    </>
  );
}