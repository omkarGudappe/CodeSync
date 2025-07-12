import {useState , createContext , useContext} from 'react'

const SignInContext = createContext();

export const useSignIn = () => useContext(SignInContext);

export const SignInProvider = ({ children }) => {
    const [SignInG, setSignInG] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [authSuccess , setAuthSuccess] = useState(null);
    const [userRoom, setUsersRooms] = useState([]);
    

    return(
        <SignInContext.Provider value={{SignInG , setSignInG , authError , setAuthError , authSuccess , setAuthSuccess , userRoom, setUsersRooms}} >
            {children}
        </SignInContext.Provider>
    )
}