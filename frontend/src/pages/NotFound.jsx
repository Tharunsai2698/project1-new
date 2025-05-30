import React from "react";

export default function NotFound() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-4">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">404</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">Page not found</p>
      </div>
    </div>
  );
}
