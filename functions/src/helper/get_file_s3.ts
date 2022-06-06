/* eslint-disable space-before-function-paren */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable require-jsdoc */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import awsCloudFront from "aws-cloudfront-sign";
import {
  CLOUDFRONT_ACCESS_KEY_ID,
  CLOUDFRONT_PRIVATE_KEY_PATH,
  CLOUDFRONT_URL,
} from "../secrets";

export function getFileLink(filename: string): Promise<any> {
  return new Promise(function (resolve, _reject) {
    const options = {
      keypairId: CLOUDFRONT_ACCESS_KEY_ID,
      privateKeyPath: CLOUDFRONT_PRIVATE_KEY_PATH,
    };
    const signedUrl = awsCloudFront.getSignedUrl(
      CLOUDFRONT_URL + filename,
      options
    );
    resolve(signedUrl);
  });
}
