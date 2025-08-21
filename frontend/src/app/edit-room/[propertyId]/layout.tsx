import React from 'react';
import SidebarEditRoom from '@/components/SidebarEditRoom';
import Header from '@/components/SubHeader';

// layout wraps nested pages under /edit-room/[propertyId]
export default async function EditRoomLayout(props: { children: React.ReactNode; params: { propertyId: string } }) {
  const { children, params } = await props as any;
  const basePath = `/edit-room/${params.propertyId}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Top header */}
        <Header />

  <div className="mx-auto grid grid-cols-12 gap-6 px-6 py-8 h-[calc(100vh-80px)]">
        {/* Sidebar (left) */}
        <div className="col-span-4">
          <SidebarEditRoom basePath={basePath} currentSection={undefined} property={undefined} />
        </div>

        {/* vertical divider */}
        {/* <div className="bg-gray-200" /> */}

        {/* Main content (right) */}
        <main className="col-span-8 bg-white rounded-lg h-full flex flex-col">
          {/* content area provides full height to children so pages can fill it; allow internal scrolling */}
          {/* <div className="h-full p-4 overflow-auto relative"> */}
            {children}
          {/* </div> */}
          <div className="border-t" />
        </main>
      </div>
    </div>
  );
}
