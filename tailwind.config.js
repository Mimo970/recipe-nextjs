/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./components/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
};
// module.exports = {
//   darkMode: "class",
//   purge: {
//     enabled: true,
//     content: [
//       "./components/**/*.{js,ts,jsx,tsx}",
//       "./src/**/*.{js,ts,jsx,tsx}",
//     ],

//     options: {
//       safelist: ["dark"], //specific classes
//     },
//   },
//   theme: {
//     typography: (theme) => ({}),
//     extend: {
//       typography: (theme) => ({
//         dark: {
//           css: {
//             color: "white",
//           },
//         },
//       }),
//     },
//   },
//   variants: {
//     typography: ["dark"],
//   },
//   plugins: [require("@tailwindcss/typography")],
// };
