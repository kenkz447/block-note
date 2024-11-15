import type { BlockSuiteFlags } from '@blocksuite/global/types';

import { AffineSchemas } from '@blocksuite/blocks';
import {
    DocCollection,
    type DocCollectionOptions,
    IdGeneratorType,
    Job,
    Schema,
    Text
} from '@blocksuite/store';
import {
    AwarenessSource,
    BroadcastChannelAwarenessSource,
    IndexedDBBlobSource,
} from '@blocksuite/sync';

import { WebSocketAwarenessSource } from '../source/WebSocketAwarenessSource';
import { env } from '@/config/env';
import { RxdbDocSource } from '../source/RxdbDocSource';
import { AppRxDatabase } from '@/libs/rxdb';

const BASE_WEBSOCKET_URL = new URL(env.sync.websocket);

export async function createDefaultDocCollection(db: AppRxDatabase, collectionId: string, syncEnable: boolean) {
    const idGenerator: IdGeneratorType = IdGeneratorType.NanoID;
    const schema = new Schema();
    schema.register(AffineSchemas);

    const params = new URLSearchParams(location.search);

    let docSources: DocCollectionOptions['docSources'] = {
        main: new RxdbDocSource(db)
    };

    let awarenessSources: AwarenessSource[] = [
        new BroadcastChannelAwarenessSource(collectionId),
    ];

    if (syncEnable) {
        const ws = new WebSocket(new URL(`roomId=${collectionId}`, BASE_WEBSOCKET_URL));
        await new Promise((resolve, reject) => {
            ws.addEventListener('open', resolve);
            ws.addEventListener('error', reject);
        })
            .then(() => {
                docSources = {
                    main: new RxdbDocSource(db)
                };
                awarenessSources = [new WebSocketAwarenessSource(ws)];
            })
            .catch(() => {
                console.warn('Failed to connect to WebSocket server');
            });
    }

    const flags: Partial<BlockSuiteFlags> = Object.fromEntries(
        [...params.entries()]
            .filter(([key]) => key.startsWith('enable_'))
            .map(([k, v]) => [k, v === 'true'])
    );

    const options: DocCollectionOptions = {
        id: `local:${collectionId}`,
        schema,
        idGenerator,
        blobSources: {
            main: new IndexedDBBlobSource(collectionId),
        },
        docSources,
        awarenessSources,
        defaultFlags: {
            enable_synced_doc_block: true,
            enable_pie_menu: true,
            enable_lasso_tool: true,
            enable_color_picker: true,
            ...flags,
        },
    };
    const collection = new DocCollection(options);
    collection.start();

    // debug info
    window.collection = collection;
    window.blockSchemas = AffineSchemas;
    window.job = new Job({ collection });
    window.Y = DocCollection.Y;

    return collection;
}

export async function initDefaultDocCollection(collection: DocCollection) {
    await collection.waitForSynced();

    const shouldInit = collection.docs.size === 0;
    if (shouldInit) {
        collection.meta.initialize();
        const doc = collection.createDoc({ id: 'local:default' });
        doc.load();
        const rootId = doc.addBlock('affine:page', {
            title: new Text(),
        });
        doc.addBlock('affine:surface', {}, rootId);
        doc.resetHistory();
        return;
    }

    // // wait for data injected from provider
    // const firstPageId =
    //     collection.docs.size > 0
    //         ? collection.docs.keys().next().value
    //         : await new Promise<string>(resolve =>
    //             collection.slots.docAdded.once(id => resolve(id))
    //         );
    // if (!firstPageId) {
    //     throw new Error('No first page id found');
    // }
    // const doc = collection.getDoc(firstPageId);
    // if (!doc) {
    //     throw new Error(`Failed to get doc ${firstPageId}`);
    // }
    // doc.load();
    // if (!doc.root) {
    //     await new Promise(resolve => doc.slots.rootAdded.once(resolve));
    // }
    // doc.resetHistory();
}
