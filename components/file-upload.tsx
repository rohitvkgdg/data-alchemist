interface FileUploadProps {
    onFileSelect?: (file: File) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && onFileSelect) {
            onFileSelect(file);
        }
    };

    return (
        <div className="flex items-center justify-center">
            <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Upload CSV or Excel
                <input
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </label>
        </div>
    );
}