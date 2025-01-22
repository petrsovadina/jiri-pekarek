interface ErrorStateProps {
  error: string;
}

export const ErrorState = ({ error }: ErrorStateProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-red-500 mb-2">{error}</p>
        <p className="text-gray-500">
          Zkontrolujte, zda máte přístup k tomuto souboru a zkuste to znovu
        </p>
      </div>
    </div>
  );
};