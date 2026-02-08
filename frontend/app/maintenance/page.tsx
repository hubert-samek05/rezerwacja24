export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Przepraszamy za utrudnienia</h1>
          <p className="text-lg text-gray-700 mb-6">
            W tej chwili trwają prace konserwacyjne. Prosimy o cierpliwość, wkrótce wracamy!
          </p>
          <div className="animate-pulse text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-2">Prace w toku...</p>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500">
            W razie pytań prosimy o kontakt pod adresem: <a href="mailto:kontakt@rezerwacja24.pl" className="text-blue-600 hover:underline">kontakt@rezerwacja24.pl</a>
          </p>
        </div>
      </div>
    </div>
  );
}
