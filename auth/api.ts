const isDev = process.env.NODE_ENV === "development";
const config = {
  baseURL:isDev? "http://localhost:5000" : "https://mentalhealthtest.xyz"
};
export default config;