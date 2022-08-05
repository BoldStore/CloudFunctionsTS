/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2beta3 } from "@google-cloud/tasks";
import {
  GCP_LOCATION,
  GCP_PROJECT_NAME,
  MEDIA_URL,
  SERVICE_ACCOUNT_EMAIL,
} from "../secrets";

export const createMediaTask: (
  files: Array<{ file_name: string; url: string }>
) => Promise<any> = async (files) => {
  const client = new v2beta3.CloudTasksClient();

  const queueName = "media-queue";

  const parent = client.queuePath(
    GCP_PROJECT_NAME.toString(),
    GCP_LOCATION.toString(),
    queueName
  );

  // Create multiple tasks for more images
  const chunks = chunkArray(files, 50);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const payload = {
      files: chunk,
    };

    // Convert message to buffer.
    const convertedPayload = JSON.stringify(payload);
    const body = Buffer.from(convertedPayload).toString("base64");

    let url = "";

    url = MEDIA_URL;

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
      const [response] = await client.createTask(
        { parent, task },
        { timeout: 300 }
      );
      console.log(`Created task - Media - ${response.name}`);
      return response.name;
    } catch (error) {
      console.log("There was an error in creating media task");
      console.error(error);
      return error;
    }
  }
};

const chunkArray: (arr: any[], size: number) => any[] = (arr, size) =>
  arr.length > size
    ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
    : [arr];
