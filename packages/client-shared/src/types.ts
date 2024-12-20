type TestEvent = 'testEvent'; // Test event for testing purposes

type AuthEvent = 'AUTH:LOGGED_IN' | 'AUTH:LOGGED_OUT';

type PopupEvent = 'popup-alert:show' | 'popup-alert:hide' | 'popup-dialog:show' | 'popup-dialog:hide';

type EditorEvent = 'EDITOR:PRESENTATION';

type DataEvent = 'DATA@ENTRY:REMOVED';

type UiEvent = 'UI@ENTRY_FROM:SHOW';

export type AppEvent = TestEvent | AuthEvent | PopupEvent | EditorEvent | DataEvent | UiEvent;
