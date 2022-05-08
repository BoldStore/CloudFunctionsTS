import { auth, https, Request, Response } from "firebase-functions/v1";
import { firestore as firestoredb } from "firebase-admin";
import { getInstaData } from "./helper/get_insta_data";
import { sendMail } from "./mails";
import { checkAuth } from "./helper/check_auth";
import { v2beta3 } from "@google-cloud/tasks";
import {
  GCP_PROJECT_NAME,
  SERVICE_ACCOUNT_EMAIL,
  CLOUD_TASK_TEST,
} from "./secrets";

// Check if auth is working
exports.newUser = auth.user().onCreate(async (user) => {
  const email: string = user.email!.toString();

  sendMail(
    email,
    "Welcome to Bold",
    "Welcome to Bold",
    "/templates/welcome_mail.html"
  );
});

// Send mail
exports.sendMail = https.onRequest(async (req: Request, res: Response) => {
  try {
    await sendMail(
      "jayeshsadhwani99@gmail.com",
      "Welcome to Bold",
      "Welcome to Bold",
      "/templates/welcome_mail.html"
    );

    res.status(200).json({
      success: true,
      message: "Mail sent",
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e,
    });
  }
});

// Check if user is logged in
exports.checkLogin = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const id = (await checkAuth(req, res))!;

    if (!id) {
      res.status(403).json({
        success: false,
        message: "Not logged in",
      });
      return;
    }

    const user = (await firestoredb().collection("users").doc(id).get()).data();

    res.status(200).json({
      success: true,
      user,
      id,
    });
  }
);

// Insta data check
exports.getInstaData = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const insta_username = req.body.insta_username!.toString();

    const data = await getInstaData(insta_username);

    if (!data) {
      res.status(400).json({
        success: false,
        message: "There was an error",
      });
    }

    res.status(200).json({
      success: true,
      insta_username,
      data,
    });
  }
);

// Cloud Task queues test
exports.queueTest = https.onRequest(
  async (req: Request, res: Response<any>) => {
    createTask();

    res.status(202).json({
      success: true,
    });
  }
);

const createTask = async () => {
  const client = new v2beta3.CloudTasksClient();
  const parent = client.queuePath(GCP_PROJECT_NAME, "us-central1", "queue1");

  const payload = "Hello, World!";

  const convertedPayload = JSON.stringify(payload);
  const body = Buffer.from(convertedPayload).toString("base64");

  const task: any = {
    httpRequest: {
      httpMethod: "POST",
      CLOUD_TASK_TEST,
      oidcToken: {
        serviceAccountEmail: SERVICE_ACCOUNT_EMAIL,
        audience: new URL(CLOUD_TASK_TEST).origin,
      },
      headers: {
        "Content-Type": "application/json",
      },
      body,
    },
  };

  const convertedDate = new Date(new Date());
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
  } catch (error) {
    // Construct error for Stackdriver Error Reporting
    console.log(error);
  }
};
