/* eslint-disable @typescript-eslint/no-explicit-any */
import { onRequest } from "firebase-functions/v2/https";
import { handler } from "../helper/s3/file_upload_s3";
import { S3_BUCKET_NAME } from "../secrets";

exports.addMedia = onRequest(
  { timeoutSeconds: 3600, region: ["us-east1"] },
  async (req, res) => {
    const files = req.body.files;
    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: "No files found",
      });
      return;
    }

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        await handler({
          fileUrl: file.url,
          fileName: file.file_name,
          bucket: S3_BUCKET_NAME,
        });
      }

      res.status(200).json({
        success: true,
      });
    } catch (e) {
      console.log("Error uploading media>>>", e);
      res.status(500).json({
        success: false,
        message: "Could not get upload media",
      });
    }
  }
);
