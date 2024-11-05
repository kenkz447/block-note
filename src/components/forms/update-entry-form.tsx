import { Entry } from "@/libs/rxdb";
import { Button } from "@/libs/shadcn-ui/components/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogContent } from "@/libs/shadcn-ui/components/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/libs/shadcn-ui/components/form";
import { Input } from "@/libs/shadcn-ui/components/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface UpdateEntryValues {
    readonly name: string
}

interface UpdateEntryFormProps {
    readonly entry: Entry
    readonly onSubmit: (data: UpdateEntryValues) => void
}

const createSchema = z.object({
    name: z.string().min(1),
})

export function UpdateEntryForm({ entry, onSubmit }: UpdateEntryFormProps) {
    const defaultValues = useMemo(() => {
        return {
            name: entry.name
        }
    }, [entry])

    const {
        reset,
        formState,
        ...form
    } = useForm<UpdateEntryValues>({
        resolver: zodResolver(createSchema),
        defaultValues
    });

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
                        <DialogTitle>Update {entry.type}</DialogTitle>
                        <DialogDescription>Edit the {entry.type} name</DialogDescription>
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
                            Update
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    )
}