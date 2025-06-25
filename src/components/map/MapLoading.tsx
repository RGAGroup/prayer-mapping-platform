
const MapLoading = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-800 font-medium">Carregando mapa global...</p>
        <p className="text-sm text-gray-600 mt-2">Conectando com dados de intercessão</p>
      </div>
    </div>
  );
};

export default MapLoading;
