import type { Config } from "tailwindcss";
// @ts-ignore
import daisyui from "daisyui";

const config: Config = { 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: {} },
  plugins: [daisyui],
};

export default config;