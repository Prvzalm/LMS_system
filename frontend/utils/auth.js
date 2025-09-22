// Centralized token helpers and fetch wrapper
export function getToken() {
    try {
        if (typeof window === 'undefined') return null
        return localStorage.getItem('token')
    } catch (e) { return null }
}

export function setToken(token) {
    try {
        if (typeof window === 'undefined') return
        localStorage.setItem('token', token)
    } catch (e) { }
}

export function removeToken() {
    try {
        if (typeof window === 'undefined') return
        localStorage.removeItem('token')
    } catch (e) { }
}

export async function authFetch(url, opts = {}) {
    const token = getToken()
    const headers = opts.headers || {}
    if (token) headers['Authorization'] = 'Bearer ' + token
    const res = await fetch(url, { ...opts, headers })
    return res
}

export default { getToken, setToken, removeToken, authFetch }
