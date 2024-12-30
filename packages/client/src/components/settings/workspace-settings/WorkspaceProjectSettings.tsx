import { memo } from 'react';
import { useForm } from 'react-hook-form';
import { SettingHeader } from '../@shared/SettingHeader';
import { Project, useProjects } from '@writefy/client-business';
import { Alert, AlertDescription, AlertTitle, Button, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input, Separator, usePopupAlert } from '@writefy/client-shadcn';
import { DeleteConfirm } from './DeleteConfirm';

interface WorkspaceProjectSettingsProps {
    readonly project: Project;
}

export function WorkspaceProjectSettingsImpl({ project }: WorkspaceProjectSettingsProps) {
    const { update, remove } = useProjects({
        workspaceId: project.workspaceId
    });

    const { openAlert } = usePopupAlert();

    const defaultValues = {
        name: project.name
    };

    const form = useForm({
        defaultValues
    });

    const onSubmit = async (data: typeof defaultValues) => {
        await update(project.id, {
            name: data.name
        });

        form.reset(data, {
            keepValues: true
        });
    };

    const showDeleteAlert = () => {
        const onDelete = async () => {
            await remove(project.id);
        };
        openAlert({
            content: <DeleteConfirm confirmText="DELETE" onConfirm={onDelete} />
        });
    };

    return (
        <div>
            <SettingHeader
                title={project.name}
                description="Project settings"
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
                        <AlertTitle className="text-destructive">Delete this project</AlertTitle>
                        <AlertDescription className="text-destructive">
                            This action is irreversible. All data will be lost.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        </div>
    );
};

export const WorkspaceProjectSettings = memo(WorkspaceProjectSettingsImpl);
