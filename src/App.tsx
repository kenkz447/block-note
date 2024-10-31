import './App.css'

import { SidebarInset, SidebarProvider } from './components/ui/sidebar';
import { AppSidebar } from './components/side-bar/app-sidebar';
import { TopBar } from './components/top-bar/TopBar';
import { EditorContainer, EditorProvider } from './libs/editor';

export default function App() {
  return (
    <EditorProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopBar />
          <EditorContainer />
        </SidebarInset>
      </SidebarProvider>
    </EditorProvider>
  );
}
