import { firestore } from "@/bootstraps/firebase";
import { useCurrentUser } from "@/libs/auth";
import { useRxdbContext } from "@/libs/rxdb/hooks/rxdb-use-context";
import { collection } from "firebase/firestore";
import { useCallback } from "react";
import { replicateFirestore } from "rxdb/plugins/replication-firestore";

const projectId = firestore.app.options.projectId!;

export const useRxSync = () => {
  const { currentUser } = useCurrentUser();
  const { db } = useRxdbContext();
  const { entries: entriesCollection } = db;

  return useCallback(async () => {

    const entryCollectionF = collection(firestore, 'workspaces', currentUser!.uid, 'entries');
    // const pullQuery = query(entryCollectionF);
    // const lastChangeQuery = query(pullQuery, orderBy('serverTimestamp', "desc"), limit(1));
    // onSnapshot(lastChangeQuery, (snapshot) => {
    //   console.log(snapshot.docs[0].data());
    // });

    replicateFirestore(
      {
        replicationIdentifier: `https://firestore.googleapis.com/${projectId}`,
        collection: entriesCollection,
        firestore: {
          projectId: projectId,
          database: firestore,
          collection: entryCollectionF
        },
        pull: {},
        push: {},
        live: true,
        serverTimestampField: 'serverTimestamp'
      }
    )
  }, [currentUser, entriesCollection]);
};
