import { useTheme, Tabs, TabsList, TabsTrigger, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Separator } from '@writefy/client-shadcn';
import { SettingHeader } from '../_shared/SettingHeader';
import { useForm } from 'react-hook-form';
import { useEffect, useMemo } from 'react';
import { useLocalSettings } from '@writefy/client-shared';

export function AppearanceSetting() {
    const { settings, setSettings } = useLocalSettings();
    const { setTheme, theme } = useTheme();

    const defaultValues = useMemo(() => {
        return {
            colorMode: theme,
            editor: settings
        };
    }, [theme, settings]);

    const form = useForm({
        defaultValues,
    });

    const colorMode = form.watch('colorMode');
    const editor = form.watch('editor');

    useEffect(() => {
        setTheme(colorMode);
    }, [setTheme, colorMode]);

    useEffect(() => {
        setSettings('pageWidth', editor.pageWidth);
    }, [editor.pageWidth, setSettings]);

    return (
        <div>
            <SettingHeader
                title="Appearance"
                description="Customize the appearance of the application"
            />
            <div className="flex flex-col gap-8">
                <Form {...form}>
                    <div>
                        <h4 className="text-md text-primary/50 mb-4">Theme</h4>
                        <FormField
                            control={form.control}
                            name="colorMode"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-4">
                                    <div className="grow">
                                        <FormLabel>Color mode</FormLabel>
                                        <FormDescription>Choose the right one for your eyes</FormDescription>
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
                    </div>
                    <Separator />
                    <div>
                        <h4 className="text-md text-primary/50 mb-4">Editor</h4>
                        <FormField
                            control={form.control}
                            name="editor.pageWidth"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-4">
                                    <div className="grow">
                                        <FormLabel>Page width</FormLabel>
                                        <FormDescription>How it fit with your screen</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Tabs value={field.value as string} onValueChange={field.onChange}>
                                            <TabsList className="grid w-full grid-cols-3">
                                                <TabsTrigger value="50%">50%</TabsTrigger>
                                                <TabsTrigger value="75%">75%</TabsTrigger>
                                                <TabsTrigger value="100%">100%</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </Form>
            </div>
        </div>
    );
}
