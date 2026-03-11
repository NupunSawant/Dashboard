const TOKEN_KEY = 'accessToken';

const USER_KEY = 'authUser';

export const setToken = (token:string) => localStorage.setItem(TOKEN_KEY,token);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const setAuthUser = (user:unknown) => localStorage.setItem(USER_KEY, JSON.stringify(user));
export const getAuthUser = <T = any>(): T | null => {
    const raw = localStorage.getItem(USER_KEY);
    if(!raw) return null;
    try {
        return JSON.parse(raw) as T;
    } catch{
        return null;
    }
}
export const clearAuthUser = () => localStorage.removeItem(USER_KEY);