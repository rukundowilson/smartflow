"use client";

import Link from "next/link";

export default function PrototypeLinks() {
  const prototypes = [
    {
      name: "Super Admin Dashboard",
      path: "/administration/superadmin/overview",
      description: "Access and manage all HR users and system configurations.",
      new: false,
    },
    {
      name: "HR Dashboard",
      path: "/administration/hr",
      description: "Review employee registration requests and initiate access approvals.",
      new: false,
    },
    {
      name: "IT Department Dashboard",
      path: "/departments/it-department/overview",
      description: "Grant/revoke system access, handle IT tickets and equipment requests.",
      new: false,
    },
    {
      name: "Other Departments Dashboard",
      path: "/departments/others/overview",
      description: "Make item requisitions and issue reports, track their progress.",
      new: true,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center text-sky-700">
          This page is designed to navigate to pages in absence of authentication just for prototype and will be removed.
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prototypes.map(({ name, path, description, new: isNew }) => (
            <Link key={path} href={path} className="block">
              <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 border border-gray-200">
                {isNew && (
                  <span className="inline-block mb-2 text-xs font-semibold text-white bg-green-500 px-2 py-1 rounded-full">
                    New Feature
                  </span>
                )}
                <h2 className="text-xl font-semibold text-sky-800 mb-2">{name}</h2>
                <p className="text-gray-600 text-sm mb-3">{description}</p>
                <span className="text-blue-600 font-medium">View Page →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
