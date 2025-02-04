import { DocTree } from '@/components/docs-tree/DocTree';
import { CreateEntryForm, CreateEntryValues } from '@/components/forms/entry/CreateEntryForm';
import { Input, usePopupDialog } from '@writefy/client-shadcn';
import { Entry, InsertEntryParams, useEntries, useEventListener } from '@writefy/client-shared';
import { useCallback, useContext, useState } from 'react';
import { AppSidebarContext } from './AppSidebarContext';
import { useParams } from '@tanstack/react-router';
import { UpdateEntryForm, UpdateEntryValues } from '@/components/forms/entry/UpdateEntryForm';
import { events } from '@/config/events';

export function AppSidebarBody() {
    const context = useContext(AppSidebarContext)!;
    const { activeProject, entries, activeEntry } = context;

    const { projectId, workspaceId } = useParams({
        from: '/app/editor/$workspaceId/$projectId'
    });

    const { openDialog, closeDialog } = usePopupDialog();
    const { insert, update: updateEntry, remove: removeEntry } = useEntries({
        workspaceId,
        projectId
    });

    const [search, setSearch] = useState<string>('');

    const showCreateEntryForm = useCallback((type: string, parentId?: string | null) => {
        const createEntry = async (formValues: CreateEntryValues) => {
            await insert({
                type: type,
                parent: parentId ?? null,
                name: formValues.name
            } as InsertEntryParams);

            closeDialog();
        };

        openDialog({
            content: <CreateEntryForm type={type} onSubmit={createEntry} />
        });
    }, [insert, openDialog, closeDialog]);

    const showUpdateEntryForm = useCallback(async (entry: Entry) => {
        openDialog({
            content: (
                <UpdateEntryForm
                    entry={entry}
                    onSubmit={async (formValues: UpdateEntryValues) => {
                        await updateEntry(entry.id, formValues);
                        closeDialog();
                    }}
                />
            )
        });
    }, [closeDialog, openDialog, updateEntry]);

    const onSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.currentTarget.value);
    }, []);

    useEventListener({
        event: events.ui.entryForm.show,
        handler: useCallback((e?: Partial<Entry>) => {
            if (!e) {
                return;
            }

            showCreateEntryForm(e.type!, e.parent);
        }, [showCreateEntryForm])
    });

    return (
        <div className="grow">
            {
                activeProject && (
                    <div className="flex gap-2 px-2 my-2">
                        <Input
                            value={search}
                            placeholder="Search"
                            onChange={onSearchChange}
                        />
                    </div>
                )
            }
            {
                (activeProject) && (
                    <div className="px-2">
                        <DocTree
                            search={search}
                            activeEntry={activeEntry}
                            entries={entries}
                            showCreateEntryForm={showCreateEntryForm}
                            showUpdateEntryForm={showUpdateEntryForm}
                            updateEntry={updateEntry}
                            removeEntry={removeEntry}
                        />
                    </div>
                )
            }
        </div>
    );
};


