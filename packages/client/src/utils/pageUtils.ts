export const setPageTitle = (title?: string) => {
    if (!title) {
        document.title = 'Wri';
        return;
    }

    document.title = `${title} - Wri`;
};
