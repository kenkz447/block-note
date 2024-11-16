const workspaceSchema = {
    keyCompression: false,
    version: 0,
    title: 'workspace',
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
        createdAt: {
            type: 'string',
            format: 'date-time'
        }
    },
    required: [
        'id',
        'name'
    ]
};

const projectSchema = {
    keyCompression: false,
    version: 0,
    title: 'version',
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
        order: {
            type: 'number'
        }
    },
    required: [
        'id',
        'name',
        'order'
    ]
};

const entrySchema = {
    keyCompression: false,
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
            anyOf: [
                {
                    type: 'string'
                },
                {
                    type: 'null'
                }
            ]
        },
        order: {
            type: 'number'
        },
        updates: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    timestamp: {
                        type: 'number'
                    },
                    update: {
                        type: 'array',
                        items: {
                            type: 'number'
                        }
                    }
                }
            }
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

const local_docschema = {
    keyCompression: false,
    version: 0,
    title: 'doc',
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        updates: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    timestamp: {
                        type: 'number'
                    },
                    update: {
                        type: 'array',
                        items: {
                            type: 'number'
                        }
                    }
                }
            }
        }
    },
    required: [
        'id'
    ]
};

export const rxdbSchema = {
    entry: entrySchema,
    localDoc: local_docschema,
    project: projectSchema,
    workspace: workspaceSchema
};
