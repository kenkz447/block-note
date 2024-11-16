import { useEffect } from 'react';
import type { DocCollection } from '@blocksuite/store';
import { AppRxDatabase } from '@/libs/rxdb';

export function createDefaultDoc(
    collection: DocCollection,
    options: { id?: string; title?: string; } = {}
) {
    const doc = collection.createDoc({ id: options.id });

    doc.load();
    const title = options.title ?? '';
    const rootId = doc.addBlock('affine:page', {
        title: new doc.Text(title)
    });
    collection.setDocMeta(doc.id, {
        title,
    });

    doc.addBlock('affine:surface', {}, rootId);

    //@ts-expect-error should be fixed in the future
    const noteId = doc.addBlock('affine:note', {
        displayDocInfo: true
    }, rootId);

    doc.addBlock('affine:paragraph', {}, noteId);

    // To make sure the content of new doc would not be clear
    // By undo operation for the first time
    doc.resetHistory();

    return doc;
}


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
