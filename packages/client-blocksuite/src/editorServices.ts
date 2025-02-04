import type {
    PeekOptions,
    PeekViewService,
} from '@blocksuite/affine-components/peek';
import type { AffineEditorContainer } from '@blocksuite/presets';
import type { TemplateResult } from 'lit';

import { PeekViewExtension } from '@blocksuite/affine-components/peek';
import { BlockComponent } from '@blocksuite/block-std';
import {
    ColorScheme,
    type DocMode,
    type DocModeProvider,
    matchFlavours,
    type NotificationService,
    type ParseDocUrlService,
    type ThemeExtension,
    toast,
} from '@blocksuite/blocks';
import { type DocCollection, Slot } from '@blocksuite/store';
import { signal } from '@preact/signals-core';

import type { AttachmentViewerPanel } from './elements/AttachmentViewerPanel';

function getModeFromStorage() {
    const mapJson = localStorage.getItem('playground:docMode');
    const mapArray = mapJson ? JSON.parse(mapJson) : [];
    return new Map<string, DocMode>(mapArray);
}

function saveModeToStorage(map: Map<string, DocMode>) {
    const mapArray = Array.from(map);
    const mapJson = JSON.stringify(mapArray);
    localStorage.setItem('playground:docMode', mapJson);
}

export function removeModeFromStorage(docId: string) {
    const modeMap = getModeFromStorage();
    modeMap.delete(docId);
    saveModeToStorage(modeMap);
}

const DEFAULT_MODE: DocMode = 'page';
const slotMap = new Map<string, Slot<DocMode>>();

export function mockDocModeService(
    getEditorModeCallback: () => DocMode,
    setEditorModeCallback: (mode: DocMode) => void
) {
    const docModeService: DocModeProvider = {
        getPrimaryMode: (docId: string) => {
            try {
                const modeMap = getModeFromStorage();
                return modeMap.get(docId) ?? DEFAULT_MODE;
            } catch {
                return DEFAULT_MODE;
            }
        },
        onPrimaryModeChange: (handler: (mode: DocMode) => void, docId: string) => {
            if (!slotMap.get(docId)) {
                slotMap.set(docId, new Slot());
            }
            return slotMap.get(docId)!.on(handler);
        },
        getEditorMode: () => {
            return getEditorModeCallback();
        },
        setEditorMode: (mode: DocMode) => {
            setEditorModeCallback(mode);
        },
        setPrimaryMode: (mode: DocMode, docId: string) => {
            const modeMap = getModeFromStorage();
            modeMap.set(docId, mode);
            saveModeToStorage(modeMap);
            slotMap.get(docId)?.emit(mode);
        },
        togglePrimaryMode: (docId: string) => {
            const mode =
                docModeService.getPrimaryMode(docId) === 'page' ? 'edgeless' : 'page';
            docModeService.setPrimaryMode(mode, docId);
            return mode;
        },
    };
    return docModeService;
}

export function mockNotificationService(editor: AffineEditorContainer) {
    const notificationService: NotificationService = {
        toast: (message, options) => {
            toast(editor.host!, message, options?.duration);
        },
        confirm: notification => {
            return Promise.resolve(confirm(notification.title.toString()));
        },
        prompt: notification => {
            return Promise.resolve(
                prompt(notification.title.toString(), notification.autofill?.toString())
            );
        },
        notify: notification => {
            // todo: implement in playground
            console.log(notification);
        },
    };
    return notificationService;
}

export function mockParseDocUrlService(collection: DocCollection) {
    const parseDocUrlService: ParseDocUrlService = {
        parseDocUrl: (url: string) => {
            if (url && URL.canParse(url)) {
                const path = new URL(url).pathname;
                const item =
                    path.length > 1
                        ? [...collection.docs.values()].find(doc => {
                            return doc.meta?.title === path.slice(1);
                        })
                        : null;
                if (item) {
                    return {
                        docId: item.id,
                    };
                }
            }
            return;
        },
    };
    return parseDocUrlService;
}

export class MockEditorTheme {
    theme$ = signal(ColorScheme.Light);

    setTheme(theme: ColorScheme) {
        this.theme$.value = theme;
    }

    toggleTheme() {
        const theme =
            this.theme$.value === ColorScheme.Dark
                ? ColorScheme.Light
                : ColorScheme.Dark;
        this.theme$.value = theme;
    }
}

export const editorTheme = new MockEditorTheme();

export const themeExtension: ThemeExtension = {
    getAppTheme() {
        return editorTheme.theme$;
    },
    getEdgelessTheme() {
        return editorTheme.theme$;
    },
};

export function mockPeekViewExtension(
    attachmentViewerPanel: AttachmentViewerPanel
) {
    return PeekViewExtension({
        peek(
            element: {
                target: HTMLElement;
                docId: string;
                blockIds?: string[];
                template?: TemplateResult;
            },
            options?: PeekOptions
        ) {
            const { target } = element;

            if (target instanceof BlockComponent) {
                if (matchFlavours(target.model, ['affine:attachment'])) {
                    attachmentViewerPanel.open(target.model);
                    return Promise.resolve();
                }
            }

            alert('Peek view not implemented in playground');
            console.log('peek', element, options);

            return Promise.resolve();
        },
    } satisfies PeekViewService);
}
