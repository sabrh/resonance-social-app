import { createBrowserRouter } from "react-router";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import Home from "../pages/Home";
import UserProfile from "../pages/UserProfile";
import Chats from "../pages/Chats";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ErrorPage from "../pages/ErrorPage";
import Notifications from "../pages/Notifications";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "profile", element: <UserProfile /> },
      { path: "chats", element: <Chats /> },
      { path: "notifications", element: <Notifications /> },
    ],
  },
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
    ],
  },
]);