// src/router.tsx
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
// import PostDetail from "../pages/PostDetail"; // NEW

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <About /> },
      { path: "profile", element: <UserProfile /> },
      { path: "profile/:uid", element: <UserProfile /> },
      { path: "messages", element: <Chats /> },
      { path: "notifications", element: <Notifications /> },
      { path: "home", element: <Home /> },
      { path: "post/:postId", element: <PostDetail /> } // NEW - Post detail route
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