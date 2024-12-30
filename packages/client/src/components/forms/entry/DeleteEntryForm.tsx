import { Entry } from '@writefy/client-business';
import { Button, Checkbox, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogContent, Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@writefy/client-shadcn';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface DeleteEntryValues {
    readonly confirm: boolean;
}

interface DeleteEntryConfirmFormProps {
    readonly entry: Entry;
    readonly onSubmit: () => void;
}

const schema = z.object({
    confirm: z.boolean().refine(value => value === true)
});

export function DeleteEntryForm({ entry, onSubmit }: DeleteEntryConfirmFormProps) {
    const {
        reset,
        formState,
        ...form
    } = useForm<DeleteEntryValues>({
        resolver: zodResolver(schema)
    });

    const description = entry.type === 'folder'
        ? 'The folder is not empty, are you sure you want to delete?'
        : `Are you sure you want to delete ${entry.type} ${entry.name}?`;

    useEffect(() => {
        if (formState.isSubmitSuccessful) {
            reset();
        }
    }, [formState.isSubmitSuccessful, reset]);

    return (
        <DialogContent className="sm:max-w-[425px]">
            <Form reset={reset} formState={formState} {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="gap-4 flex flex-col"
                >
                    <DialogHeader>
                        <DialogTitle>Delete {entry.type}</DialogTitle>
                        <DialogDescription>{description} </DialogDescription>
                    </DialogHeader>
                    <FormField
                        control={form.control}
                        name="confirm"
                        render={({ field }) => (
                            <FormItem
                                className="flex flex-row items-start space-x-3 space-y-0"
                            >
                                <FormControl>
                                    <Checkbox {...field} value={field.value?.toString()} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="font-normal">
                                    Delete this {entry.type} and all its content.
                                </FormLabel>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <Button disabled={!formState.isValid}> Delete </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
}
