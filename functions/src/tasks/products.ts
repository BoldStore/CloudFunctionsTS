import { v2beta3 } from "@google-cloud/tasks";
// import { firestore } from "firebase-admin";
import {
  GCP_LOCATION,
  GCP_PROJECT_NAME,
  PRODUCT_DATA_URL,
  SERVICE_ACCOUNT_EMAIL,
} from "../secrets";

export const createProductTask = async (
  posts: Array<any> = [],
  storeId: string
) => {
  console.log("TASK START");
  const client = new v2beta3.CloudTasksClient();

  const queueName = "product-queue";

  const parent = client.queuePath(
    GCP_PROJECT_NAME!.toString(),
    GCP_LOCATION!.toString(),
    queueName
  );

  // const payload = {
  //   posts,
  // };

  // Convert message to buffer.
  // const convertedPayload = JSON.stringify(payload);
  // const body = Buffer.from(convertedPayload).toString("base64");

  // const store = await firestore().collection("stores").doc(storeId).get();

  let url = "";

  // if (!store.exists) {
  //   url = PRODUCT_DATA_URL!.toString() + "?storeId=" + storeId;
  // } else {
  // }
  url = PRODUCT_DATA_URL!.toString() + "?storeId=" + storeId;

  console.log("STORE URL", url);

  const task: any = {
    httpRequest: {
      httpMethod: "POST",
      url,
      oidcToken: {
        serviceAccountEmail: SERVICE_ACCOUNT_EMAIL!.toString(),
        audience: new URL(url).origin,
      },
      // headers: {
      //   "Content-Type": "application/json",
      // },
      posts,
    },
  };

  const date = new Date();
  const convertedDate = new Date(date);
  const currentDate = new Date();

  console.log("DATE", convertedDate);

  // Schedule time can not be in the past.
  if (convertedDate < currentDate) {
    console.error("Scheduled date in the past.");
  } else if (convertedDate > currentDate) {
    const date_diff_in_seconds =
      (convertedDate.valueOf() - currentDate.valueOf()) / 1000;
    // Construct future date in Unix time.
    const date_in_seconds = date_diff_in_seconds + Date.now() / 1000;
    // Add schedule time to request in Unix time using Timestamp structure.
    // https://googleapis.dev/nodejs/tasks/latest/google.protobuf.html#.Timestamp
    task.scheduleTime = {
      seconds: date_in_seconds,
    };
  }

  try {
    // Send create task request.
    console.log("REQUESTTTTT");
    const [response] = await client.createTask({ parent, task });
    console.log(`Created task ${response.name}`);
    return response.name;
  } catch (error) {
    // Construct error for Stackdriver Error Reporting
    console.log("There was an error");
    console.error(error);
    return error;
  }
};
