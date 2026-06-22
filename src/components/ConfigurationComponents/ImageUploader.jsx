import { useState, useEffect, useCallback } from "react";

const ImageUploader = ({
  initialImageUrl,
  onFileChange,
  label = "Business Logo (Optional)",
}) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialImageUrl);
  
  useEffect(() => {
    if (initialImageUrl) {
      setPreviewUrl(initialImageUrl);
    }
  }, [initialImageUrl]);

  const handleFileChange = useCallback(
    (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        onFileChange(selectedFile);
      } else {
        setFile(null);
        setPreviewUrl(null);
        onFileChange(null);
      }
    },
    [onFileChange]
  );

  const handleRemoveImage = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    onFileChange(null);
  }, [onFileChange]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="mt-1 flex items-center space-x-4">
        {previewUrl ? (
          <div className="relative">
            <img
              src={`${previewUrl}`}
              alt="Logo Preview"
              className="h-16 w-16 object-contain rounded-md border border-gray-300"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 p-1 cursor-pointer bg-white rounded-full text-xs shadow-md"
            >
              <img src="/delete.png" alt="Trash Icon" className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="h-16 w-16 flex items-center justify-center border border-gray-300 rounded-md text-gray-400">
            <span className="text-xs">No Image</span>
          </div>
        )}
        <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors">
          <span>
            {file || initialImageUrl ? "Change Photo" : "Upload Photo"}
          </span>
          <input
            type="file"
            className="sr-only"
            onChange={handleFileChange}
            accept="image/*"
          />
        </label>
      </div>
    </div>
  );
};

export default ImageUploader;
