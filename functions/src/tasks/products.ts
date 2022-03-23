import { v2beta3 } from "@google-cloud/tasks";

export const createProductTask = async (
  posts: Array<any> = [],
  storeId: string
) => {
  const client = new v2beta3.CloudTasksClient();

  const queueName = "product-queue-" + storeId;

  const parent = client.queuePath(
    process.env.GCP_PROJECT_NAME!.toString(),
    process.env.GCP_LOCATION!.toString(),
    queueName
  );

  const payload = {
    posts,
  };

  // Convert message to buffer.
  const convertedPayload = JSON.stringify(payload);
  const body = Buffer.from(convertedPayload).toString("base64");

  const url = process.env.PRODUCT_DATA_URL!.toString() + "?storeId=" + storeId;

  const task: any = {
    httpRequest: {
      httpMethod: "POST",
      url,
      oidcToken: {
        serviceAccountEmail: process.env.SERVICE_ACCOUNT_EMAIL!.toString(),
        audience: new URL(url).origin,
      },
      headers: {
        "Content-Type": "application/json",
      },
      body,
    },
  };

  const date = new Date();
  const convertedDate = new Date(date);
  const currentDate = new Date();

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
    const [response] = await client.createTask({ parent, task });
    console.log(`Created task ${response.name}`);
    return response.name;
  } catch (error: any) {
    // Construct error for Stackdriver Error Reporting
    console.error(Error(error.message));
    return error;
  }
};
