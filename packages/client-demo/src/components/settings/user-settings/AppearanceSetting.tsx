import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/libs/shadcn-ui/components/form';
import { SettingHeader } from '../_shared/SettingHeader';
import { useForm } from 'react-hook-form';
import { Tabs, TabsList, TabsTrigger } from '@/libs/shadcn-ui/components/tab';
import { useEffect, useMemo } from 'react';
import { useTheme } from '@writefy/client-shared';

export function AppearanceSetting() {
    const { setTheme, theme } = useTheme();

    const defaultValues = useMemo(() => {
        return {
            colorMode: theme,
        };
    }, [theme]);

    const form = useForm({
        defaultValues,
    });

    const colorMode = form.watch('colorMode');

    useEffect(() => {
        setTheme(colorMode);
    }, [setTheme, colorMode]);

    return (
        <div>
            <SettingHeader
                title="Appearance"
                description="Customize the appearance of the application"
            />
            <div>
                <Form {...form}>
                    <h4 className="text-md font-semibold text-secondary-foreground mb-4">Theme</h4>
                    <FormField
                        control={form.control}
                        name="colorMode"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-4">
                                <div className="grow">
                                    <FormLabel>Color mode</FormLabel>
                                    <FormDescription>Chose color mode</FormDescription>
                                </div>
                                <FormControl>
                                    <Tabs value={field.value} onValueChange={field.onChange}>
                                        <TabsList className="grid w-full grid-cols-3">
                                            <TabsTrigger value="light">Light</TabsTrigger>
                                            <TabsTrigger value="dark">Dark</TabsTrigger>
                                            <TabsTrigger value="system">System</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </Form>
            </div>
        </div>
    );
}
