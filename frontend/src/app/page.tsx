import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8 text-center">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Create Your Perfect Digital Invitation
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Design beautiful, custom online invitations with our easy-to-use drag-and-drop editor. Perfect for weddings, birthdays, and any special event. Get started in seconds.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/create"
            className="rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Create Your Invitation Now
          </Link>
        </div>
      </div>
    </main>
  );
}