import React from 'react';
import { Upload } from 'lucide-react';
import { validateCSVFile } from '../services/csvService';

const UploadButton = ({ onUpload, isUploading = false, className = '' }) => {
  // Handle file selection for both CSV and PDF
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Validate file type and size
      validateCSVFile(file);

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // Handle PDF file
        handlePDFUpload();
      } else {
        // For CSV files, read and parse the content
        const reader = new FileReader();
        reader.onload = (e) => {
          const csv = e.target.result;
          const lines = csv.split('\n').map(line => line.split(','));
          onUpload({ data: lines });
        };
        reader.readAsText(file);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  // Handle PDF file upload (placeholder for now)
  const handlePDFUpload = () => {
    // For now, show a message that PDF processing is not yet implemented
    // You can integrate a PDF parsing library like pdf-parse here
    alert('PDF upload detected! PDF processing feature will be implemented soon. For now, please use CSV files.');
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="file"
        accept=".csv,.pdf,text/csv,application/pdf"
        onChange={handleFileSelect}
        disabled={isUploading}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: isUploading ? 'not-allowed' : 'pointer',
          zIndex: 1
        }}
      />
      <button
        type="button"
        disabled={isUploading}
        className={`upload-button ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          fontSize: '0.9rem',
          fontWeight: '600',
          transition: 'all 0.2s ease',
          opacity: isUploading ? 0.7 : 1,
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
          width: '100%',
          justifyContent: 'center',
          pointerEvents: 'none' // Let the file input handle clicks
        }}
        onMouseOver={(e) => {
          if (!isUploading) {
            e.target.style.backgroundColor = '#1d4ed8';
            e.target.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseOut={(e) => {
          if (!isUploading) {
            e.target.style.backgroundColor = '#2563eb';
            e.target.style.transform = 'translateY(0)';
          }
        }}
      >
        <Upload size={16} />
        {isUploading ? 'Processing...' : 'Import CSV/PDF'}
      </button>
    </div>
  );
};

export default UploadButton;
