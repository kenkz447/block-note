import { useEffect } from 'react';
import type { DocCollection } from '@blocksuite/store';
import { AppRxDatabase } from '@/libs/rxdb';
import { createDefaultDoc } from '@blocksuite/blocks';

interface RxdbSubscribeOptions {
    readonly db: AppRxDatabase;
    readonly docCollection: DocCollection;
}

export const useRxdbSubscribe = ({ db, docCollection }: RxdbSubscribeOptions) => {
    /**
     * Subscribe to the database and create a new document in
     * the editor collection when a new entry is created in the database
     */
    useEffect(() => {
        const entriesSubscribes = [
            // Create a new document in the editor collection when a new entry is created in the database
            db.collections.entries.insert$.subscribe((e) => {
                if (e.documentData.type === 'folder') {
                    return;
                }
                const isDocExists = docCollection.getDoc(e.documentId);
                if (isDocExists) {
                    return;
                }
                createDefaultDoc(docCollection, { id: e.documentId });
            }),
            db.collections.entries.remove$.subscribe((e) => {
                if (e.documentData.type === 'folder') {
                    return;
                }
                const isDocExists = docCollection.getDoc(e.documentId);
                if (!isDocExists) {
                    return;
                }
                docCollection.removeDoc(e.documentId);
            })
        ];

        return () => {
            entriesSubscribes.forEach((s) => s.unsubscribe());
        };
    }, [db, docCollection]);
};
