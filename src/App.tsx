import { useEffect } from 'react';
import './App.css'

import { Editor } from './components/Editor'; 
import { SidebarInset, SidebarProvider } from './components/ui/sidebar';
import { AppSidebar } from './components/AppSideBar';

export default function App() {
  useEffect(() => {
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className='py-3'>
          <Editor />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
