import { create } from 'zustand'

export const useStore = create((set) => ({
    // theme
    // keep a stable default on server and client to avoid hydration mismatch
    dark: false,
    // setDark accepts either a boolean or an updater function (prev => next)
    setDark: (v) => {
        if (typeof v === 'function') {
            set((s) => {
                const next = !!v(s.dark)
                try { if (typeof window !== 'undefined') localStorage.setItem('mylms:dark', next ? '1' : '0') } catch (e) { }
                return { dark: next }
            });
        } else {
            const next = !!v
            try { if (typeof window !== 'undefined') localStorage.setItem('mylms:dark', next ? '1' : '0') } catch (e) { }
            set(() => ({ dark: next }));
        }
    },

    // optional: hydrate dark from localStorage on client
    initDark: () => {
        if (typeof window === 'undefined') return
        try {
            const saved = localStorage.getItem('mylms:dark')
            if (saved !== null) set(() => ({ dark: saved === '1' }))
        } catch (e) { }
    },

    // search
    query: '',
    setQuery: (q) => set(() => ({ query: q })),

    // authenticated user (client-only, hydrated from token)
    user: null,
    userLoading: true, // true initially, set to false after auth check
    setUser: (u) => set(() => ({ user: u })),
    setUserLoading: (loading) => set(() => ({ userLoading: loading })),

    // toast helpers (light wrapper that will call react-hot-toast from components)
    // We store a small queue for programs that prefer reading store; primarily use showToast()
    toasts: [],
    addToast: (t) => set((s) => ({ toasts: [...s.toasts, t] })),
    removeToast: (id) => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })),
    showToast: (msg, opts = {}) => {
        // convenience method; components can still import react-hot-toast directly
        try {
            // push a lightweight record into store (useful for debugging)
            const id = Date.now() + Math.random().toString(36).slice(2, 7)
            set((s) => ({ toasts: [...s.toasts, { id, msg, opts }] }))
            // auto remove after ttl if provided
            const ttl = opts.duration || 4000
            setTimeout(() => {
                try { useStore.getState().removeToast(id) } catch (e) { }
            }, ttl)
            return id
        } catch (e) { return null }
    },

    // controls whether the fullscreen search overlay is visible
    // default false so it does not open on page load
    searchVisible: false,
    toggleSearch: () => set((s) => ({ searchVisible: !s.searchVisible })),
    showSearch: () => set(() => ({ searchVisible: true })),
    hideSearch: () => set(() => ({ searchVisible: false })),

    // currency conversion
    currency: 'USD',
    currencySymbol: '$',
    rate: 1,
    currencyData: {
        'US': { currency: 'USD', symbol: '$' },
        'IN': { currency: 'INR', symbol: '₹' },
        'GB': { currency: 'GBP', symbol: '£' },
        'DE': { currency: 'EUR', symbol: '€' },
        'FR': { currency: 'EUR', symbol: '€' },
        'IT': { currency: 'EUR', symbol: '€' },
        'ES': { currency: 'EUR', symbol: '€' },
        'NL': { currency: 'EUR', symbol: '€' },
        'BE': { currency: 'EUR', symbol: '€' },
        'AT': { currency: 'EUR', symbol: '€' },
        'PT': { currency: 'EUR', symbol: '€' },
        'FI': { currency: 'EUR', symbol: '€' },
        'IE': { currency: 'EUR', symbol: '€' },
        'LU': { currency: 'EUR', symbol: '€' },
        'SK': { currency: 'EUR', symbol: '€' },
        'SI': { currency: 'EUR', symbol: '€' },
        'MT': { currency: 'EUR', symbol: '€' },
        'CY': { currency: 'EUR', symbol: '€' },
        'EE': { currency: 'EUR', symbol: '€' },
        'LV': { currency: 'EUR', symbol: '€' },
        'LT': { currency: 'EUR', symbol: '€' },
        'GR': { currency: 'EUR', symbol: '€' },
        'JP': { currency: 'JPY', symbol: '¥' },
        'CN': { currency: 'CNY', symbol: '¥' },
        'KR': { currency: 'KRW', symbol: '₩' },
        'AU': { currency: 'AUD', symbol: 'A$' },
        'CA': { currency: 'CAD', symbol: 'C$' },
        'MX': { currency: 'MXN', symbol: 'Mex$' },
        'BR': { currency: 'BRL', symbol: 'R$' },
        'AR': { currency: 'ARS', symbol: 'ARS$' },
        'ZA': { currency: 'ZAR', symbol: 'R' },
        'RU': { currency: 'RUB', symbol: '₽' },
        'TR': { currency: 'TRY', symbol: '₺' },
        'EG': { currency: 'EGP', symbol: 'E£' },
        'NG': { currency: 'NGN', symbol: '₦' },
        'KE': { currency: 'KES', symbol: 'KSh' },
        'GH': { currency: 'GHS', symbol: 'GH₵' },
        'MA': { currency: 'MAD', symbol: 'MAD' },
        'TN': { currency: 'TND', symbol: 'DT' },
        'AE': { currency: 'AED', symbol: 'AED' },
        'SA': { currency: 'SAR', symbol: 'SAR' },
        'QA': { currency: 'QAR', symbol: 'QAR' },
        'KW': { currency: 'KWD', symbol: 'KWD' },
        'BH': { currency: 'BHD', symbol: 'BHD' },
        'OM': { currency: 'OMR', symbol: 'OMR' },
        'YE': { currency: 'YER', symbol: 'YER' },
        'JO': { currency: 'JOD', symbol: 'JOD' },
        'LB': { currency: 'LBP', symbol: 'LBP' },
        'SY': { currency: 'SYP', symbol: 'SYP' },
        'IQ': { currency: 'IQD', symbol: 'IQD' },
        'IR': { currency: 'IRR', symbol: 'IRR' },
        'PK': { currency: 'PKR', symbol: '₨' },
        'BD': { currency: 'BDT', symbol: '৳' },
        'LK': { currency: 'LKR', symbol: 'Rs' },
        'NP': { currency: 'NPR', symbol: '₨' },
        'MM': { currency: 'MMK', symbol: 'K' },
        'TH': { currency: 'THB', symbol: '฿' },
        'VN': { currency: 'VND', symbol: '₫' },
        'MY': { currency: 'MYR', symbol: 'RM' },
        'SG': { currency: 'SGD', symbol: 'S$' },
        'ID': { currency: 'IDR', symbol: 'Rp' },
        'PH': { currency: 'PHP', symbol: '₱' },
        'HK': { currency: 'HKD', symbol: 'HK$' },
        'TW': { currency: 'TWD', symbol: 'NT$' },
        'NZ': { currency: 'NZD', symbol: 'NZ$' },
        'NO': { currency: 'NOK', symbol: 'kr' },
        'SE': { currency: 'SEK', symbol: 'kr' },
        'DK': { currency: 'DKK', symbol: 'kr' },
        'IS': { currency: 'ISK', symbol: 'kr' },
        'CH': { currency: 'CHF', symbol: 'CHF' },
        'PL': { currency: 'PLN', symbol: 'zł' },
        'CZ': { currency: 'CZK', symbol: 'Kč' },
        'HU': { currency: 'HUF', symbol: 'Ft' },
        'RO': { currency: 'RON', symbol: 'lei' },
        'BG': { currency: 'BGN', symbol: 'лв' },
        'HR': { currency: 'HRK', symbol: 'kn' },
        'RS': { currency: 'RSD', symbol: 'дин' },
        'BA': { currency: 'BAM', symbol: 'KM' },
        'ME': { currency: 'EUR', symbol: '€' },
        'MK': { currency: 'MKD', symbol: 'ден' },
        'AL': { currency: 'ALL', symbol: 'L' },
        'XK': { currency: 'EUR', symbol: '€' },
        // add more as needed
    },
    setCurrency: (c, r, s) => {
        set(() => ({ currency: c, rate: r, currencySymbol: s || '$' }));
    },
    convertPrice: (price) => {
        const state = useStore.getState();
        return Math.round(price * state.rate * 100) / 100; // round to 2 decimals
    },
    initCurrency: async () => {
        try {
            // Get user's country
            const geoRes = await fetch('https://ipapi.co/json/');
            const geoData = await geoRes.json();
            const countryCode = geoData.country_code;
            const data = useStore.getState().currencyData[countryCode];
            if (!data) return; // no mapping, default to USD

            // Get exchange rate
            const rateRes = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
            const rateData = await rateRes.json();
            const rate = rateData.rates[data.currency];
            if (rate) {
                set(() => ({ currency: data.currency, rate, currencySymbol: data.symbol }));
            }
        } catch (e) {
            console.error('Failed to init currency:', e);
        }
    },
}))
