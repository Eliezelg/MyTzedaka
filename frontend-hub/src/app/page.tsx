// Page racine qui sert le contenu par défaut
export default function RootPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Bienvenue
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Hub Central - Portail Donateur Unifié
        </p>
        <div className="bg-blue-50 p-6 rounded-lg">
          <p className="text-blue-700">
            🎉 Système d'internationalisation configuré avec succès !
          </p>
          <p className="text-blue-600 mt-2">
            Accédez à <a href="/fr" className="underline">la version française</a> ou 
            <a href="/he" className="underline ml-1">la version hébraïque</a>
          </p>
        </div>
      </div>
    </div>
  )
}
