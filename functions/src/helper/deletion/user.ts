import { auth, firestore } from "firebase-admin";

export const deleteAnonymousUser: (
  next_token?: string,
  results?: number
) => Promise<void> = async (next_token, results = 1000) => {
  const anonymousUsers: string[] = [];
  auth()
    .listUsers(results, next_token)
    .then(async (usersResult) => {
      for (let i = 0; i < usersResult?.users?.length; i++) {
        const record = usersResult?.users[i];

        if (record.providerData.length == 0) {
          // Check if user has any data
          const address = await firestore()
            .collection("addresses")
            .where("user", "==", record.uid)
            .get();

          const orders = await firestore()
            .collection("addresses")
            .where("user", "==", record.uid)
            .get();

          if (!(address?.docs?.length == 0) && !(orders?.docs?.length == 0)) {
            anonymousUsers.push(record.uid);
          }
        }
      }

      auth()
        .deleteUsers(anonymousUsers)
        .then(async () => {
          if (usersResult?.pageToken) {
            await deleteAnonymousUser(usersResult?.pageToken, results);
          }
        });
    });

  return;
};
