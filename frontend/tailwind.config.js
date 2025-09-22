module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}'
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'dark-900': '#05060a',
                'dark-800': '#0b0d11',
                'dark-700': '#0f1114',
                'accent': '#ffffff', // primary CTA will be white like Linear
                'accent-2': '#06b6d4',
                'muted': '#8b93a3'
            },
            animation: {
                'float': 'float 6s ease-in-out infinite'
            },
            keyframes: {
                float: {
                    '0%,100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-8px)' }
                }
            }
        },
    },
    plugins: [],
}
