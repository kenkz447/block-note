import type { BlockSuiteFlags } from '@blocksuite/global/types';

import { AffineSchemas } from '@blocksuite/blocks';
import {
    DocCollection,
    type DocCollectionOptions,
    IdGeneratorType,
    Schema,
    Text
} from '@blocksuite/store';
import {
    AwarenessSource,
    BroadcastChannelAwarenessSource,
    IndexedDBBlobSource,
} from '@blocksuite/sync';

import { RxdbDocSource } from '../source/RxdbDocSource';
import { AppRxDatabase } from '@writefy/client-shared';

export async function createDefaultDocCollection(db: AppRxDatabase, collectionId: string) {
    const idGenerator: IdGeneratorType = IdGeneratorType.NanoID;
    const schema = new Schema();
    schema.register(AffineSchemas);

    const params = new URLSearchParams(location.search);

    const docSources: DocCollectionOptions['docSources'] = {
        main: new RxdbDocSource(db)
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
}
