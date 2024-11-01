import './App.css'
import './tree.css'

import { SidebarInset, SidebarProvider } from './components/ui/sidebar';
import { AppSidebar } from './components/side-bar/app-sidebar';
import { TopBar } from './components/top-bar/TopBar';
import { EditorContainer, EditorProvider } from './libs/editor';
import { RxdbProvider } from './libs/rxdb/components/rxdb-provider';
import { PopupProvider } from './libs/popup';

export default function App() {
  return (
    <PopupProvider>
      <RxdbProvider>
        <EditorProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <TopBar />
              <EditorContainer />
            </SidebarInset>
          </SidebarProvider>
        </EditorProvider>
      </RxdbProvider>
    </PopupProvider>
  );
}
