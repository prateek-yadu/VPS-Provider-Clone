import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateAuthState } from "../../app/features/auth/AuthHandler";

export default function AuthProvider({ children }: { children: React.ReactNode; }) {

  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // checks if token is vailed or not 
        const response = await (await fetch("/api/v1/auth/validate", {
          method: "POST"
        })).json();

        if (response.status === 200) {
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
        } else {
          dispatch(updateAuthState({ isAuthenticated: false, name: undefined, email: undefined, imageUrl: undefined }));
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // sets the isAuthenticated value to false
        dispatch(updateAuthState({ isAuthenticated: false, name: undefined, email: undefined, imageUrl: undefined }));
      }
    };

    initAuth();
  }, [dispatch]);

  return <>{children}</>;
}
