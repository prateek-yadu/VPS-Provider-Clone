import { Outlet } from 'react-router';
import { ThemeProvider } from '../components/custom/theme-provider';
import { Toaster } from '../components/ui/sonner';

export default function Layout() {
    return (
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <Toaster position='top-center' richColors />
            <Outlet />
        </ThemeProvider>
    );
}
