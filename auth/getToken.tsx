"use server";

import { cookies } from "next/headers";

const getToken = async () => {
    try {
        
    
    const cookieStore = await cookies(); // Correct usage
    const sessionStatus = await cookieStore.get("token");
    return sessionStatus ? sessionStatus.value : "";
} catch (error) {
    console.log({error})
        return null
}
};

export default getToken;
