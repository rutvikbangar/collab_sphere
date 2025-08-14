import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomFiles, uploadFile } from '../../api-service/api';
import { FaFileAlt, FaUpload, FaDownload, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

function FileDetailPage() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    const fetchFiles = async () => {
        setIsLoading(true);
        const response = await getRoomFiles(roomId);
        if (response) {
            setFiles(response);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchFiles();
    }, [roomId]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const response = await uploadFile(roomId, file);
        if (response) {
            await fetchFiles();
            toast.success('File uploaded successfully!');
        }
        setIsUploading(false);
        event.target.value = null; // Reset file input
    };

    const handleDownload = async (file) => {
        try {
            // Ensure the filename has .pdf extension
            let downloadFilename = file.fileName;
            if (!downloadFilename.toLowerCase().endsWith('.pdf')) {
                downloadFilename = `${downloadFilename}.pdf`;
            }
            
            // Fetch the file content
            const response = await fetch(file.url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch file');
            }
            
            // Get the blob from response
            const blob = await response.blob();
            
            // Create a new blob with PDF mime type to ensure proper file type
            const pdfBlob = new Blob([blob], { type: 'application/pdf' });
            
            // Create object URL for the blob
            const url = window.URL.createObjectURL(pdfBlob);
            
            // Create temporary anchor element and trigger download
            const a = document.createElement('a');
            a.href = url;
            a.download = downloadFilename; // This will be the filename with .pdf extension
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            toast.success(`Downloaded ${downloadFilename}`);
        } catch (error) {
            console.error('Download error:', error);
            
            // Fallback: Open URL directly in new tab
            // The fl_attachment flag should force download
            window.open(file.url, '_blank');
            toast.info('Opening file in new tab...');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg text-gray-600">Loading files...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-8 px-6 bg-gray-50 min-h-screen space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Room Files</h1>
                    <p className="text-gray-600">Upload and manage files for this room</p>
                </div>

                {/* Upload Button */}
                <div className="relative">
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        accept="application/pdf"
                    />
                    <label
                        htmlFor="file-upload"
                        className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        <FaUpload className="mr-2" />
                        {isUploading ? 'Uploading...' : 'Upload File'}
                    </label>
                </div>
            </div>

            {/* Files List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {files.length === 0 ? (
                    <div className="text-center py-12">
                        <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No files</h3>
                        <p className="mt-1 text-sm text-gray-500">Upload files to get started</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {files.map((file) => (
                            <li
                                key={file._id}
                                className="p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FaFileAlt className="h-5 w-5 text-gray-400" />
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">
                                                {file.fileName}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                PDF • Uploaded on {new Date(file.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Download button */}
                                    <button
                                        onClick={() => handleDownload(file)}
                                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        <FaDownload className="mr-2" />
                                        Download
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default FileDetailPage;