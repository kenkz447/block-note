import type { BlockSuiteFlags } from '@blocksuite/global/types';

import { AffineSchemas, createDefaultDoc } from '@blocksuite/blocks';
import {
    DocCollection,
    type DocCollectionOptions,
    IdGeneratorType,
    Schema
} from '@blocksuite/store';
import {
    AwarenessSource,
    BroadcastChannelAwarenessSource,
    IndexedDBBlobSource,
} from '@blocksuite/sync';

import { RxdbRemoteDocSource } from '../source/RxdbRemoteDocSource';
import { AppRxDatabase } from '@writefy/client-shared';
import { RxdbLocalDocSource } from '../source/RxdbLocalDocSource';

interface CreateDefaultDocCollection {
    readonly db: AppRxDatabase;
    readonly collectionId: string;
    readonly enableSync: boolean;
    readonly messageChannel: string;
}

export async function createDefaultDocCollection({ db, collectionId, enableSync, messageChannel }: CreateDefaultDocCollection) {
    const idGenerator: IdGeneratorType = IdGeneratorType.NanoID;
    const schema = new Schema();
    schema.register(AffineSchemas);

    const params = new URLSearchParams(location.search);

    const docSources: DocCollectionOptions['docSources'] = {
        main: enableSync ? new RxdbRemoteDocSource(db, messageChannel) : new RxdbLocalDocSource(db),
    };

    const awarenessSources: AwarenessSource[] = [
        new BroadcastChannelAwarenessSource(collectionId),
    ];

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
            enable_edgeless_text: true,
            enable_color_picker: true,
            enable_mind_map_import: true,
            enable_advanced_block_visibility: true,
            enable_shape_shadow_blur: false,
            enable_new_dnd: false,
            ...flags,
        },
    };
    const collection = new DocCollection(options);
    collection.start();

    return collection;
}

export async function initDefaultDocCollection(collection: DocCollection, defaultDocId: string) {
    await collection.waitForSynced();

    const shouldInit = collection.docs.size === 0;
    if (shouldInit) {
        collection.meta.initialize();
        createDefaultDoc(collection, {
            id: defaultDocId
        });
    }
}
