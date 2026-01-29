// TEMPORARY TEST PAGE - DELETE AFTER TESTING
export default function WelcomeTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900">
          ✅ Welcome Page Route Works!
        </h1>
        <p className="text-center text-gray-600 mt-4">
          If you can see this, the route is configured correctly.
        </p>
        <p className="text-center text-red-600 mt-4 font-semibold">
          The issue is with authentication/role checks in the real Welcome component.
        </p>
      </div>
    </div>
  );
}
