import { ReactNode, createContext, useState } from "react";

interface PictureContextType {
    userProfilePicture: string;
    setUserProfilePicture: (url: string) => void;
}

export const PictureContext = createContext<PictureContextType | undefined>(undefined);

export const PictureProvider = ({ children }: { children: ReactNode }) => {
    const [userProfilePicture, setUserProfilePicture] = useState("");

    return (
        <PictureContext.Provider value={{ userProfilePicture, setUserProfilePicture }}>
            {children}
        </PictureContext.Provider>
    );
};