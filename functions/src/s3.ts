import { S3 } from "aws-sdk";
import { S3_ACCESS_ID, S3_REGION, S3_SECRET_KEY } from "./secrets";

const s3 = new S3({
  accessKeyId: S3_ACCESS_ID,
  secretAccessKey: S3_SECRET_KEY,
  region: S3_REGION,
});

export default s3;
