import { FaMoon, FaSun } from "react-icons/fa6";
import { useTheme } from "../context/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="btn btn-sm btn-ghost">
      {theme === "light" ? <FaMoon /> : <FaSun />}
    </button>
  );
}
