import axios from "axios";

export const getAllTheData = async () => {
  const res = await axios.get(
    "https://ur5azskm3m.execute-api.us-east-1.amazonaws.com/get-all-reservations"
  );
  console.log({res})
  return res.data;
};
