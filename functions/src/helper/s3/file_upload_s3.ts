import { S3 } from "aws-sdk";
import axios, { AxiosResponse } from "axios";
import { Stream, PassThrough } from "stream";
import s3 from "../../s3";

interface CopyFileEvent {
  fileUrl: string;
  fileName: string;
  bucket?: string; // Destination S3 bucket.
}

interface DeleteObjectParam {
  bucket: string;
  fileName: string;
}

const uploadFromStream = (
  fileResponse: AxiosResponse,
  fileName: string,
  bucket: string
): {
  passThrough: PassThrough;
  promise: Promise<S3.ManagedUpload.SendData>;
} => {
  const passThrough = new PassThrough();
  const promise = s3
    .upload({
      Bucket: bucket,
      Key: fileName,
      ContentType: fileResponse.headers["content-type"],
      ContentLength: parseInt(fileResponse.headers["content-length"]),
      Body: passThrough,
    })
    .promise();
  return { passThrough, promise };
};

const downloadFile = async (
  fileUrl: string
): Promise<AxiosResponse<Stream>> => {
  return axios.get(fileUrl, {
    responseType: "stream",
  });
};

// Returns the location of file
export const handler = async (event: CopyFileEvent): Promise<string> => {
  const responseStream = await downloadFile(event.fileUrl);

  const { passThrough, promise } = uploadFromStream(
    responseStream,
    event.fileName,
    event.bucket || "test-bucket"
  );

  responseStream.data.pipe(passThrough);

  return promise
    .then((result) => {
      return result.Location;
    })
    .catch((e) => {
      throw e;
    });
};

export const deleteObject: (
  params: DeleteObjectParam
) => Promise<void> = async (params) => {
  s3.deleteObject(
    { Bucket: params.bucket, Key: params.fileName },
    (err, data) => {
      if (err) {
        console.log(err, err.stack);
        return;
      } else {
        console.log(data);
        return;
      }
    }
  );
  return;
};
