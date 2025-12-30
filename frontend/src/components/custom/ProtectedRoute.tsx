import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router';
import type { RootState } from '../../app/store';
import { useEffect, useState } from 'react';
import { updateAuthState } from '../../app/features/auth/AuthHandler';
import { toast } from 'sonner';


export default function ProtectedRoute() {

    // sets loading state 
    const [loading, setLoading] = useState(true);

    // gets AuthState
    const authState = useSelector((state: RootState) => state.AuthState);

    const dispatch = useDispatch();

    const checkAuth = async () => {

        // sets loading to true
        setLoading(true);

        try {
            // checks if token is vailed or not 
            const response = await (await fetch("/api/v1/auth/validate", {
                method: "POST"
            })).json();

            if (response.status === 200) {

                if (authState.isAuthenticated == false) {
                    // requests user data
                    const userDataRequest = await (await fetch("/api/v1/profile/me", {
                        method: "GET"
                    })).json();

                    // user data 
                    const userData = {
                        name: userDataRequest.data.name,
                        email: userDataRequest.data.email,
                        imageUrl: userDataRequest.data.profileImage
                    };

                    // stores user data to context & update isAuthenticated to true
                    dispatch(updateAuthState({ isAuthenticated: true, ...userData }));
                }

            } else {
                dispatch(updateAuthState({ isAuthenticated: false, name: undefined, email: undefined, imageUrl: undefined }));
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            // sets the isAuthenticated value to false
            dispatch(updateAuthState({ isAuthenticated: false, name: undefined, email: undefined, imageUrl: undefined }));

            toast.error("Something went wrong please try again."); // shows error message
        }

        setLoading(false);
    };

    useEffect(() => {
        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    } else {
        return (
            <>
                {authState.isAuthenticated == true ? <Outlet /> : <Navigate to={'/login'} />}
            </>
        );
    }
}
