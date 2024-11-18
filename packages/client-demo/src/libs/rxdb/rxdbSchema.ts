const sharedSchema = {
    properties: {
        id: {
            type: 'string',
            maxLength: 64
        },
        createdAt: {
            type: 'string',
            format: 'date-time'
        },
        createdBy: {
            type: 'string'
        },
    },
    required: [
        'id',
        'createdAt',
        'createdBy'
    ]
};

const workspaceSchema = {
    keyCompression: false,
    version: 0,
    title: 'workspace',
    primaryKey: 'id',
    type: 'object',
    properties: {
        ...sharedSchema.properties,
        name: {
            type: 'string'
        },
        createdBy: {
            type: 'string'
        },
        owner: {
            type: 'string'
        },
        activeMembers: {
            type: 'array',
            items: {
                type: 'string'
            }
        }
    },
    required: [
        ...sharedSchema.required,
        'name',
        'owner',
        'activeMembers'
    ]
};

const projectSchema = {
    keyCompression: false,
    version: 0,
    title: 'version',
    primaryKey: 'id',
    type: 'object',
    properties: {
        ...sharedSchema.properties,
        name: {
            type: 'string'
        },
        order: {
            type: 'number'
        },
        workspaceId: {
            type: 'string'
        }
    },
    required: [
        ...sharedSchema.required,
        'name',
        'order',
        'workspaceId'
    ]
};

const entrySchema = {
    keyCompression: false,
    version: 0,
    title: 'entry',
    primaryKey: 'id',
    type: 'object',
    properties: {
        ...sharedSchema.properties,
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
        workspaceId: {
            type: 'string'
        },
        projectId: {
            type: 'string'
        },
    },
    required: [
        ...sharedSchema.required,
        'name',
        'type',
        'order',
        'workspaceId',
        'projectId',
    ]
};

const localDocSchema = {
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
    localDoc: localDocSchema,
    project: projectSchema,
    workspace: workspaceSchema
};
