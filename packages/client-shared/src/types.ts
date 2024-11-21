type TestEvent = 'testEvent'; // Test event for testing purposes

type AuthEvent = 'AUTH:LOGGED_IN' | 'AUTH:LOGGED_OUT';

export type AppEvent = TestEvent | AuthEvent;
