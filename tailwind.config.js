/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            black: "#1E1E2F",
            notblack: "#27293d",
            "notblackLighter": "#383b54"
        },
    },
    plugins: [],
}
