import { useState, useRef } from "react";
import { uploadDocument } from "../api";
import { FaUpload, FaFilePdf, FaTimes, FaCheck, FaExclamationTriangle, FaSpinner } from "react-icons/fa";

type Props = { 
  token: string;
  darkMode?: boolean;
};

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function Upload({ token, darkMode = false }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return "Only PDF files are accepted.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File must be less than 10MB.";
    }
    return null;
  };

  const handleFileSelect = (selectedFile: File) => {
    const error = validateFile(selectedFile);
    if (error) {
      setStatus(error);
      setUploadStatus('error');
      return;
    }
    
    setFile(selectedFile);
    setStatus("");
    setUploadStatus('idle');
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("Please choose a PDF file.");
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    setStatus("");
    setProgress(0);
    
    // Progress simulation (replace with real progress if your API supports it)
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 30, 90));
    }, 200);

    try {
      const res = await uploadDocument(file, token);
      clearInterval(progressInterval);
      setProgress(100);
      setStatus(res.summary);
      setUploadStatus('success');
    } catch (e: any) {
      clearInterval(progressInterval);
      setProgress(0);
      setStatus(`Upload failed: ${e.message}`);
      setUploadStatus('error');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setStatus("");
    setUploadStatus('idle');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <FaSpinner className="animate-spin text-blue-600" />;
      case 'success':
        return <FaCheck className="text-green-600" />;
      case 'error':
        return <FaExclamationTriangle className="text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'success':
        return darkMode 
          ? 'bg-green-900/50 border-green-700 text-green-400' 
          : 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return darkMode 
          ? 'bg-red-900/50 border-red-700 text-red-400' 
          : 'bg-red-50 border-red-200 text-red-800';
      default:
        return darkMode 
          ? 'bg-blue-900/50 border-blue-700 text-blue-400' 
          : 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`max-w-2xl mx-auto mt-10 p-8 rounded-2xl shadow-lg border ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="text-center mb-6">
        <h3 className={`text-3xl font-bold mb-2 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>Upload PDF</h3>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Drag and drop your file or click to select
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${dragActive 
            ? darkMode 
              ? 'border-blue-400 bg-blue-900/30' 
              : 'border-blue-400 bg-blue-50'
            : file 
              ? darkMode 
                ? 'border-green-400 bg-green-900/30' 
                : 'border-green-300 bg-green-50'
              : darkMode
                ? 'border-gray-600 bg-gray-700/50 hover:border-gray-500 hover:bg-gray-700'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!file ? (
          <>
            <FaFilePdf className={`mx-auto text-6xl mb-4 ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <p className={`text-lg mb-4 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {dragActive ? "Release to drop the file" : "Drag and drop your PDF here"}
            </p>
            <p className={`text-sm mb-4 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>or</p>
            <label className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors font-medium">
              <FaFilePdf />
              Browse Files
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </label>
            <p className={`text-xs mt-3 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>PDF only, max 10MB</p>
          </>
        ) : (
          <div className={`flex items-center justify-between p-4 rounded-lg border ${
            darkMode 
              ? 'bg-gray-700 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <FaFilePdf className="text-red-600 text-2xl" />
              <div className="text-left">
                <p className={`font-medium truncate max-w-xs ${
                  darkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>{file.name}</p>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className={`p-2 rounded-full transition-colors ${
                darkMode 
                  ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20' 
                  : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
              }`}
              title="Remove file"
            >
              <FaTimes />
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {uploadStatus === 'uploading' && (
        <div className="mt-6">
          <div className={`flex justify-between text-sm mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <span>Uploading...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className={`w-full rounded-full h-2 ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleUpload}
          disabled={uploadStatus === 'uploading' || !file}
          className={`
            flex items-center gap-3 px-8 py-3 rounded-lg font-medium transition-all duration-200
            ${uploadStatus === 'uploading' || !file
              ? darkMode 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:-translate-y-0.5'
            }
          `}
        >
          {uploadStatus === 'uploading' ? (
            <>
              <FaSpinner className="animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <FaUpload />
              Upload PDF
            </>
          )}
        </button>
      </div>

      {/* Status Message */}
      {status && (
        <div className={`mt-6 p-6 border rounded-xl ${getStatusColor()}`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getStatusIcon()}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                {uploadStatus === 'success' && "✅ Document analyzed successfully"}
                {uploadStatus === 'error' && "❌ Upload error"}
                {uploadStatus === 'uploading' && "⏳ Analyzing..."}
              </h4>
              <div className="whitespace-pre-wrap leading-relaxed">
                {status}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}