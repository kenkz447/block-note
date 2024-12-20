import { AffineEditorContainer } from '@blocksuite/presets';
import { DocCollection } from '@blocksuite/store';
import { AttachmentBlockService, CommunityCanvasTextFonts, DocModeExtension, EdgelessEditorBlockSpecs, FontConfigExtension, NotificationExtension, OverrideThemeExtension, PageEditorBlockSpecs, ParseDocUrlExtension, RefNodeSlotsExtension, SpecProvider } from '@blocksuite/blocks';
import { mockDocModeService, mockNotificationService, mockParseDocUrlService, themeExtension } from '../editorServices';
import {
    BlockFlavourIdentifier,
    BlockServiceIdentifier,
    type ExtensionType,
    StdIdentifier,
} from '@blocksuite/block-std';

class CustomAttachmentBlockService extends AttachmentBlockService {
    override mounted(): void {
        super.mounted();
        this.maxFileSize = 100 * 1000 * 1000; // 100MB
    }
}

export function getCustomAttachmentSpecs() {
    const pageModeSpecs: ExtensionType[] = [
        ...PageEditorBlockSpecs,
        {
            setup: di => {
                di.override(
                    BlockServiceIdentifier('affine:attachment'),
                    CustomAttachmentBlockService,
                    [StdIdentifier, BlockFlavourIdentifier('affine:attachment')]
                );
            },
        },
    ];
    const edgelessModeSpecs: ExtensionType[] = [
        ...EdgelessEditorBlockSpecs,
        {
            setup: di => {
                di.override(
                    BlockServiceIdentifier('affine:attachment'),
                    CustomAttachmentBlockService,
                    [StdIdentifier, BlockFlavourIdentifier('affine:attachment')]
                );
            },
        },
    ];

    return {
        pageModeSpecs,
        edgelessModeSpecs,
    };
}

export function getExampleSpecs() {
    const params = new URLSearchParams(location.search);

    const type = params.get('exampleSpec');

    let pageModeSpecs = PageEditorBlockSpecs;
    let edgelessModeSpecs = EdgelessEditorBlockSpecs;

    if (type === 'attachment') {
        const specs = getCustomAttachmentSpecs();
        pageModeSpecs = specs.pageModeSpecs;
        edgelessModeSpecs = specs.edgelessModeSpecs;
    }

    return {
        pageModeSpecs,
        edgelessModeSpecs,
    };
}

function patchPageRootSpec(editor: AffineEditorContainer, collection: DocCollection, spec: ExtensionType[]) {
    const setEditorModeCallBack = editor.switchEditor.bind(editor);
    const getEditorModeCallback = () => editor.mode;
    const newSpec: typeof spec = [
        ...spec,
        DocModeExtension(
            mockDocModeService(getEditorModeCallback, setEditorModeCallBack)
        ),
        OverrideThemeExtension(themeExtension),
        ParseDocUrlExtension(mockParseDocUrlService(collection)),
        NotificationExtension(mockNotificationService(editor)),
        FontConfigExtension(CommunityCanvasTextFonts)
    ];
    return newSpec;
}

export const setupEditor = (collection: DocCollection, docId: string) => {
    const doc = collection!.getDoc(docId);
    if (!doc) {
        throw new Error('Doc not found: ' + docId);
    }

    doc.load();
    doc.resetHistory();

    const editor = new AffineEditorContainer();
    const specs = getExampleSpecs();
    const refNodeSlotsExtension = RefNodeSlotsExtension();
    editor.pageSpecs = patchPageRootSpec(editor, collection, [
        refNodeSlotsExtension,
        ...specs.pageModeSpecs,
    ]);
    editor.edgelessSpecs = patchPageRootSpec(editor, collection, [
        refNodeSlotsExtension,
        ...specs.edgelessModeSpecs,
    ]);
    SpecProvider.getInstance().extendSpec('edgeless:preview', [
        OverrideThemeExtension(themeExtension),
    ]);

    editor.doc = doc;
    editor.mode = 'page';

    return editor;
};
