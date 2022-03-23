// @ts-ignore
import awsCloudFront from "aws-cloudfront-sign";

export function getFileLink(filename: string) {
  return new Promise(function (resolve, reject) {
    var options = {
      keypairId: process.env.CLOUDFRONT_ACCESS_KEY_ID,
      privateKeyPath: process.env.CLOUDFRONT_PRIVATE_KEY_PATH,
    };
    var signedUrl = awsCloudFront.getSignedUrl(
      process.env.CLOUDFRONT_URL + filename,
      options
    );
    resolve(signedUrl);
  });
}
