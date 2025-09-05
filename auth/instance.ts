import axios from "axios"
import config from "./api";
 const instance=axios.create({baseURL:config.baseURL})
 export default instance;