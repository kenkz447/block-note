import { addRxPlugin, createRxDatabase, RxCollectionCreator } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';

import { RxDBUpdatePlugin } from 'rxdb/plugins/update';

import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBStatePlugin } from 'rxdb/plugins/state';
import { RxDBLocalDocumentsPlugin } from 'rxdb/plugins/local-documents';

addRxPlugin(RxDBStatePlugin);
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBDevModePlugin);
addRxPlugin(RxDBLocalDocumentsPlugin);

type CreatedCollections<TCollections> = {
    [key in keyof TCollections]: RxCollectionCreator<any>;
};

export const initRxdb = async <TCollections>(dbName: string, collections: CreatedCollections<TCollections>) => {
    const db = await createRxDatabase({
        name: dbName,
        storage: wrappedValidateAjvStorage({
            storage: getRxStorageDexie()
        }),
        eventReduce: true,
        localDocuments: true
    });

    await db.addCollections(collections);

    return db;
};
