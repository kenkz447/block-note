import { useCurrentUser } from '@/libs/auth';
import { SettingHeader } from './SettingHeader';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/libs/shadcn-ui/components/form';
import { Input } from '@/libs/shadcn-ui/components/input';
import { Button } from '@/libs/shadcn-ui/components/button';
import { updateProfile } from 'firebase/auth';

export function AccountSetting() {
    const { currentUser } = useCurrentUser();

    const defaultValues = {
        displayName: currentUser?.displayName
    };

    const form = useForm({
        defaultValues
    });

    const onSubmit = async (data: typeof defaultValues) => {
        await updateProfile(currentUser!, {
            displayName: data.displayName
        });

        form.reset(data, {
            keepValues: true
        });
    };

    return (
        <div>
            <SettingHeader
                title="Account"
                description="Manage your account settings"
            />
            <div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>

                        <h4 className="text-md font-semibold text-secondary-foreground mb-4">My profile</h4>
                        <FormField
                            control={form.control}
                            name="displayName"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-4">
                                    <div className="grow">
                                        <FormLabel>Display name</FormLabel>
                                        <FormDescription>What do people call you?</FormDescription>
                                    </div>
                                    <FormControl className="max-w-[250px]" >
                                        <Input {...field} />
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
            </div>
        </div>
    );
}
