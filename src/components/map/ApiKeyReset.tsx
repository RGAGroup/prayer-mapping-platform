
interface ApiKeyResetProps {
  onReset: () => void;
}

const ApiKeyReset = ({ onReset }: ApiKeyResetProps) => {
  return (
    <button
      onClick={onReset}
      className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-2 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors shadow-lg"
    >
      Alterar API Key
    </button>
  );
};

export default ApiKeyReset;
