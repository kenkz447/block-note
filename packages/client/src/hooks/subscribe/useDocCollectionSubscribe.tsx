import { useEntries } from '@/libs/rxdb';
import { DocCollection } from '@blocksuite/store';
import { useEffect } from 'react';

interface RxdbSubscribeOptions {
    readonly docCollection: DocCollection;
}

export const useDocCollectionSubscribe = ({ docCollection }: RxdbSubscribeOptions) => {
    const { insert, checkEntryExists } = useEntries();

    /**
     * Subscribe to the document collection
     * and insert the document entry if it doesn't exist
     */
    useEffect(() => {
        const disposable = docCollection.slots.docAdded.on(async (docId) => {
            const isEntryExists = await checkEntryExists(docId);
            if (isEntryExists) {
                return;
            }

            insert({
                id: docId,
                type: 'document',
                parent: null,
            });
        });

        return () => {
            disposable.dispose();
        };
    }, [checkEntryExists, docCollection, insert]);
};
