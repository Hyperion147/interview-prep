import { toast } from "sonner";

export async function adminRequest(
    input: RequestInfo | URL,
    init?: RequestInit,
) {
    const method = init?.method?.toUpperCase();
    if (!method || method === "GET") return fetch(input, init);
    const notice = toast.loading("Updating workspace…");
    try {
        const response = await fetch(input, init);
        if (!response.ok) {
            const body = await response
                .clone()
                .json()
                .catch(() => null);
            toast.error(
                typeof body?.error === "string"
                    ? body.error
                    : "Could not save changes.",
                { id: notice },
            );
        } else {
            toast.success(
                method === "DELETE" ? "Record removed" : "Changes saved",
                { id: notice },
            );
        }
        return response;
    } catch (error) {
        toast.error("Connection failed. Try again.", { id: notice });
        throw error;
    }
}
