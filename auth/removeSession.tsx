"use server";

import { cookies } from "next/headers";

const removeSession = async (): Promise<boolean> => {
    const cookieStore = await cookies(); // ✅ Await the cookies() function

    const sessionStatus = cookieStore.get("token");
    
    if (sessionStatus) {
        cookieStore.set("token", "", {
            path: "/",
            expires: new Date(0) // ✅ Expire the cookie to delete it
        });
        return true; // ✅ Cookie removed successfully
    } else {
        return false; // ❌ No cookie found
    }
};

export default removeSession;
