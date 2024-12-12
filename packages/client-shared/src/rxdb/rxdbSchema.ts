const sharedSchema = {
    properties: {
        id: {
            type: 'string',
            maxLength: 64
        },
        createdAt: {
            type: 'number'
        },
        createdBy: {
            type: 'string'
        },
    },
    required: [
        'id'
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
        },
        members: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string'
                    },
                    name: {
                        type: 'string'
                    },
                    role: {
                        type: 'string'
                    },
                    addedAt: {
                        type: 'string',
                        format: 'date-time'
                    },
                    addedBy: {
                        type: 'string'
                    },
                },
                required: [
                    'id',
                    'name',
                    'role',
                    'addedAt',
                    'addedBy'
                ]
            }
        }
    },
    required: [
        ...sharedSchema.required,
        'name',
        'owner',
        'activeMembers',
        'members'
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
    project: projectSchema,
    workspace: workspaceSchema,
    // local
    localDoc: localDocSchema
};
