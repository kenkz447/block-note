import { memo } from 'react';
import { useForm } from 'react-hook-form';
import { SettingHeader } from '../_shared/SettingHeader';
import { useWorkspaces, Workspace } from '@writefy/client-shared';
import { Alert, AlertDescription, AlertTitle, Button, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input, Separator, usePopupAlert } from '@writefy/client-shadcn';

interface WorkspaceGeneralSettingsProps {
    readonly workspace: Workspace;
}

export function WorkspaceGeneralSettingsImpl({ workspace }: WorkspaceGeneralSettingsProps) {
    const { update } = useWorkspaces();

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
        openAlert({

            content: (<div>abc</div>)
        });
    };

    return (
        <div>
            <SettingHeader
                title="General"
                description="Settings for your workspace"
            />
            <div className="flex flex-col gap-10">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-4">
                                    <div className="grow">
                                        <FormLabel>Name</FormLabel>
                                        <FormDescription>
                                            Should short and memorable
                                        </FormDescription>
                                    </div>
                                    <FormControl className="max-w-[250px]" >
                                        <Input {...field} value={field.value?.toString()} />
                                    </FormControl>
                                    <FormMessage />
                                    <FormDescription>
                                        <Button
                                            type="submit"
                                            variant="secondary"
                                            disabled={!form.formState.isValid || form.formState.isSubmitting || !form.formState.isDirty}
                                        >
                                            Save
                                        </Button>
                                    </FormDescription>
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <Separator />
                <div>
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
