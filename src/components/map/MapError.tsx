
const MapError = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <div className="text-center">
        <p className="text-lg text-red-700 mb-2 font-medium">Erro ao carregar dados</p>
        <p className="text-sm text-red-600">Verifique sua conexão e tente novamente</p>
      </div>
    </div>
  );
};

export default MapError;
