import { Button, Input, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogContent, Form, FormControl, FormField, FormItem, FormMessage } from '@writefy/client-shadcn';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface CreateProjectValues {
    readonly name: string;
}

interface CreateProjectFormProps {
    readonly onSubmit: (data: CreateProjectValues) => void;
}

const createSchema = z.object({
    name: z.string().min(1),
});

const defaultValues: CreateProjectValues = {
    name: ''
};

export function CreateProjectForm({ onSubmit }: CreateProjectFormProps) {
    const {
        reset,
        formState,
        ...form
    } = useForm<CreateProjectValues>({
        resolver: zodResolver(createSchema),
        defaultValues
    });


    return (
        <DialogContent className="sm:max-w-[425px]">
            <Form reset={reset} formState={formState} {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="gap-4 flex flex-col"
                >
                    <DialogHeader>
                        <DialogTitle>Create project</DialogTitle>
                        <DialogDescription>
                            Start a new project
                        </DialogDescription>
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
