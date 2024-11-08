const entry = {
    keyCompression: true,
    version: 0,
    title: 'entry',
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        name: {
            type: 'string'
        },
        type: {
            type: 'string'
        },
        parent: {
            type: 'string'
        },
        order: {
            type: 'number'
        },
        createdAt: {
            type: 'string',
            format: 'date-time'
        }
    },
    required: [
        'id',
        'name',
        'type',
        'order',
        'createdAt',
    ]
};

export const rxdbSchema = {
    entry
};