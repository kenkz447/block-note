import { firestore } from "@/bootstraps/firebase";
import { useCurrentUser } from "@/libs/auth";
import { useRxdbContext } from "@/libs/rxdb/hooks/useRxdbContext";
import { collection } from "firebase/firestore";
import { useCallback } from "react";
import { replicateFirestore } from "rxdb/plugins/replication-firestore";

const projectId = firestore.app.options.projectId!;

export const useRxSync = () => {
  const { currentUser } = useCurrentUser();
  const { db } = useRxdbContext();
  const { entries: entriesCollection } = db;

  return useCallback(async () => {
    replicateFirestore(
      {
        replicationIdentifier: projectId,
        collection: entriesCollection,
        firestore: {
          projectId: projectId,
          database: firestore,
          collection: collection(firestore, 'workspaces', currentUser!.uid, 'entries')
        },
        pull: {},
        push: {},
        live: true,
        serverTimestampField: 'serverTimestamp'
      }
    )
  }, [currentUser, entriesCollection]);
};