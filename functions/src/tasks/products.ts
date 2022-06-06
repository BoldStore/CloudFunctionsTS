/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2beta3 } from "@google-cloud/tasks";
import {
  GCP_LOCATION,
  GCP_PROJECT_NAME,
  PRODUCT_DATA_URL,
  SERVICE_ACCOUNT_EMAIL,
} from "../secrets";

export const createProductTask: (
  posts: Array<any>,
  storeId: string
) => Promise<any> = async (posts = [], storeId) => {
  const client = new v2beta3.CloudTasksClient();

  const queueName = "product-queue";

  const parent = client.queuePath(
    GCP_PROJECT_NAME.toString(),
    GCP_LOCATION.toString(),
    queueName
  );

  const payload = {
    posts,
  };

  // Convert message to buffer.
  const convertedPayload = JSON.stringify(payload);
  const body = Buffer.from(convertedPayload).toString("base64");

  let url = "";

  url = PRODUCT_DATA_URL.toString() + "?storeId=" + storeId;

  const task: any = {
    httpRequest: {
      httpMethod: "post",
      url,
      oidcToken: {
        serviceAccountEmail: SERVICE_ACCOUNT_EMAIL.toString(),
        audience: new URL(url).origin,
      },
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    },
  };

  const date = new Date();
  const convertedDate = new Date(date);
  const currentDate = new Date();

  if (convertedDate < currentDate) {
    console.error("Scheduled date in the past.");
  } else if (convertedDate > currentDate) {
    const date_diff_in_seconds =
      (convertedDate.valueOf() - currentDate.valueOf()) / 1000;
    const date_in_seconds = date_diff_in_seconds + Date.now() / 1000;
    task.scheduleTime = {
      seconds: date_in_seconds,
    };
  }

  try {
    const [response] = await client.createTask({ parent, task });
    console.log(`Created task ${response.name}`);
    return response.name;
  } catch (error) {
    console.log("There was an error");
    console.error(error);
    return error;
  }
};
