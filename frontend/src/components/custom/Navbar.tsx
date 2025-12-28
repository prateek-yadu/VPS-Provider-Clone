import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import Branding from "../../branding.json";


export default function Navbar() {

    const appName = Branding.AppName; // gets app name from @/src/branding.json

    // gets AuthState
    const authState = useSelector((state: RootState) => state.AuthState);

    // checks if user is authenticated or not
    const isAuthenticated = authState.isAuthenticated;

    // gets user details
    const user = useSelector((state: RootState) => state.AuthState);

    // genrates user fallback text 
    const arr = user.name?.split(" ");
    const fallbackUserAvatar = `${arr?.at(0)?.toUpperCase().charAt(0) + `${arr?.at(arr.length - 1)?.toUpperCase().charAt(0)}`}`;


    const links = [
        {
            name: "Home",
            href: "/"
        },
        {
            name: "Services",
            href: "/services"
        },
        {
            name: "Blogs",
            href: "/blogs"
        },
        {
            name: "Pricing",
            href: "/pricing"
        },
        {
            name: "Support",
            href: "/support"
        },
    ];
    return (
        <nav className='border-b-[1px] border-border-primary'>
            <div className='container m-auto py-4 flex items-center justify-between'>
                <h2 className="logo font-semibold text-xl text-primary">{appName}</h2>
                <ul className='flex items-center gap-4'>
                    {links.map((link) => (
                        <li className='text-secondary-foreground hover:text-accent cursor-pointer' key={link.href}>{link.name}</li>
                    ))}
                </ul>
                {isAuthenticated ? <div className='flex items-center justify-center gap-4'>
                    <div className="size-10 rounded-full">
                        <img src={"https://img.freepik.com/free-photo/sunset-time-tropical-beach-sea-with-coconut-palm-tree_74190-1075.jpg?semt=ais_hybrid&w=740&q=80"} alt={fallbackUserAvatar}
                            className='w-full h-full object-cover rounded-full'
                        />
                    </div>
                </div> : <div className="flex items-center justify-center gap-5 font-medium">
                    <button className='text-sm text-primary'>Login</button>
                    <button className='bg-accent px-4 py-2 text-white rounded-full text-sm'>Register</button>
                </div>}
            </div>
        </nav>
    );
}
