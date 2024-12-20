import { Button, Input, Form, FormControl, FormField, FormItem, FormMessage, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogContent } from '@writefy/client-shadcn';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export interface CreateEntryValues {
    readonly name: string;
}

interface CreateEntryFormProps {
    readonly type: string;
    readonly onSubmit: (data: CreateEntryValues) => void;
}

const createSchema = z.object({
    name: z.string().min(1),
});

export function CreateEntryForm({ type, onSubmit }: CreateEntryFormProps) {
    const {
        reset,
        formState,
        ...form
    } = useForm<CreateEntryValues>({
        resolver: zodResolver(createSchema),
        defaultValues: {
            name: ''
        }
    });

    const description = type === 'folder' ? 'Create a folder to organize your documents' : 'Create a new document';

    return (
        <DialogContent className="sm:max-w-[425px]">
            <Form reset={reset} formState={formState} {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="gap-4 flex flex-col"
                >
                    <DialogHeader>
                        <DialogTitle>New {type}</DialogTitle>
                        <DialogDescription>{description} </DialogDescription>
                    </DialogHeader>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <Button type="submit" disabled={!formState.isValid}>
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
}
