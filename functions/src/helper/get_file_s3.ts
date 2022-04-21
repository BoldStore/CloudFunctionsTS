// @ts-ignore
import awsCloudFront from "aws-cloudfront-sign";
import {
  CLOUDFRONT_ACCESS_KEY_ID,
  CLOUDFRONT_PRIVATE_KEY_PATH,
  CLOUDFRONT_URL,
} from "../secrets";

export function getFileLink(filename: string) {
  return new Promise(function (resolve, reject) {
    var options = {
      keypairId: CLOUDFRONT_ACCESS_KEY_ID,
      privateKeyPath: CLOUDFRONT_PRIVATE_KEY_PATH,
    };
    var signedUrl = awsCloudFront.getSignedUrl(
      CLOUDFRONT_URL + filename,
      options
    );
    resolve(signedUrl);
  });
}
