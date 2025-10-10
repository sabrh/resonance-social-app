import { useTheme } from "../context/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="btn btn-sm btn-ghost">
      {theme === "light" ? <FaMoon /> : <FaSun />}
    </button>
  );
};
