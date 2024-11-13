import { AuthContext, AuthContextType } from "@/libs/auth";
import { EditorContext, EditorContextType } from "@/libs/editor/editorContext";
import { RxdbContext, RxdbContextType } from "@/libs/rxdb/rxdbContexts";
import { PropsWithChildren } from "react";

interface ContextProviderProps {
    readonly authContext: AuthContextType;
    readonly rxdbContext: RxdbContextType;
    readonly editorContext: EditorContextType;
}

export function ContextProvider({
    authContext,
    rxdbContext,
    editorContext,
    children
}: PropsWithChildren<ContextProviderProps>) {
    return (
        <AuthContext.Provider value={authContext}>
            <RxdbContext.Provider value={rxdbContext}>
                <EditorContext.Provider value={editorContext}>
                    {children}
                </EditorContext.Provider>
            </RxdbContext.Provider>
        </AuthContext.Provider>
    )
}
