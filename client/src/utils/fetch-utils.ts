import isOnline from 'is-online';

interface RequestOptions {
    method: string;
    credentials: RequestCredentials;
    headers: {
        'Content-Type': string;

    };
    body?: string;
}

export const request = {
    baseURL: `${import.meta.env.VITE_API_URL}`,
    withCredentials: true,

    async makeRequest(url: string, options: RequestOptions): Promise<any> {
        const online = await isOnline();

        if (!online) {
            // Check if cached data is available
            const cachedResponse = await caches.match(`${this.baseURL}${url}`);

            if (cachedResponse) {
                const cachedData = await cachedResponse.json();
                return { data: cachedData, status: cachedResponse?.status };
            }

            return { message: "No internet connection" };
        }

        try {
            const res = await fetch(`${this.baseURL}${url}`, options);


            if (!res.ok) {
                const errorData = await res.json();

                return { message: errorData.message || "Request failed", status: res?.status };
            }

            try {
                // Try to parse response as JSON
                const responseData = await res.json();
                return { data: responseData, status: res?.status };
            } catch (jsonError) {
                // Handle cases where the response is not in JSON format
                return { message: "Invalid or empty response", status: res?.status };
            }
        } catch (fetchError) {
            return { message: "Something went wrong, Please try again!", status: 0 };
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
