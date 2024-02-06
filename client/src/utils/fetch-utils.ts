import { CustomError } from "./customError";

interface RequestOptions {
    method: string;
    credentials: RequestCredentials;
    headers: {
        'Content-Type': string;

    };
    body?: string;
}



const checkIsUserOnline = async () => {
    let online = false;
    // First, make a request to '${import.meta.env.VITE_API_URL}/ping' and check if it returns a response. We will add a timeout to ensure it doesn't hang for an extended period. If it gets aborted or encounters another error, proceed to make another request to a different API and repeat the same process. Based on the response and errors, we will set the online status and return that status.
    try {
        const response1 = await callAPI(`${import.meta.env.VITE_API_URL}/ping`, 15000);
        if (response1.ok) {
            online = true;
        } else {
            throw new Error(`Request 1 failed with status: ${response1.status}`);
        }
    } catch (error1) {

        try {
            const response2 = await callAPI("https://jsonplaceholder.typicode.com/todos/1", 15000);
            if (response2.ok) {
                online = true;
            } else {
                throw new Error(`Request 2 failed with status: ${response2.status}`);
            }
        } catch (error2) {
            online = false;
        }
    }

    return online;
};

const callAPI = async (url: string, timeout: number) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { signal: controller.signal, headers: { 'Cache-Control': 'no-cache' }, method: "GET" });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};




export const request = {
    baseURL: `${import.meta.env.VITE_API_URL}`,
    withCredentials: true,

    async makeRequest(url: string, options: RequestOptions): Promise<any> {

        try {
            // A timeout refers to the maximum amount of time that a client (the requester) is willing to wait for a server to respond to a request.


            const online = await checkIsUserOnline()

            if (!online) {
                // Check if cached data is available
                const cachedResponse = await caches.match(`${this.baseURL}${url}`);
                if (cachedResponse) {

                    const cachedData = await cachedResponse.json();
                    return { data: cachedData, status: cachedResponse?.status };
                }

                throw new CustomError("No internet connection", 0);

            }





            const res = await fetch(`${this.baseURL}${url}`, options);


            //In the fetch API, the res.ok property becomes false when the HTTP response status is not within the range of 200 to 299 (inclusive). This means that res.ok will be false for any HTTP status code that indicates an error or a problem with the request.
            if (!res.ok) {
                const errorData = await res.json();
                throw new CustomError(errorData?.message || "Request failed! Please try refreshing the page. If the issue persists, try again later.", res.status)
            }

            // Try to parse response as JSON
            const responseData = await res.json();
            return { data: responseData, status: res?.status };

        } catch (fetchError) {
            // This if block catches errors that may occur while parsing the JSON response.
            if (fetchError instanceof SyntaxError) {
                throw new CustomError("An unexpected error occurred. Please try refreshing the page or try again later.", 500);
            }

            if ((fetchError as CustomError).message === "Failed to fetch") {
                throw new CustomError("No internet connection", 0)
            }

            throw new CustomError((fetchError as CustomError).message || "Request failed! Please try refreshing the page. If the issue persists, try again later.", (fetchError as CustomError)?.statusCode)
        }
    }
    ,

    async get(url: string) {
        const options: RequestOptions = {
            method: 'GET',
            credentials: this.withCredentials ? 'include' : 'same-origin',
            headers: {
                'Content-Type': 'application/json',

            },
        };
        return this.makeRequest(url, options);
    },

    async post(url: string, payload?: object) {
        const options: RequestOptions = {
            method: 'POST',
            credentials: this.withCredentials ? 'include' : 'same-origin',
            headers: {
                'Content-Type': 'application/json',

            },
            body: JSON.stringify(payload),
        };
        return this.makeRequest(url, options);
    },

    async put(url: string, payload?: object) {
        const options: RequestOptions = {
            method: 'PUT',
            credentials: this.withCredentials ? 'include' : 'same-origin',
            headers: {
                'Content-Type': 'application/json',

            },
            body: JSON.stringify(payload),
        };
        return this.makeRequest(url, options);
    },
    async patch(url: string, payload?: object) {
        const options: RequestOptions = {
            method: 'PATCH',
            credentials: this.withCredentials ? 'include' : 'same-origin',
            headers: {
                'Content-Type': 'application/json',

            },
            body: JSON.stringify(payload),
        };
        return this.makeRequest(url, options);
    },


    async delete(url: string) {
        const options: RequestOptions = {
            method: 'DELETE',
            credentials: this.withCredentials ? 'include' : 'same-origin',
            headers: {
                'Content-Type': 'application/json',

            },
        };
        return this.makeRequest(url, options);
    },
};
