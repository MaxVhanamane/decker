type userData = {
    profile_picture_url: string,
    username: string
}

export const UserStore = {
    saveUser(userData: userData) {
        const safeUserData = {
            username: userData.username,
            profile_picture: userData.profile_picture_url,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem("wasPreviouslyLoggedIn", "true");
        localStorage.setItem('userInfo', JSON.stringify(safeUserData));
    },

    getUser() {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    },

    clearUser() {
        localStorage.removeItem('userInfo');
        localStorage.removeItem("wasPreviouslyLoggedIn");
    }
};
