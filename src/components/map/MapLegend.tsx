
const MapLegend = () => {
  return (
    <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">Legenda</h3>
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm"></div>
          <span className="text-gray-600">Centro Ativo</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          <span className="text-gray-600">Movimento Espiritual</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-gray-600">Alerta</span>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;
