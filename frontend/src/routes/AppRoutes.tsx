import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import App from '../pages/Home';
import Layout from "../pages/Layout";
import DashboardLayout from "../pages/dashboard/DashboardLayout";
import Dashboard from "../pages/dashboard";
import VPS from "../pages/dashboard/VPS/VPS";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProtectedRoute from "../components/custom/ProtectedRoute";
import AuthProvider from "../components/custom/AuthProvider";
import { Provider } from "react-redux";
import { store } from "../app/store";
import Pricing from "../pages/Pricing";


export default function AppRoutes() {
    const router = createBrowserRouter([
        {
            path: "/",
            Component: Layout,
            children: [
                { index: true, Component: App },
                { path: "login", Component: Login },
                { path: "register", Component: Register },
                { path: "pricing", Component: Pricing },
                {
                    Component: ProtectedRoute,
                    children: [
                        {
                            path: "dashboard", Component: DashboardLayout, children: [
                                { index: true, Component: Dashboard },
                                { path: "vps", Component: VPS }
                            ]
                        }
                    ]
                }
            ]
        },
    ]);
    return (
        // Redux toolkit provider
        <Provider store={store}>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
        </Provider>
    );
}