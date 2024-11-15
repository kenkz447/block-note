import { Button } from '@/libs/shadcn-ui/components/button';
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogContent } from '@/libs/shadcn-ui/components/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/libs/shadcn-ui/components/form';
import { Input } from '@/libs/shadcn-ui/components/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface CreateWorkspaceValues {
    readonly name: string;
}

interface CreateWorkspaceFormProps {
    readonly onSubmit: (data: CreateWorkspaceValues) => void;
}

const createSchema = z.object({
    name: z.string().min(1),
});

export function CreateWorkspaceForm({ onSubmit }: CreateWorkspaceFormProps) {
    const {
        reset,
        formState,
        ...form
    } = useForm<CreateWorkspaceValues>({
        resolver: zodResolver(createSchema),
    });


    return (
        <DialogContent className="sm:max-w-[425px]">
            <Form reset={reset} formState={formState} {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="gap-4 flex flex-col"
                >
                    <DialogHeader>
                        <DialogTitle>Create workspace</DialogTitle>
                        <DialogDescription>
                            To organize your data and collaborate with others.
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
