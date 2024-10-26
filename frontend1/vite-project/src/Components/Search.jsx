import React, { useState } from 'react';

const Search = ({ placeholder = "Ask a question about your document" }) => {
  const [inputValue, setInputValue] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('document', selectedFile);

    try {
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setError('Document uploaded successfully!');
    } catch (error) {
      setError('Error uploading document: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!inputValue) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: inputValue }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnswer(data.answer);
      setInputValue('');
    } catch (error) {
      setError('Error getting answer: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      {/* File Upload Section */}
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF, DOC, or TXT</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt"
          />
        </label>
      </div>

      {/* Question Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
        <div className="flex items-center w-full bg-white rounded-full shadow-md overflow-hidden">
          <input
            type="text"
            className="w-full p-4 text-gray-700 focus:outline-none"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="p-4 hover:bg-gray-100 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-t-2 border-blue-500 border-solid rounded-full animate-spin" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 4.35a7.5 7.5 0 010 10.6z"
                />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Error/Success Messages */}
      {error && (
        <div className={`p-4 rounded-lg ${error.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {error}
        </div>
      )}

      {/* Answer Display */}
      {answer && (
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h3 className="font-semibold mb-2">Answer:</h3>
          <p className="text-gray-700">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default Search;