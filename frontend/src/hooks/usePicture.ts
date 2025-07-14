import { useContext } from "react";
import { PictureContext } from "../context/PictureContext";

const usePicture = () => {
    const context = useContext(PictureContext);
    if (context === undefined) {
        throw new Error("usePicture must be used within a PictureProvider");
    }
    return context;
};

export default usePicture;