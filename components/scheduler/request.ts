import axios from "axios";

export const getAllTheData = async () => {
  const res = await axios.get(
    "https://ur5azskm3m.execute-api.us-east-1.amazonaws.com/get-all-reservations"
  );
  return res.data;
};

export const getAllTheCleanersAndJobs = async () => {
  const res = await axios.get(
    "https://ur5azskm3m.execute-api.us-east-1.amazonaws.com/send-cleaners-job-to-frontend"
  );
  console.log({ res });
  return res.data;
};
