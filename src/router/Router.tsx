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
import About from "../pages/About";
import PasswordForget from "../pages/auth/PasswordForget";
import PostDetail from "../components/post-components/PostDetail";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <About /> },
      { path: "profile", element: <UserProfile /> },
      { path: "messages", element: <Chats /> },
      { path: "notifications", element: <Notifications /> },
      { path: "/post/:postId", element: <PostDetail /> },
      { path: "home", element: <Home /> },

    ],
  },
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      {
        path: '/auth/forget-password',
        element: <PasswordForget />
      },
      { path: "signup", element: <Signup /> },
    ],
  },
]);
