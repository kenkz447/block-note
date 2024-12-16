import { memo } from 'react';
import { useForm } from 'react-hook-form';
import { SettingHeader } from '../_shared/SettingHeader';
import { useWorkspaces, Workspace } from '@writefy/client-shared';
import { Alert, AlertDescription, AlertTitle, Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Separator, usePopupAlert, usePopupDialog } from '@writefy/client-shadcn';
import { DeleteConfirm } from './DeleteConfirm';

interface WorkspaceGeneralSettingsProps {
    readonly workspace: Workspace;
}

export function WorkspaceGeneralSettingsImpl({ workspace }: WorkspaceGeneralSettingsProps) {
    const { update, remove } = useWorkspaces();

    const { closeDialog } = usePopupDialog();
    const { openAlert } = usePopupAlert();

    const defaultValues = {
        name: workspace.name
    };

    const form = useForm({
        defaultValues
    });

    const onSubmit = async (data: typeof defaultValues) => {
        await update(workspace.id, {
            name: data.name
        });

        form.reset(data, {
            keepValues: true
        });
    };

    const showDeleteAlert = () => {
        const onWorkspaceDelete = async () => {
            await remove(workspace.id);
            closeDialog();
        };
        openAlert({
            content: <DeleteConfirm confirmText="DELETE" onConfirm={onWorkspaceDelete} />
        });
    };

    const avatar = workspace.name[0].toUpperCase();

    return (
        <div>
            <SettingHeader
                title="General"
                description="Settings for your workspace"
            />
            <div className="flex flex-col gap-10">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="">
                        <div className="flex gap-4 items-end w-full">
                            <FormField
                                control={form.control}
                                name="name"
                                render={() => (
                                    <div className="bg-secondary flex items-center justify-center gap-4 size-16 rounded-lg ">
                                        <div className="text-primary/50 text-xl font-bold">{avatar}</div>
                                    </div>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="">
                                        <FormLabel className="text-primary/50">Workspace name</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value?.toString()} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                className="mt-0"
                                type="submit"
                                variant="secondary"
                                disabled={!form.formState.isValid || form.formState.isSubmitting || !form.formState.isDirty}
                            >
                                Save
                            </Button>
                        </div>
                    </form>
                </Form>
                <Separator />
                <div>
                    <div className="mb-2 text-primary/50">Danger zone</div>
                    <Alert className="cursor-pointer" onClick={showDeleteAlert}>
                        <AlertTitle className="text-destructive">Delete workspace</AlertTitle>
                        <AlertDescription className="text-destructive">
                            This action is irreversible. All data will be lost.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        </div>
    );
};

export const WorkspaceGeneralSettings = memo(WorkspaceGeneralSettingsImpl);
